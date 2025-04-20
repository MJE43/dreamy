import { NextResponse } from 'next/server'
import { PrismaClient, Dream } from '@/generated/prisma'
import * as z from 'zod'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"; // New path
import { dreamAnalysisSchema, StructuredDreamAnalysis } from '@/lib/schemas/dreamAnalysis';

const prisma = new PrismaClient()

// Initialize Google Generative AI
// Make sure GOOGLE_API_KEY is set in your .env file
if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY not set. Analysis feature will be disabled.");
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: dreamAnalysisSchema
    }
});

// Schema for validating incoming request body
const ingestSchema = z.object({
  description: z.string().min(10),
  mood: z.number().min(1).max(5),
  tags: z.string().optional(),
  analysisContent: z.string().optional(), // Expecting a JSON string here
})

// Function to build the prompt for Gemini
// Using Prisma's generated Dream type for better type safety
function buildPrompt(recentDreams: Dream[], newDream: Dream): string {
    // Create a deep copy to avoid modifying the original imported schema
    const schemaForPrompt = JSON.parse(JSON.stringify(dreamAnalysisSchema));
    // Check structure before potentially modifying (though not needed here)
    if (schemaForPrompt && typeof schemaForPrompt === 'object' && 'properties' in schemaForPrompt) {
        // Prompt instructions handle ignoring the top-level type
    } else {
        console.warn('Schema structure unexpected in buildPrompt (ingest)');
    }

    // System message / Analysis Instructions using template literal
    let prompt = `You are a dream analysis assistant. Analyze the following dream based on the provided history and new dream details.
Focus on psychological and archetypal lenses (Jungian, Freudian, mythic motifs).
Consider recurring themes, symbols, and emotional shifts from the history.
Provide insights and potential interpretations, but avoid definitive statements. Encourage self-reflection.

**IMPORTANT**: Respond ONLY with a valid JSON object adhering strictly to the following schema structure (ignore the top-level 'type' field in the definition below, just provide the properties within an object):

Schema Definition:
\`\`\`json
${JSON.stringify(schemaForPrompt, null, 2)}
\`\`\`

Fill all REQUIRED fields (\`summary\`, \`keySymbols\`, \`archetypes\`, \`emotionalThemes\`, \`guidedReflection\`).
Include optional fields (\`narrativeAnalysis\`, \`personalConnections\`, \`patternRecognition\`, \`analysis\`) where applicable based on the dream content. If an optional field or sub-field is not relevant, omit it from the JSON structure or set it to null where allowed by the schema.
For arrays like \`keySymbols\`, \`archetypes\`, \`emotionalThemes\`, \`personalConnections\`, aim for 3-5 items typically, but adjust based on dream complexity. Provide 3-5 \`guidedReflection\` questions. Keep string descriptions concise (1-3 sentences generally, summary 2-3 sentences max).

---\nRecent Dream History:\n`;

    // Add recent dreams for context (excluding the one just submitted)
    if (recentDreams.length > 1) {
        // Show last 3 previous dreams (recentDreams includes the new one at index 0)
        const relevantHistory = recentDreams.slice(1, 4);
        relevantHistory.forEach((dream) => {
             prompt += `- (${dream.createdAt.toLocaleDateString()}): ${dream.description.substring(0, 100)}... (Mood: ${dream.mood}, Tags: ${dream.tags || 'None'})\n`;
        });
    } else {
         prompt += "No significant recent dream history provided.\n";
    }

    prompt += `
---\nDream to Analyze:\nDescription: ${newDream.description}\nMood (1-5, 5=positive): ${newDream.mood}\nTags: ${newDream.tags || 'None'}\n---\nJSON Analysis Output:\n`; // Signal for the model to start generating JSON

    return prompt;
}

export async function POST(request: Request) {
  // Get session data
  const session = await getServerSession(authOptions)

  // Check if user is authenticated
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id; // Use the actual user ID from session

  // Check for Gemini API key (can stay here or be moved)
  if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY not set for user:", userId);
      // Decide if dream can be saved without analysis if key is missing
      return NextResponse.json({ error: "Server configuration error: Missing API Key for analysis." }, { status: 500 });
  }

  try {
    const body = await request.json()
    const validation = ingestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 })
    }

    const { description, mood, tags, analysisContent: preGeneratedAnalysisString } = validation.data

    // 1. Insert the new dream (using actual userId)
    const newDream = await prisma.dream.create({
      data: {
        description,
        mood,
        tags: tags || "",
        userId: userId, // Use the authenticated user's ID
      },
    })

    let finalAnalysisString: string | null = null;
    let analysisValid = false;

    // 2. Handle pre-generated analysis (if provided)
    if (preGeneratedAnalysisString) {
        console.log(`Processing pre-generated analysis for dream ${newDream.id} for user ${userId}.`)
        try {
            // Validate the incoming JSON string by parsing and checking required fields
            const parsedAnalysis = JSON.parse(preGeneratedAnalysisString) as StructuredDreamAnalysis;
            // Basic validation - enhance with Zod if needed
            if (!parsedAnalysis.summary || !parsedAnalysis.keySymbols || !parsedAnalysis.archetypes || !parsedAnalysis.emotionalThemes || !parsedAnalysis.guidedReflection) {
                 console.warn("Pre-generated analysis missing required fields for user:", userId, parsedAnalysis);
                 // Mark as invalid, will trigger generation below
                 analysisValid = false; 
            } else {
                finalAnalysisString = preGeneratedAnalysisString; // Store the valid JSON string
                analysisValid = true;
            }
        } catch (e) {
            console.error("Error parsing pre-generated analysis JSON for user:", userId, e);
            // Invalid JSON string provided, mark as invalid to trigger generation
            analysisValid = false;
        }
    }

    // 3. Generate analysis ONLY if a valid one wasn't provided
    if (!analysisValid) {
      console.log(`Generating analysis for dream ${newDream.id} for user ${userId}...`)
       // Fetch recent dreams for context (includes the one just created)
      const recentDreams = await prisma.dream.findMany({
          where: { userId: userId },
          orderBy: { createdAt: 'desc' },
          take: 5, // Fetch 5 to pass up to 4 previous ones (newDream + 4 history) to the prompt
      });

      // Build the prompt
      const prompt = buildPrompt(recentDreams, newDream);
      // console.log(`\n--- Gemini Prompt for user ${userId} ---\n`, prompt, "\n---------------------\n");

      // Call Gemini
      try {
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          // console.log(`\n--- Gemini Raw Response for user ${userId} ---\n`, responseText, "\n----------------------\n");

          if (!responseText) {
              console.error("Gemini response text is empty for user:", userId);
              throw new Error("Generated analysis is empty.");
          }

          // Attempt to parse and validate the response
          try {
              const generatedAnalysis = JSON.parse(responseText) as StructuredDreamAnalysis;
              if (!generatedAnalysis.summary || !generatedAnalysis.keySymbols || !generatedAnalysis.archetypes || !generatedAnalysis.emotionalThemes || !generatedAnalysis.guidedReflection) {
                  console.warn("Gemini response missing required fields for user:", userId, generatedAnalysis);
                  throw new Error("Generated analysis response is missing required fields.");
              }
              finalAnalysisString = responseText; // Store the valid JSON string
              analysisValid = true;
              console.log(`Successfully generated and validated analysis for user ${userId}`)
          } catch (parseOrValidationError) {
              console.error("Failed to parse or validate Gemini JSON response for user:", userId, parseOrValidationError, "Raw text:", responseText);
              // Fallback: Attempt to extract from markdown
              const jsonMatch = responseText.match(/```json\n([^\s\S]*?)\n```/);
              if (jsonMatch && jsonMatch[1]) {
                  try {
                      const extractedAnalysis = JSON.parse(jsonMatch[1]) as StructuredDreamAnalysis;
                      if (!extractedAnalysis.summary || !extractedAnalysis.keySymbols || !extractedAnalysis.archetypes || !extractedAnalysis.emotionalThemes || !extractedAnalysis.guidedReflection) {
                           console.warn("Extracted Gemini response missing required fields for user:");
                           throw new Error("Extracted analysis response is missing required fields.");
                      }
                      finalAnalysisString = jsonMatch[1]; // Store extracted valid JSON string
                      analysisValid = true;
                      console.warn("Used analysis extracted from markdown block for user:", userId);
                  } catch (fallbackError) {
                      console.error("Failed to parse/validate extracted JSON for user:", userId, fallbackError);
                      analysisValid = false; // Failed validation
                  }
              } else {
                  analysisValid = false; // Failed validation (no JSON found)
              }
          }

      } catch (geminiError) {
          console.error(`Error calling Gemini API or processing response for user ${userId}:`, geminiError);
          analysisValid = false;
          // Store error details maybe? For now, just mark as invalid.
      }
    } else {
        console.log(`Using valid pre-generated analysis for dream ${newDream.id} for user ${userId}.`)
    }

    // 4. Persist analysis ONLY if we have a valid JSON string
    if (analysisValid && finalAnalysisString) {
        try {
            await prisma.analysis.create({
                data: {
                    dreamId: newDream.id,
                    content: finalAnalysisString, // Store the validated JSON string
                },
            });
             console.log(`Analysis persisted for dream ${newDream.id}`)
        } catch (dbError) {
             console.error(`Failed to save analysis to DB for dream ${newDream.id}:`, dbError);
             // Analysis was valid but couldn't be saved. Mark persisted as false.
             analysisValid = false; 
        }
    } else {
         console.log(`No valid analysis to persist for dream ${newDream.id}`);
    }

    // Return success, indicating dream saved and whether analysis was successfully generated/validated AND persisted
    return NextResponse.json({
        ok: true,
        dreamId: newDream.id,
        analysisPersisted: analysisValid // Was a valid analysis successfully saved?
    }, { status: 201 })

  } catch (error) {
    console.error(`Error in /api/ingest for user ${userId}:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: 'Could not process dream', details: errorMessage }, { status: 500 })
  }
} 

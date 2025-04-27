import { NextResponse } from 'next/server'
import { PrismaClient, Dream } from '@/generated/prisma'
import * as z from 'zod'
import { google } from '@ai-sdk/google';
import { generateText, generateObject } from 'ai';
import { dreamAnalysisSchema, StructuredDreamAnalysis, structuredDreamAnalysisZodSchema } from '@/lib/schemas/dreamAnalysis';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

const prisma = new PrismaClient()

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
  // Get Supabase session/user
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Check if user is authenticated
  if (authError || !user) {
    console.error('Ingest API - Auth Error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id; // Use the Supabase user ID

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

    const { description, mood, tags: tagsString, analysisContent: preGeneratedAnalysisString } = validation.data

    // Split tags string into array, or use empty array if undefined/null
    let tagsArray: string[] = [];
    if (tagsString) {
      tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }

    // 1. Insert the new dream (using actual userId)
    const newDream = await prisma.dream.create({
      data: {
        description,
        mood,
        tags: tagsArray, // Use the processed array
        userId: userId, // This now uses the Supabase user ID
      },
    })

    // 1b. Summarize the dream into concise markdown bullets for future context using Vercel AI SDK
    let summaryBullets: string | null = null;
    try {
      const summaryPrompt = `ROLE: system
You compress user dream logs.

Instruction:
Return 2-4 concise markdown bullets that capture:
• main setting and actors
• dominant emotions / conflicts
• any striking symbols

Do NOT interpret or analyze—just factual summary.

Dream:
"""
${description.length > 2000 ? description.substring(0, 2000) : description}
"""
==>`;
      const result = await generateText({
        model: google('gemini-1.5-flash'),
        prompt: summaryPrompt
      });
      summaryBullets = result.text.trim();
    } catch (error) {
      console.error(`Error generating dream summary for dream ${newDream.id}:`, error);
    }

    // Update the dream record with summaryBullets if available
    if (summaryBullets) {
      await prisma.dream.update({
        where: { id: newDream.id },
        data: { summaryBullets },
      });
    }

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
          where: { userId: userId }, // This uses the Supabase user ID
          orderBy: { createdAt: 'desc' },
          take: 5, // Fetch 5 to pass up to 4 previous ones (newDream + 4 history) to the prompt
      });

      // Build the prompt
      const prompt = buildPrompt(recentDreams, newDream);

      // Call the AI SDK to generate structured analysis
      try {
        const { object: generated } = await generateObject({
          model: google('gemini-2.0-flash'),
          schema: structuredDreamAnalysisZodSchema,
          prompt,
        });
        finalAnalysisString = JSON.stringify(generated);
        analysisValid = true;
        console.log(`Successfully generated analysis for dream ${newDream.id}`);
      } catch (analysisError) {
        console.error(`Error generating analysis for dream ${newDream.id}:`, analysisError);
        analysisValid = false;
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

import { NextResponse } from 'next/server';
import { PrismaClient, Dream } from '@/generated/prisma';
import * as z from 'zod';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { dreamAnalysisSchema, StructuredDreamAnalysis } from '@/lib/schemas/dreamAnalysis';

const prisma = new PrismaClient();

// Initialize Google Generative AI
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

// Schema for validating analyze request
const analyzeSchema = z.object({
  description: z.string().min(10),
  mood: z.number().min(1).max(5),
  tags: z.string().optional(),
});

// Function to build prompt
function buildPrompt(recentDreams: Dream[], newDream: { description: string; mood: number; tags: string; }): string {
    // Create a deep copy to avoid modifying the original imported schema
    const schemaForPrompt = JSON.parse(JSON.stringify(dreamAnalysisSchema));
    // Remove the top-level type for cleaner prompt display, check if properties exist first
    if (schemaForPrompt && typeof schemaForPrompt === 'object' && 'properties' in schemaForPrompt) {
      // No need to delete 'type' if structure is correct; the prompt instructions handle it.
    } else {
      console.warn('Schema structure unexpected in buildPrompt');
      // Fallback or error handling if schema structure is not as expected
    }

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

    if (recentDreams.length > 0) {
        const relevantHistory = recentDreams.slice(0, 3);
        relevantHistory.forEach((dream) => {
             prompt += `- (${dream.createdAt.toLocaleDateString()}): ${dream.description.substring(0, 100)}... (Mood: ${dream.mood}, Tags: ${dream.tags || 'None'})\n`;
        });
    } else {
        prompt += "No significant recent dream history provided.\n";
    }

    prompt += `
---\nDream to Analyze:\nDescription: ${newDream.description}\nMood (1-5, 5=positive): ${newDream.mood}\nTags: ${newDream.tags || 'None'}\n---\nJSON Analysis Output:\n`;

    return prompt;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json({ error: "Server configuration error: Missing API Key for analysis." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    const { description, mood, tags } = parsed.data;

    const recentDreams = await prisma.dream.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    const newDreamData = {
      description,
      mood,
      tags: tags || "",
    };

    const prompt = buildPrompt(recentDreams, newDreamData);

    let analysisJson: StructuredDreamAnalysis | null = null;
    try {
      const result = await model.generateContent(prompt);
      
      const responseText = result.response.text();

      if (!responseText) {
          console.error("Gemini response text is empty.");
          throw new Error("Analysis generation failed: Empty response received from AI.");
      }

      try {
          analysisJson = JSON.parse(responseText) as StructuredDreamAnalysis;
      } catch (parseError) {
          console.error("Failed to parse Gemini JSON response:", parseError, "Raw text:", responseText);
          const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
              try {
                  analysisJson = JSON.parse(jsonMatch[1]) as StructuredDreamAnalysis;
                  console.warn("Parsed JSON extracted from markdown block.");
              } catch (fallbackParseError) {
                  console.error("Failed to parse extracted JSON:", fallbackParseError);
                  throw new Error("Analysis generation failed: Invalid format received (could not parse JSON).");
              }
          } else {
              throw new Error("Analysis generation failed: Invalid format received (no valid JSON found).");
          }
      }

      if (!analysisJson?.summary || !analysisJson?.keySymbols || !analysisJson?.archetypes || !analysisJson?.emotionalThemes || !analysisJson?.guidedReflection) {
          console.error("Gemini response missing required fields:", analysisJson);
          throw new Error("Analysis response is missing required fields.");
      }

    } catch (aiError) {
      console.error("Error calling or processing Gemini API response:", aiError);
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI error';
      
      if (errorMessage.includes("required fields")) {
         return NextResponse.json({ error: 'Analysis failed: Incomplete structured data received from AI.' }, { status: 500 });
      }
      if (errorMessage.includes("Invalid format received") || errorMessage.includes("JSON")) {
         return NextResponse.json({ error: 'Analysis failed: Invalid structured data format received from AI.' }, { status: 500 });
      }
      if (errorMessage.includes("Empty response")) {
         return NextResponse.json({ error: 'Analysis failed: No content received from AI.' }, { status: 500 });
      }
      return NextResponse.json({ error: `Analysis failed: ${errorMessage}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, analysis: analysisJson }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/analyze:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: `Could not analyze dream: ${errorMessage}` }, { status: 500 });
  }
}

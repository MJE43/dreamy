import { NextResponse } from 'next/server'
import { PrismaClient, Dream } from '@/generated/prisma'
import * as z from 'zod'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"; // New path

const prisma = new PrismaClient()

// Initialize Google Generative AI
// Make sure GOOGLE_API_KEY is set in your .env file
if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY not set. Analysis feature will be disabled.");
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});

// Schema for validating incoming request body
const ingestSchema = z.object({
  description: z.string().min(10),
  mood: z.number().min(1).max(5),
  tags: z.string().optional(),
  analysisContent: z.string().optional(), // Add optional analysis content field
})

// Function to build the prompt for Gemini
// Using Prisma's generated Dream type for better type safety
function buildPrompt(recentDreams: Dream[], newDream: Dream): string {
    // System message / Analysis Instructions using template literal
    let prompt = `Analyze the following dream through psychological and archetypal lenses, primarily focusing on Jungian concepts (archetypes, shadow, individuation, collective unconscious) but also considering Freudian ideas (wish fulfillment, repression) and common mythic motifs where applicable.

Consider the user's recent dream history for recurring themes, symbols, or emotional shifts. Provide insights and potential interpretations, but avoid definitive statements. Encourage self-reflection.

Format the analysis clearly. Address key symbols, settings, characters, and the overall narrative and mood.

---
`;

    // Add recent dreams for context
    if (recentDreams.length > 1) { // Exclude the dream just submitted
        prompt += `
**Recent Dream History (Summarized):**
`;
        // Include dreams *before* the current one
        const relevantHistory = recentDreams.slice(1, 4); // Show last 3 previous dreams
        relevantHistory.forEach((dream) => {
             // Use template literal for interpolation
             prompt += `- (${dream.createdAt.toLocaleDateString()}): ${dream.description.substring(0, 100)}... (Mood: ${dream.mood}, Tags: ${dream.tags || 'None'})\n`;
        });
        prompt += `
---
`;
    }

    // Add the new dream to be analyzed using template literal
    prompt += `
**Dream to Analyze:**
`;
    prompt += `Description: ${newDream.description}\n`;
    prompt += `Mood (1-5, 5=positive): ${newDream.mood}\n`;
    prompt += `Tags: ${newDream.tags || 'None'}\n`;
    prompt += `
---
**Analysis:**`; // Signal for the model to start generating

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

    const { description, mood, tags, analysisContent: preGeneratedAnalysis } = validation.data

    // 1. Insert the new dream (using actual userId)
    const newDream = await prisma.dream.create({
      data: {
        description,
        mood,
        tags: tags || "",
        userId: userId, // Use the authenticated user's ID
      },
    })

    let finalAnalysisContent: string | null = preGeneratedAnalysis || null;
    let analysisGenerated = !!preGeneratedAnalysis;

    // 2. Only call Gemini if analysis was NOT provided in the request
    if (!finalAnalysisContent) {
      console.log(`Generating analysis for dream ${newDream.id} for user ${userId}...`)
       // Fetch recent dreams for context
      const recentDreams = await prisma.dream.findMany({
          where: { userId: userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
      });

      // Build the prompt
      const prompt = buildPrompt(recentDreams, newDream);
      console.log(`\n--- Gemini Prompt for user ${userId} ---\n`, prompt, "\n---------------------\n");

      // Call Gemini
      try {
          const result = await model.generateContent(prompt);
          const response = result.response;
          finalAnalysisContent = response.text();
          analysisGenerated = true; // Mark as generated by this request

          if (!finalAnalysisContent) {
              console.warn("Gemini did not return text content for user:", userId, response);
              analysisGenerated = false;
          } else {
               console.log(`\n--- Gemini Analysis for user ${userId} ---\n`, finalAnalysisContent, "\n----------------------\n");
          }
      } catch (geminiError) {
          console.error(`Error calling Gemini API for user ${userId}:`, geminiError);
          analysisGenerated = false;
          // Decide if we should still save the dream without analysis
      }
    } else {
        console.log(`Using pre-generated analysis for dream ${newDream.id} for user ${userId}.`)
    }

    // 3. Persist analysis if available (either pre-generated or newly generated)
    if (finalAnalysisContent) {
        await prisma.analysis.create({
            data: {
                dreamId: newDream.id,
                content: finalAnalysisContent,
            },
        });
    }

    // Return success
    return NextResponse.json({ ok: true, dreamId: newDream.id, analysisGenerated }, { status: 201 })

  } catch (error) {
    console.error(`Error in /api/ingest for user ${userId}:`, error)
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Could not process dream', details: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Could not process dream' }, { status: 500 })
  }
} 

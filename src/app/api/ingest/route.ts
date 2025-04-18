import { NextResponse } from 'next/server'
import { PrismaClient, Dream } from '@/generated/prisma'
import * as z from 'zod'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route" // Import authOptions

const prisma = new PrismaClient()

// Initialize Google Generative AI
// Make sure GOOGLE_API_KEY is set in your .env file
if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY not set. Analysis feature will be disabled.");
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});

// Schema for validating incoming request body
const ingestSchema = z.object({
  description: z.string().min(10),
  mood: z.number().min(1).max(5),
  tags: z.string().optional(), // Expecting comma-separated string, make optional
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

    const { description, mood, tags } = validation.data

    // 1. Insert the new dream (using actual userId)
    const newDream = await prisma.dream.create({
      data: {
        description,
        mood,
        tags: tags || "",
        userId: userId, // Use the authenticated user's ID
      },
    })

    // 2. Fetch recent dreams for context (for the specific user)
    const recentDreams = await prisma.dream.findMany({
        where: { userId: userId }, // Ensure we only fetch dreams for this user
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    // 3. Build the prompt
    const prompt = buildPrompt(recentDreams, newDream);
    console.log(`\n--- Gemini Prompt for user ${userId} ---\n`, prompt, "\n---------------------\n");

    // 4. Call Gemini
    let analysisContent: string | null = null;
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        analysisContent = response.text();

        if (!analysisContent) {
            console.warn("Gemini did not return text content for user:", userId, response);
        } else {
             console.log(`\n--- Gemini Analysis for user ${userId} ---\n`, analysisContent, "\n----------------------\n");
        }
    } catch (geminiError) {
        console.error(`Error calling Gemini API for user ${userId}:`, geminiError);
    }

    // 5. Persist analysis if available
    if (analysisContent) {
        await prisma.analysis.create({
            data: {
                dreamId: newDream.id,
                content: analysisContent,
            },
        });
    }

    // Return success
    return NextResponse.json({ ok: true, dreamId: newDream.id, analysisGenerated: !!analysisContent }, { status: 201 })

  } catch (error) {
    console.error(`Error in /api/ingest for user ${userId}:`, error)
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Could not process dream', details: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Could not process dream' }, { status: 500 })
  }
} 

import { NextResponse } from 'next/server';
import { PrismaClient, Dream } from '@/generated/prisma';
import * as z from 'zod';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

// Initialize Google Generative AI
if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY not set. Analysis feature will be disabled.");
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});

// Schema for validating analyze request
const analyzeSchema = z.object({
  description: z.string().min(10),
  mood: z.number().min(1).max(5),
  tags: z.string().optional(),
});

// Function to build prompt
function buildPrompt(recentDreams: Dream[], newDream: { description: string; mood: number; tags: string; }): string {
    let prompt = `Analyze the following dream through psychological and archetypal lenses, primarily focusing on Jungian concepts (archetypes, shadow, individuation, collective unconscious) but also considering Freudian ideas (wish fulfillment, repression) and common mythic motifs where applicable.

Consider the user's recent dream history for recurring themes, symbols, or emotional shifts. Provide insights and potential interpretations, but avoid definitive statements. Encourage self-reflection.

Format the analysis clearly. Address key symbols, settings, characters, and the overall narrative and mood.

---
`;

    if (recentDreams.length > 1) {
        prompt += `
**Recent Dream History (Summarized):**
`;
        const relevantHistory = recentDreams.slice(1, 4);
        relevantHistory.forEach((dream) => {
             prompt += `- (${dream.createdAt.toLocaleDateString()}): ${dream.description.substring(0, 100)}... (Mood: ${dream.mood}, Tags: ${dream.tags || 'None'})\n`;
        });
        prompt += `
---
`;
    }

    prompt += `
**Dream to Analyze:**
`;
    prompt += `Description: ${newDream.description}\n`;
    prompt += `Mood (1-5, 5=positive): ${newDream.mood}\n`;
    prompt += `Tags: ${newDream.tags || 'None'}\n`;
    prompt += `
---
**Analysis:**`;

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
      take: 5,
    });

    const newDream = {
      description,
      mood,
      tags: tags || "",
    };

    const prompt = buildPrompt(recentDreams, newDream);

    let analysisContent: string;
    try {
      const result = await model.generateContent(prompt);
      analysisContent = result.response.text();
    } catch (aiError) {
      console.error("Error calling Gemini API:", aiError);
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, analysis: analysisContent }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/analyze:", error);
    return NextResponse.json({ error: 'Could not analyze dream' }, { status: 500 });
  }
}

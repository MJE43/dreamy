import { NextResponse } from 'next/server';
import { PrismaClient, Dream } from '@/generated/prisma';
import * as z from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
// Vercel AI SDK imports
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
// Schema import (assuming path is correct)
import { structuredDreamAnalysisZodSchema } from '@/lib/schemas/dreamAnalysis';
// Removed unused GoogleGenerativeAI import

const prisma = new PrismaClient();

// Removed manual Gemini client initialization

// Schema for validating incoming request body remains the same
const analyzeSchema = z.object({
  description: z.string().min(10),
  mood: z.number().min(1).max(5),
  tags: z.string().optional(),
});

// Keep the buildPrompt helper function (or integrate its logic)
function buildPrompt(recentDreams: Pick<Dream, 'description'>[], newDream: { description: string; mood: number; tags?: string }): string {
    let prompt = `Analyze the following dream description, considering the user's mood (${newDream.mood}/5) and tags (${newDream.tags || 'none'}). Provide a structured analysis based *only* on the provided dream text, mood, and tags. Avoid making assumptions or bringing in external knowledge beyond general dream interpretation principles. Format the response as a JSON object matching the required schema.\n\n`;
    prompt += `Current Dream:\nDescription: ${newDream.description}\nMood: ${newDream.mood}\nTags: ${newDream.tags || 'none'}\n\n`;
    if (recentDreams.length > 0) {
        prompt += `Recent Dream Descriptions (for context, focus analysis on the CURRENT dream):\n`;
        recentDreams.forEach((dream, index) => {
            prompt += `${index + 1}. ${dream.description}\n`;
        });
        prompt += `\n`;
    }
    prompt += `JSON Analysis Output:\n`;
    return prompt;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // ... auth error handling ...
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  // Check for Google API key (still needed for the provider)
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

    // Fetch recent dreams (keep this logic)
    const recentDreams = await prisma.dream.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { description: true } // Only select necessary field
    });

    // Prepare new dream data for prompt
    const newDreamData = { description, mood, tags };

    // Build the prompt
    const prompt = buildPrompt(recentDreams, newDreamData);
    console.log(`Analyze prompt for user ${userId} (Dream: ${description.substring(0, 30)}...)`);

    // --- Call Vercel AI SDK generateObject --- 
    const { object: analysisJson } = await generateObject({
        model: google('gemini-2.0-flash'), // Use consistent model
        schema: structuredDreamAnalysisZodSchema, // Provide the Zod schema
        prompt: prompt,
    });
    // If generateObject fails (validation or API error), it throws, caught below.

    console.log(`Analysis generated successfully for user ${userId}`);

    // --- Return Success Response --- 
    // analysisJson is already validated against the schema
    return NextResponse.json({ ok: true, analysis: analysisJson }, { status: 200 });

  } catch (error: unknown) {
    console.error(`Error in /api/analyze for user ${userId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    // Add more specific error checking if needed (e.g., check for Zod validation errors from SDK)
    return NextResponse.json({ error: `Could not analyze dream: ${errorMessage}` }, { status: 500 });
  }
}

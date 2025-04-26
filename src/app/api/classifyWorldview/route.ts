import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase';
import { PrismaClient } from '@/generated/prisma'; // Use correct import path
import { google } from '@ai-sdk/google'; // Import Vercel AI Google provider
import { generateObject } from 'ai'; // Import generateObject
import { z } from 'zod'; // Import Zod
// Removed unused GoogleGenerativeAI import

const prisma = new PrismaClient();

// Zod schema for the expected classification result
const classificationResultSchema = z.object({
    stageBlend: z.record(z.string(), z.number()).describe("Object mapping Spiral Dynamics stages (e.g., BLUE, ORANGE) to numeric scores (0-1)."),
    narrativeSummary: z.string().describe("Brief 1-2 sentence narrative summary of the dominant themes.")
});

// Removed unused TypeScript interface
// interface ClassificationResult extends z.infer<typeof classificationResultSchema> {}

// POST method to trigger the classification
export async function POST() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('API /classifyWorldview - Auth Error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  try {
    console.log(`API /classifyWorldview - Starting classification for user ${userId}`);

    // --- 1. Fetch required data --- 
    const profile = await prisma.spiralProfile.findUnique({
      where: { userId: userId },
      select: { rawAnswers: true, includeDreams: true }
    });

    if (!profile) {
      console.error(`API /classifyWorldview - No profile found for user ${userId}`);
      return NextResponse.json({ error: 'User profile not found or onboarding incomplete.' }, { status: 404 });
    }

    // Ensure answers is an array even if null/undefined in DB
    const answers = Array.isArray(profile.rawAnswers) ? profile.rawAnswers : [];
    const includeDreams = profile.includeDreams || false;

    let dreamData: string[] = []; 
    if (includeDreams) {
      const dreams = await prisma.dream.findMany({ 
          where: { userId: userId },
          select: { description: true }, 
          orderBy: { createdAt: 'desc' }, 
          take: 10 
      });
      dreamData = dreams.map(d => d.description).filter((d): d is string => d !== null);
      console.log(`API /classifyWorldview - Dream import requested for user ${userId}, fetched ${dreamData.length} dreams.`);
    }

    // --- 2. Build Prompt --- 
    let prompt = `Analyze the following user data to determine their Spiral Dynamics worldview stage blend and provide a brief 1-2 sentence narrative summary. Respond ONLY with a single JSON object matching this structure: { "stageBlend": { /* e.g., "BLUE": 0.6 */ }, "narrativeSummary": "Your brief analysis here." }\n\n`;
    prompt += `Dilemma Answers:\n${JSON.stringify(answers)}\n\n`;
    if (includeDreams && dreamData.length > 0) {
        prompt += `Recent Dream Themes (optional context):\n${JSON.stringify(dreamData)}\n\n`;
    }
    prompt += `JSON Output:\n`;

    console.log(`API /classifyWorldview - Sending prompt to Gemini for user ${userId}`);

    // --- 3. Call Vercel AI SDK using generateObject --- 
    const { object } = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: classificationResultSchema,
        prompt: prompt,
    });

    console.log(`API /classifyWorldview - Generation complete for user ${userId}:`, object);

    // --- Update Profile in DB --- 
    try {
         await prisma.spiralProfile.update({
            where: { userId: userId },
            data: { 
                stageBlend: object.stageBlend,
                dominantBias: object.narrativeSummary 
            },
        });
        console.log(`API /classifyWorldview - Successfully updated profile for user ${userId}`);
    } catch (dbError) {
         console.error(`API /classifyWorldview - Failed to update profile after generation for user ${userId}:`, dbError);
         return NextResponse.json({ error: 'Failed to save classification result', details: (dbError as Error).message }, { status: 500 });
    }

    // --- Return Success Response --- 
    return NextResponse.json({ ok: true, ...object });

  } catch (error) {
    console.error(`API /classifyWorldview - Error processing request for user ${userId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    if (errorMessage.includes("generateObject")) {
         return NextResponse.json({ error: 'Failed to generate classification', details: errorMessage }, { status: 500 });
    }
    return NextResponse.json(
        { error: 'Could not classify worldview', details: errorMessage },
        { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase';
import { PrismaClient } from '@/generated/prisma'; // Use correct import path
import { GoogleGenerativeAI } from "@google/generative-ai";
// Prisma.JsonValue might be directly available or under the Prisma namespace depending on version/generation
// If Prisma.JsonValue still causes issues, consider using 'any' or defining a more specific type.

const prisma = new PrismaClient();

// Placeholder: Initialize Gemini Client (Ensure API key is set in env)
// TODO: Refactor Gemini client initialization maybe into a lib file?
if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY not set for worldview classifier.");
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
// TODO: Define specific model and generation config if needed
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Placeholder: Define the structure expected for the stageBlend
interface StageBlend {
    [key: string]: number; // e.g., { BEIGE: 0.1, PURPLE: 0.3, ... }
}

// POST method to trigger the classification
export async function POST(_request: Request) {
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
      where: { id: userId },
      select: { rawAnswers: true, includeDreams: true }
    });

    if (!profile) {
      console.error(`API /classifyWorldview - No profile found for user ${userId}`);
      return NextResponse.json({ error: 'User profile not found or onboarding incomplete.' }, { status: 404 });
    }

    const answers = profile.rawAnswers ? profile.rawAnswers : [];
    const includeDreams = profile.includeDreams || false;

    let dreamData: string[] = []; // Expecting an array of dream description strings
    if (includeDreams) {
      // TODO: Fetch last ~5-10 dream descriptions for this user
      const dreams = await prisma.dream.findMany({ 
          where: { userId: userId },
          select: { description: true }, 
          orderBy: { createdAt: 'desc' }, 
          take: 10 
      });
      dreamData = dreams.map(d => d.description);
      console.log(`API /classifyWorldview - Dream import requested for user ${userId}, fetched ${dreamData.length} dreams.`);
    }

    // --- 2. Build Prompt for Gemini --- 
    // TODO: Define the actual SD rubric and prompt structure
    let prompt = `Analyze the following data to determine the user's Spiral Dynamics worldview stage blend. Respond ONLY with a valid JSON object representing the blend, like {"BLUE": 0.6, "ORANGE": 0.4}.\n\n`;
    prompt += `Dilemma Answers:\n${JSON.stringify(answers)}\n\n`;
    if (includeDreams && dreamData.length > 0) {
        prompt += `Recent Dream Themes (optional context):\n${JSON.stringify(dreamData)}\n\n`;
    }
    prompt += `JSON Stage Blend Output:\n`;

    console.log(`API /classifyWorldview - Sending prompt to Gemini for user ${userId}`);
    // console.log("Prompt:", prompt); // careful logging potentially sensitive data

    // --- 3. Call Gemini API --- 
    // TODO: Add error handling for Gemini call
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log(`API /classifyWorldview - Received response from Gemini for user ${userId}`);

    // --- 4. Parse Response & Validate --- 
    let stageBlend: StageBlend | null = null;
    try {
        // TODO: Add more robust validation (e.g., using Zod)
        const parsedResponse = JSON.parse(responseText);
        // Basic check: is it an object where values are numbers?
        if (typeof parsedResponse === 'object' && parsedResponse !== null && Object.values(parsedResponse).every(v => typeof v === 'number')) {
            stageBlend = parsedResponse as StageBlend;
            console.log(`API /classifyWorldview - Parsed stageBlend for user ${userId}:`, stageBlend);
        } else {
            throw new Error('Parsed response is not a valid StageBlend object.');
        }
    } catch (parseError) {
        console.error(`API /classifyWorldview - Failed to parse Gemini response for user ${userId}:`, parseError, "Raw text:", responseText);
        return NextResponse.json({ error: 'Failed to process classification result' }, { status: 500 });
    }

    // --- 5. Update Profile in DB --- 
    if (stageBlend) {
        await prisma.spiralProfile.update({
            where: { id: userId },
            data: { stageBlend: stageBlend as any },
        });
        console.log(`API /classifyWorldview - Updated profile for user ${userId}`);
    } else {
         console.warn(`API /classifyWorldview - No valid stageBlend to save for user ${userId}`);
         // Decide if we should error out or return success without update
         return NextResponse.json({ error: 'Classification failed, no valid blend obtained.' }, { status: 500 });
    }

    // --- 6. Return Success Response --- 
    return NextResponse.json({ ok: true, stageBlend });

  } catch (error) {
    console.error(`API /classifyWorldview - Error processing request for user ${userId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
        { error: 'Could not classify worldview', details: errorMessage },
        { status: 500 }
    );
  }
} 

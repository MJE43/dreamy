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
// Configure model for JSON output
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { 
        responseMimeType: "application/json" 
    }
});

// Placeholder: Define the structure expected for the stageBlend
interface StageBlend {
    [key: string]: number; // e.g., { BEIGE: 0.1, PURPLE: 0.3, ... }
}

// Define the structure we expect back from Gemini
interface ClassificationResult {
    stageBlend: StageBlend;
    narrativeSummary: string; // 1-2 sentence summary
}

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
    // Updated prompt requesting JSON with blend and narrative summary
    let prompt = `Analyze the following user data to determine their Spiral Dynamics worldview stage blend and provide a brief 1-2 sentence narrative summary. Respond ONLY with a single JSON object matching this structure: { "stageBlend": { /* e.g., "BLUE": 0.6 */ }, "narrativeSummary": "Your brief analysis here." }\n\n`;
    prompt += `Dilemma Answers:\n${JSON.stringify(answers)}\n\n`;
    if (includeDreams && dreamData.length > 0) {
        prompt += `Recent Dream Themes (optional context):\n${JSON.stringify(dreamData)}\n\n`;
    }
    prompt += `JSON Output:\n`; // Keep this last line as a clear separator

    console.log(`API /classifyWorldview - Sending prompt to Gemini for user ${userId}`);
    // console.log("Prompt:", prompt); // careful logging potentially sensitive data

    // --- 3. Call Gemini API --- 
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log(`API /classifyWorldview - Received response from Gemini for user ${userId}`);

    // --- 4. Parse Response & Validate --- 
    let classificationResult: ClassificationResult | null = null;
    try {
        const parsedResponse = JSON.parse(responseText);

        // Validate the structure matches ClassificationResult
        if (
            parsedResponse && 
            typeof parsedResponse === 'object' &&
            parsedResponse.stageBlend && 
            typeof parsedResponse.stageBlend === 'object' &&
            Object.values(parsedResponse.stageBlend).every(v => typeof v === 'number') &&
            parsedResponse.narrativeSummary && 
            typeof parsedResponse.narrativeSummary === 'string'
        ) {
            classificationResult = parsedResponse as ClassificationResult;
            console.log(`API /classifyWorldview - Parsed result for user ${userId}:`, classificationResult);
        } else {
            console.error('API /classifyWorldview - Parsed response invalid structure:', parsedResponse);
            throw new Error('Parsed response is not a valid ClassificationResult object.');
        }
    } catch (parseError) {
        console.error(`API /classifyWorldview - Failed to parse Gemini response for user ${userId}:`, parseError, "Raw text:", responseText);
        return NextResponse.json({ error: 'Failed to process classification result' }, { status: 500 });
    }

    // --- 5. Update Profile in DB --- 
    if (classificationResult) {
        await prisma.spiralProfile.update({
            where: { userId: userId },
            // Update both stageBlend and dominantBias (with narrative summary)
            data: { 
                stageBlend: classificationResult.stageBlend,
                dominantBias: classificationResult.narrativeSummary 
            },
        });
        console.log(`API /classifyWorldview - Updated profile for user ${userId}`);
    } else {
         // This case should technically not be reachable if parsing succeeded
         console.warn(`API /classifyWorldview - No valid classification result to save for user ${userId}`);
         return NextResponse.json({ error: 'Classification failed, no valid result obtained.' }, { status: 500 });
    }

    // --- 6. Return Success Response --- 
    // Return the full result including the summary
    return NextResponse.json({ ok: true, ...classificationResult });

  } catch (error) {
    console.error(`API /classifyWorldview - Error processing request for user ${userId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
        { error: 'Could not classify worldview', details: errorMessage },
        { status: 500 }
    );
  }
} 

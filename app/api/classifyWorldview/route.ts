import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PrismaClient, RefType, Prisma } from '@/generated/prisma'; // Import Prisma
import { GoogleGenerativeAI } from "@google/generative-ai"; // Placeholder for Gemini client

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface DilemmaAnswer {
  code: string;
  choice: string; // 'A' or 'B'
}

interface RequestBody {
  answers: DilemmaAnswer[];
  includeDreams: boolean;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { answers, includeDreams } = body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid answers' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch dreams if includeDreams is true
    let userDreamsText = '';
    if (includeDreams) {
        const dreams = await prisma.dream.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }, // Get most recent dreams
            take: 5, // Limit to last 5 dreams as per roadmap plan for CoachChat
            select: { description: true, createdAt: true }
        });
        if (dreams.length > 0) {
            userDreamsText = '\n\nAdditionally, consider these recent dreams from the user:\n' +
                             dreams.map(d => `- (${d.createdAt.toISOString().split('T')[0]}): ${d.description}`).join('\n');
        }
    }

    // Fetch SD Rubric Data (Stage Descriptions)
    const stageReferences = await prisma.spiralReference.findMany({
        where: { type: RefType.STAGE },
        orderBy: { code: 'asc' }, // Or order by tier/order if available in details
        select: { code: true, name: true, description: true }
    });

    const sdRubric = stageReferences.map(stage =>
        `- ${stage.code} (${stage.name}): ${stage.description}`
    ).join('\n');

    // Construct Prompt for Gemini
    const prompt = `Based on the following Spiral Dynamics stage descriptions:
${sdRubric}

And the user's answers to worldview dilemmas:
${JSON.stringify(answers)}
${userDreamsText} // Add dreams text if available

Determine the user's stage blend. Respond ONLY with a valid JSON object representing the stage blend, where keys are stage codes (e.g., "BLUE", "ORANGE") and values are proportions (e.g., 0.6). Example: {"BLUE": 0.4, "ORANGE": 0.6}.`;

    // Call Gemini API
    console.log("Sending prompt to Gemini:", prompt); // Log the prompt for debugging
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Or use "gemini-1.5-flash" etc.
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Received response from Gemini:", text); // Log the raw response

    let stageBlend: Record<string, number>;
    try {
        // Attempt to parse the response text as JSON
        // Simple sanitization: remove potential markdown ```json ... ``` wrapper
        const sanitizedText = text.replace(/^```json\n|\n```$/g, '').trim();
        stageBlend = JSON.parse(sanitizedText);

        // Basic validation: Ensure it's an object and values are numbers
        if (typeof stageBlend !== 'object' || stageBlend === null || Array.isArray(stageBlend)) {
            throw new Error('Invalid stageBlend format: not an object.');
        }
        for (const key in stageBlend) {
            if (typeof stageBlend[key] !== 'number') {
                throw new Error(`Invalid stageBlend format: value for ${key} is not a number.`);
            }
        }
    } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        console.error('Raw Gemini response was:', text);
        return NextResponse.json({ error: 'Failed to process AI response.' }, { status: 500 });
    }

    // Update or create user's SpiralProfile in DB
    const updatedProfile = await prisma.spiralProfile.upsert({
        where: { userId: userId }, // Hopefully resolved after migration + generate
        update: {
            // Fields to update if profile exists
            stageBlend: stageBlend as unknown as Prisma.InputJsonValue, // Double cast
            rawAnswers: answers as unknown as Prisma.InputJsonValue,    // Double cast
            includeDreams: includeDreams,
            // Removed updatedAt: new Date(), Prisma handles it automatically
        },
        create: {
            // Fields to set if creating a new profile
            userId: userId,
            stageBlend: stageBlend as unknown as Prisma.InputJsonValue, // Double cast
            rawAnswers: answers as unknown as Prisma.InputJsonValue,    // Double cast
            includeDreams: includeDreams,
        },
        select: {
            // Optionally select fields to return, e.g., just the stageBlend
            stageBlend: true
        }
    });

    console.log("Successfully upserted SpiralProfile for user:", userId);

    // Return the updated stageBlend from the database record
    return NextResponse.json({ stageBlend: updatedProfile.stageBlend });

  } catch (error) {
    console.error('Error in /api/classifyWorldview:', error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Corrected import
import { z } from 'zod';
import { google } from '@ai-sdk/google'; // Vercel AI SDK for Google
import { generateObject } from 'ai'; // Vercel AI SDK core

const prisma = new PrismaClient();
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ''); // Old SDK

// Input validation schema
const createGoalSchema = z.object({
    title: z.string().min(3, "Goal title must be at least 3 characters"),
    targetDate: z.string().optional(), // Expecting ISO string date for simplicity
});

// Schema for AI-generated milestones
const milestonesSchema = z.object({
    milestones: z.array(z.string()).min(3).max(5),
});

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await request.json();
        
        // Validate input
        const validation = createGoalSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
        }
        const { title, targetDate } = validation.data;

        let milestones: string[];

        const fallbackMilestones = [
            `Define what "${title}" means specifically.`,
            `Identify first step for "${title}".`,
            `Schedule time to work on "${title}".`
        ];

        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not set. Falling back to placeholder milestones.");
            milestones = fallbackMilestones;
        } else {
            try {
                const milestonePrompt = `Given the goal "${title}", generate 3-5 actionable milestones. Respond ONLY with a valid JSON object containing a key "milestones" which is an array of strings. Each string should be a concise milestone description. Example: {"milestones": ["Define project scope", "Develop core features", "Test and deploy"]}`;
                console.log("Goal Milestone Prompt:", milestonePrompt);

                const { object } = await generateObject({
                    model: google('models/gemini-pro'), // Specify the model
                    schema: milestonesSchema, // Define the expected Zod schema for the output
                    prompt: milestonePrompt,
                });

                if (object && object.milestones) {
                    milestones = object.milestones;
                } else {
                    console.error("AI milestone generation failed or returned unexpected format, using fallback.");
                    milestones = fallbackMilestones;
                }

            } catch (aiError) {
                console.error("Error calling AI for milestones:", aiError);
                milestones = fallbackMilestones;
            }
        }

        // Final validation, just in case, though generateObject with Zod schema should ensure this
        if (!Array.isArray(milestones) || !milestones.every(m => typeof m === 'string') || milestones.length === 0) {
            console.error("Milestones are not in the expected format after AI call or fallback, using default fallback.");
            milestones = fallbackMilestones; // Ensure there's always a valid array
        }

        // Transform milestones to the new structure: Array<{ text: string; completed: boolean; }>
        const structuredPlan = milestones.map(milestoneText => ({
            text: milestoneText,
            completed: false,
        }));
        
        // --- Save Goal to Database ---
        const newGoal = await prisma.goal.create({
            data: {
                userId: userId,
                title: title,
                targetDate: targetDate ? new Date(targetDate) : null,
                plan: structuredPlan, // Save in the new object format
                progress: 0, // Explicitly set initial progress
                // completed has default false, progressLog has default []
            }
        });

        return NextResponse.json(newGoal, { status: 201 }); // Return created goal

    } catch (error: unknown) {
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error in POST /api/goals:", error);
        // Handle Zod errors specifically if needed, although safeParse covers it
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const goals = await prisma.goal.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc', // Or 'targetDate', 'updatedAt' depending on desired default sort
            },
            select: {
                id: true,
                title: true,
                targetDate: true,
                plan: true, // For milestone preview
                completed: true,
                progress: true, // The new field for progress percentage
                createdAt: true,
                updatedAt: true,
            }
        });

        return NextResponse.json(goals, { status: 200 });

    } catch (error: unknown) {
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error in GET /api/goals:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

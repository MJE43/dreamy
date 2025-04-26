import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';
// import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Input validation schema
const createGoalSchema = z.object({
    title: z.string().min(3, "Goal title must be at least 3 characters"),
    targetDate: z.string().optional(), // Expecting ISO string date for simplicity
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

        // --- Call AI to generate milestones ---
        // TODO: Construct prompt for Gemini
        const milestonePrompt = `Based on the user goal "${title}", break it down into 3-5 actionable milestones. Respond ONLY with a valid JSON array of strings representing the milestones. Example: ["Milestone 1 description", "Milestone 2 description"]`;
        
        console.log("Goal Milestone Prompt:", milestonePrompt);
        
        // TODO: Call Gemini API
        // const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 
        // const result = await model.generateContent(milestonePrompt);
        // const response = await result.response;
        // const text = response.text().replace(/^```json\n|\n```$/g, '').trim();
        // let milestones = JSON.parse(text); // Expecting JSON array
        
        // Placeholder milestones
        let milestones = [
            `Define what \"${title}\" means specifically.`, 
            `Identify first step for \"${title}\".`, 
            `Schedule time to work on \"${title}\".`
        ];

        // TODO: Validate milestones format (should be array of strings)
        if (!Array.isArray(milestones) || !milestones.every(m => typeof m === 'string')) {
            console.error("Gemini did not return a valid milestone array:", milestones);
            milestones = ["Define goal clearly", "Take first step", "Review progress"]; // Fallback
            // Or throw an error?
            // return NextResponse.json({ error: 'Failed to generate goal milestones' }, { status: 500 });
        }
        
        // --- Save Goal to Database ---
        const newGoal = await prisma.goal.create({
            data: {
                userId: userId,
                title: title,
                targetDate: targetDate ? new Date(targetDate) : null,
                plan: milestones, // Prisma expects Json, array should be fine
                // progressLog and completed have defaults
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

// TODO: Add GET handler? To fetch goals for display? 

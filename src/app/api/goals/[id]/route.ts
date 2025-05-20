import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod schema for the request body
const updateGoalSchema = z.object({
  plan: z.array(
    z.object({
      text: z.string(),
      completed: z.boolean(),
    })
  ).min(1, "Plan must have at least one milestone."),
  // progress: z.number().min(0).max(100).optional(), // Optional: client might send it, but we'll recalculate
});

// Zod schema for the URL parameters
const paramsSchema = z.object({
  id: z.string().uuid("Invalid goal ID format"), // Assuming UUID for goal IDs
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Validate URL parameters
    const paramsValidation = paramsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return NextResponse.json({ error: 'Invalid goal ID', details: paramsValidation.error.flatten() }, { status: 400 });
    }
    const { id: goalId } = paramsValidation.data;

    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch the goal
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Check if the goal belongs to the authenticated user
    if (goal.userId !== userId) {
      // Return 404 instead of 403 to avoid revealing existence of a goal
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(goal, { status: 200 });

  } catch (error: unknown) {
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    console.error(`Error in GET /api/goals/${params?.id}:`, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Validate URL parameters
    const paramsValidation = paramsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return NextResponse.json({ error: 'Invalid goal ID', details: paramsValidation.error.flatten() }, { status: 400 });
    }
    const { id: goalId } = paramsValidation.data;

    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Parse and validate request body
    const body = await request.json();
    const bodyValidation = updateGoalSchema.safeParse(body);

    if (!bodyValidation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: bodyValidation.error.flatten() }, { status: 400 });
    }
    const { plan: newPlan } = bodyValidation.data;

    // Fetch the existing goal
    const existingGoal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Check if the goal belongs to the authenticated user
    if (existingGoal.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden - Goal does not belong to user' }, { status: 403 });
    }

    // --- Update Goal Data ---
    // 1. Calculate progress based on the new plan
    const completedMilestones = newPlan.filter(m => m.completed).length;
    const totalMilestones = newPlan.length;
    const calculatedProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    // 2. Update progressLog
    // Ensure progressLog is an array (it should be due to default value [] in schema or previous updates)
    const currentProgressLog = (Array.isArray(existingGoal.progressLog) ? existingGoal.progressLog : []) as Array<{date: string; percent: number}>;
    
    const today = new Date().toISOString().split('T')[0];
    const existingEntryIndex = currentProgressLog.findIndex(entry => entry.date === today);

    if (existingEntryIndex !== -1) {
        // Update today's entry if it exists
        currentProgressLog[existingEntryIndex].percent = calculatedProgress;
    } else {
        // Add new entry if no entry for today
        currentProgressLog.push({ date: today, percent: calculatedProgress });
    }
    
    // Sort log by date just in case, though pushing today's date should keep it mostly sorted if entries are daily
    currentProgressLog.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    // 3. Determine if the goal is completed
    const isCompleted = totalMilestones > 0 && completedMilestones === totalMilestones;

    // --- Save Updated Goal ---
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        plan: newPlan as unknown as Prisma.JsonArray, // Store the new plan
        progress: calculatedProgress, // Store the newly calculated progress
        progressLog: currentProgressLog as unknown as Prisma.JsonArray, // Store the updated log
        completed: isCompleted,
        updatedAt: new Date(), // Explicitly set updatedAt
      },
    });

    return NextResponse.json(updatedGoal, { status: 200 });

  } catch (error: unknown) {
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    console.error(`Error in PUT /api/goals/${params?.id}:`, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

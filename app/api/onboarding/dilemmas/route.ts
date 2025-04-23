import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase';
import { PrismaClient } from '@/generated/prisma';
import * as z from 'zod';

const prisma = new PrismaClient();

// Schema to validate the incoming POST request body
const onboardingDataSchema = z.object({
  answers: z.array(z.object({
    code: z.string(),
    choice: z.string(), // Should ideally be z.enum(['A', 'B']) but keep string for now
  })).optional(), // Answers might not be present on initial POST from step 2 if using sessionStorage
  includeDreams: z.boolean(),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('API /onboarding/dilemmas - Auth Error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  try {
    const body = await request.json();
    const validation = onboardingDataSchema.safeParse(body);

    if (!validation.success) {
      console.error('API /onboarding/dilemmas - Invalid input:', validation.error.errors);
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    // We only expect answers and includeDreams from Step 3's final submission
    const { answers = [], includeDreams } = validation.data; // Default answers to empty array

    console.log(`API /onboarding/dilemmas - Saving profile for user ${userId}`);

    await prisma.spiralProfile.upsert({
      where: { userId: userId },
      update: {
        rawAnswers: answers, // Store the array directly as JSON
        includeDreams: includeDreams,
      },
      create: {
        userId: userId,
        rawAnswers: answers, // Store the array directly as JSON
        includeDreams: includeDreams,
        // stageBlend and dominantBias will be populated later by the classifier
      },
    });

    console.log(`API /onboarding/dilemmas - Profile saved for user ${userId}`);
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error(`API /onboarding/dilemmas - Error processing request for user ${userId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
        { error: 'Could not save onboarding data', details: errorMessage },
        { status: 500 }
    );
  }
} 

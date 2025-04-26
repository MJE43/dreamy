import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase';
import { PrismaClient } from '@/generated/prisma';
// Vercel AI SDK imports
import { google } from '@ai-sdk/google';
import { streamText, CoreMessage } from 'ai';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createSupabaseServerClient(cookieStore);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('POST /api/coach - Auth Error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = user.id;

        // Ensure the received messages are correctly typed
        const { messages }: { messages: CoreMessage[] } = await request.json();

        // --- Fetch Data for System Prompt --- 
        const profilePromise = prisma.spiralProfile.findUnique({ where: { userId } });
        const goalsPromise = prisma.goal.findMany({ where: { userId, completed: false }, orderBy: { createdAt: 'desc' }, take: 3 });
        const dreamsPromise = prisma.dream.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { description: true } });

        const [profile, goals, dreams] = await Promise.all([profilePromise, goalsPromise, dreamsPromise]);

        if (!profile) {
            // Cannot proceed without profile context
            return NextResponse.json({ error: 'Profile not found. Cannot initialize coach.' }, { status: 404 });
        }

        // --- Construct System Prompt --- 
        let systemPrompt = `You are SpiralCoach, an AI assistant helping a user understand their personal growth through the lens of Spiral Dynamics. Maintain a supportive, insightful, and slightly guiding tone.\n\nUser Profile (Spiral Dynamics Blend):\n${JSON.stringify(profile.stageBlend || '{}')}\nDominant Bias (if any): ${profile.dominantBias || 'N/A'}\n`;

        if (goals.length > 0) {
            systemPrompt += `\nUser's Active Goals:\n${goals.map(g => `- ${g.title} (Plan: ${JSON.stringify(g.plan)})`).join('\n')}\n`;
        }
        if (dreams.length > 0) {
            systemPrompt += `\nUser's Recent Dreams:\n${dreams.map(d => `- ${d.description}`).join('\n')}\n`;
        }
        // Add final instruction for the AI's role/output
        systemPrompt += `\nEngage with the user's latest message based on this context.`;
        
        console.log(`Coach System Prompt for ${userId}:`, systemPrompt);

        // --- Call Vercel AI SDK streamText --- 
        const result = await streamText({
            model: google('gemini-2.0-flash'),
            system: systemPrompt, 
            messages: messages, 
            // Add onError callback for detailed logging
            onError: (error) => {
                console.error("Error during streamText generation:", error);
            },
        });

        // --- Return Streaming Response --- 
        return result.toDataStreamResponse();

    } catch (error: unknown) {
        // This catch block handles errors *before* streaming starts (e.g., auth, setup)
        console.error("Error in POST /api/coach (before streaming):", error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 

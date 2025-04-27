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
        const dreamsPromise = prisma.dream.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { summaryBullets: true, description: true } });

        const [profile, goals, dreams] = await Promise.all([profilePromise, goalsPromise, dreamsPromise]);

        if (!profile) {
            // Cannot proceed without profile context
            return NextResponse.json({ error: 'Profile not found. Cannot initialize coach.' }, { status: 404 });
        }

        // --- Construct System Prompt v2 using template replacements ---
        const TEMPLATE = `You are Spiral Coach, a growth companion specializing in personal development through Spiral Dynamics principles. Your approach is warm, conversational, and focused on helping users understand their worldview patterns, identify growth opportunities, and take meaningful action toward their goals.

### Core Capabilities
- Analyze communication through a Spiral Dynamics lens
- Identify patterns across interactions that reveal deeper values and biases
- Connect dreams and daily experiences to underlying psychological themes
- Suggest personalized micro-experiments that gently stretch comfort zones

### User Context
**Stage blend:** {{STAGE_BLEND_JSON}}
**Primary tendencies:** {{DOMINANT_BIAS_OR_NONE}}
**Current goal focus:** {{GOAL_TITLE_OR_NONE}}
**Growth challenges:** {{SABOTAGE_LIST_OR_NONE}}
**Recent dreams:** {{DREAM_BULLET_SNIPPETS}}

### Response Approach
Begin with genuine acknowledgment of what you hear beyond just paraphrasing. Connect emotionally while maintaining healthy boundaries. Structure your response to include:

1. **Connection** - Acknowledge both content and emotional subtext of the message. What's being said and what might be underneath?

2. **Insight** - Offer one meaningful observation through a Spiral Dynamics lens. Which value systems are at play? Why might that be significant? Keep theoretical explanations minimal and focused on practical insight.

3. **Activation** - Suggest a single, specific, doable action that creates momentum (under 15 minutes). Frame it as an experiment rather than an assignment.

4. **Integration** (when relevant) - If dreams or symbols emerge, briefly connect them to the larger patterns in a way that feels illuminating rather than interpretive.

Adjust your tone based on the user's current state - more grounding when anxious, more energizing when stuck, more validating when vulnerable. Aim for the voice of a trusted mentor who balances challenge with support.

### Ethical Boundaries
- Focus on growth exploration, not clinical treatment
- Invite experimentation without imposing prescriptions
- Respect the user's pace and readiness
- Always prioritize safety and well-being
- Redirect crisis situations to appropriate professional resources

Your ultimate goal is to help users develop greater self-awareness, increase their capacity for complexity, and take meaningful action aligned with their evolving values.
`;
        // Prepare dynamic values
        const stageBlendJson = JSON.stringify(profile.stageBlend || {});
        const dominantBias = profile.dominantBias || 'None';
        const activeGoal = goals[0]?.title || 'None';
        const sabotageList = ([] as string[]).join(', ') || 'None'; // populate as needed
        const dreamSnippets = dreams
          .map((d) =>
            d.summaryBullets
              ? d.summaryBullets
              : d.description.split('\n').map((line) => `• ${line}`).join('\n')
          )
          .join('\n');
        // Assemble final prompt
        const systemPrompt = TEMPLATE
          .replace('{{STAGE_BLEND_JSON}}', stageBlendJson)
          .replace('{{DOMINANT_BIAS_OR_NONE}}', dominantBias)
          .replace('{{GOAL_TITLE_OR_NONE}}', activeGoal)
          .replace('{{SABOTAGE_LIST_OR_NONE}}', sabotageList)
          .replace('{{DREAM_BULLET_SNIPPETS}}', dreamSnippets);

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

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase';
import { PrismaClient } from '@/generated/prisma';
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Interface for storing the actual WritableStream writer
interface ClientConnection {
    writer: WritableStreamDefaultWriter<Uint8Array>;
    encoder: TextEncoder;
}
const clients = new Map<string, ClientConnection>();

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('GET /api/coach - Auth Error:', authError);
        return new Response('Unauthorized', { status: 401 });
    }
    const userId = user.id;

    // Use TransformStream for external writing capability
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();
    const encoder = new TextEncoder();

    const clientInfo: ClientConnection = { writer, encoder };
    clients.set(userId, clientInfo);
    console.log(`Client connected: ${userId}`);

    // Send connection confirmation immediately through the writer
    writer.write(encoder.encode(': connected\n\n')).catch(err => {
        console.error(`Error sending initial confirmation to ${userId}:`, err);
        clients.delete(userId);
    });

    // Handle client disconnection
    request.signal.onabort = async () => {
        console.log(`Client disconnected: ${userId}`);
        clients.delete(userId);
        try {
            // Close the writer when client disconnects
            await writer.close();
        } catch (error) {
            console.error(`Error closing writer for ${userId}:`, error);
        }
    };

    // Return the readable side of the TransformStream
    return new Response(transformStream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

// sendSSEMessage remains the same, but client.writer is now a WritableStreamDefaultWriter
async function sendSSEMessage(userId: string, data: any) {
    const client = clients.get(userId);
    if (client) {
        try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            // This should now work correctly
            await client.writer.write(client.encoder.encode(message)); 
        } catch (error) {
            console.error(`Error sending SSE to ${userId}:`, error);
            // Clean up if write fails (e.g., client closed connection)
            clients.delete(userId); 
            try { await client.writer.close(); } catch {} 
        }
    } else {
        // This warning is expected in serverless if POST hits different instance
        console.warn(`SSE client not found for user: ${userId}`); 
    }
}

export async function POST(request: Request) {
    let userId: string | null = null; // Initialize userId
    try {
        const cookieStore = await cookies();
        const supabase = createSupabaseServerClient(cookieStore);
        const { data: { user: postUser }, error: postAuthError } = await supabase.auth.getUser();

        if (postAuthError || !postUser) {
            console.error('POST /api/coach - Auth Error:', postAuthError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        userId = postUser.id; // Assign userId

        const body = await request.json();
        const userMessage = body.message;

        if (!userMessage || typeof userMessage !== 'string') {
            return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
        }

        // --- Fetch Data for Prompt ---
        const profilePromise = prisma.spiralProfile.findUnique({ where: { userId } });
        const goalsPromise = prisma.goal.findMany({ where: { userId, completed: false }, orderBy: { createdAt: 'desc' }, take: 3 });
        const dreamsPromise = prisma.dream.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { description: true } });

        const [profile, goals, dreams] = await Promise.all([profilePromise, goalsPromise, dreamsPromise]);

        if (!profile) {
            // Send error back via SSE if connection exists, otherwise return JSON error
            await sendSSEMessage(userId, { error: "Profile not found. Cannot initialize coach."});
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // --- Construct Prompt ---
        // TODO: Refine this prompt significantly
        let prompt = `You are SpiralCoach, an AI assistant helping a user understand their personal growth through the lens of Spiral Dynamics. Maintain a supportive, insightful, and slightly guiding tone.\n\nUser Profile (Spiral Dynamics Blend):\n${JSON.stringify(profile.stageBlend || '{}')}\nDominant Bias (if any): ${profile.dominantBias || 'N/A'}\n`;

        if (goals.length > 0) {
            prompt += `\nUser's Active Goals:\n${goals.map(g => `- ${g.title} (Plan: ${JSON.stringify(g.plan)})`).join('\n')}\n`;
        }
        if (dreams.length > 0) {
            prompt += `\nUser's Recent Dreams:\n${dreams.map(d => `- ${d.description}`).join('\n')}\n`;
        }
        prompt += `\nUser Message: ${userMessage}\n\nCoach Response:`;

        console.log(`Coach Prompt for ${userId}:`, prompt); // Log for debugging

        // --- Call Gemini Streaming --- 
        // Note: Ensure your Gemini model supports streaming and safety settings are appropriate
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash", // Use the requested model
            // safetySettings: [...] // Add safety settings if needed
        });

        const result = await model.generateContentStream(prompt);

        // Stream response back to the connected client
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (userId) { 
                await sendSSEMessage(userId, { text: chunkText });
            }
        }

        // Optionally send a final "end" message if needed by the client
        // await sendSSEMessage(userId, { type: 'end' }); 

        return NextResponse.json({ success: true }); // Indicate POST success

    } catch (error: any) {
        console.error("Error in POST /api/coach:", error);
        // Attempt to inform the client via SSE if possible
        // Use the userId captured at the start of the try block if available
        if (userId) {
            try {
                 await sendSSEMessage(userId, { error: error.message || 'An internal error occurred processing your message.' });
            } catch { /* Ignore errors during error reporting */ }
        } else {
            // If userId wasn't even obtained, log that
            console.error("POST /api/coach - Could not determine user ID to send SSE error.")
        }

        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
} 

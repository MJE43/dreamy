import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

// IMPORTANT: For Vercel, export a config object to specify edge runtime and max duration
// export const config = {
//     runtime: 'edge',
//     maxDuration: 30, // Adjust as needed
// };

const prisma = new PrismaClient(); // Note: Use Prisma Accelerate/Data Proxy for Edge

// This function will be triggered by a CRON scheduler (e.g., Vercel CRON)
export async function GET(request: Request) {
    // --- Security Check --- 
    // Protect endpoint, e.g., check for a secret header passed by the CRON job
    const cronSecret = request.headers.get('Authorization')?.split(' ')[1];
    if (cronSecret !== process.env.CRON_SECRET) {
        console.warn('Unauthorized CRON attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Running scheduled check-warnings job...');

    try {
        // --- Placeholder Logic --- 
        // In a real scenario, you'd fetch users and their recent check-ins/data
        
        // Example: Fetch users who checked in recently (adjust logic as needed)
        const recentCheckInCutoff = new Date();
        recentCheckInCutoff.setHours(recentCheckInCutoff.getHours() - 12); // e.g., last 12 hours

        const usersToCheck = await prisma.checkIn.findMany({
            where: { createdAt: { gte: recentCheckInCutoff } },
            select: { userId: true },
            distinct: ['userId']
        });

        let alertsCreated = 0;
        for (const { userId } of usersToCheck) {
            // Fetch last 2 check-ins for this user to compare
            const checkIns = await prisma.checkIn.findMany({
                where: { userId: userId },
                orderBy: { createdAt: 'desc' },
                take: 2
            });

            if (checkIns.length < 2) continue; // Need at least two points to compare

            const latestCheckIn = checkIns[0];
            const previousCheckIn = checkIns[1];

            // --- Basic Rule Example: Significant Mood Dip --- 
            if (latestCheckIn.mood < 3 && previousCheckIn.mood >= 3) { // e.g., Mood dropped below 3
                const message = `Detected a potential mood dip based on recent check-ins.`;
                await prisma.alert.create({
                    data: {
                        userId: userId,
                        type: 'mood_dip',
                        message: message,
                        // isRead defaults to false
                    }
                });
                alertsCreated++;
                console.log(`Created 'mood_dip' alert for user ${userId}`);
            }
            
            // --- TODO: Add more rules --- 
            // e.g., Sustained high stress, Goal stagnation (needs Goal data), Sleep pattern changes (needs health data)
        }

        console.log(`Scheduled job finished. Created ${alertsCreated} alerts.`);
        return NextResponse.json({ success: true, alertsCreated });

    } catch (error: unknown) {
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error in check-warnings CRON job:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 

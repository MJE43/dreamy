'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Goal, SpiralProfile } from "@/generated/prisma"; // Import types
import { MotifData } from "@/types"; // Import type
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import charting/visualization components
const StageTimelineChart = dynamic(() => import('@/components/charts/StageTimelineChart'), { // Placeholder path
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />
});
const StreakCounter = dynamic(() => import('@/components/progress/StreakCounter'), { // Placeholder path
    ssr: false, // May need client-side logic
    loading: () => <Skeleton className="h-[100px] w-full" />
});
const DreamTagCloud = dynamic(() => import('@/components/progress/DreamTagCloud'), { // Placeholder path
    ssr: false, // react-tagcloud likely needs client
    loading: () => <Skeleton className="h-[250px] w-full" />
});

interface ProgressClientProps {
    initialProfile: (Pick<SpiralProfile, 'createdAt'> & { stageBlend: Record<string, number> | null }) | null;
    initialGoals: Goal[];
    initialTags: MotifData[];
}

export default function ProgressClient({
    initialProfile,
    initialGoals,
    initialTags
}: ProgressClientProps) {

    // TODO: Add state and potentially client-side calculations if needed

    // Prepare data for charts (might involve client-side processing)
    // For timeline: need historical data or mock it
    const timelineData = initialProfile ? [
        {
            date: initialProfile.createdAt.toISOString().split('T')[0],
            ...(initialProfile.stageBlend || {})
        }
        // Add more data points here if historical data was available
    ] : [];

    // For streaks: logic to calculate streaks from initialGoals
    const streakData = { /* Placeholder for calculated streak info */ };

    return (
        <div className="container mx-auto px-4 py-6 md:px-6 lg:py-8">
            <h1 className="text-2xl font-semibold mb-6">Progress Overview</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Stage Timeline Chart */}
                <Card className="lg:col-span-2"> {/* Span full width */} 
                    <CardHeader><CardTitle>Worldview Timeline</CardTitle></CardHeader>
                    <CardContent>
                        {timelineData.length > 0 ? (
                            <StageTimelineChart data={timelineData} />
                        ) : (
                            <p className="text-muted-foreground">Not enough data for timeline yet.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Goal Streaks */}
                <Card>
                    <CardHeader><CardTitle>Goal Streaks</CardTitle></CardHeader>
                    <CardContent>
                        <StreakCounter goals={initialGoals} /> 
                        {/* Pass necessary data to StreakCounter */}
                    </CardContent>
                </Card>

                {/* Tag Cloud */}
                <Card>
                    <CardHeader><CardTitle>Dream Tag Cloud</CardTitle></CardHeader>
                    <CardContent>
                        {initialTags.length > 0 ? (
                           <DreamTagCloud tags={initialTags} />
                        ) : (
                            <p className="text-muted-foreground">No dream tags found yet.</p>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
} 

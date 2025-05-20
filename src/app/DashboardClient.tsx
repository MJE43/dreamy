'use client'

import React from 'react';
// import type { Session } from "next-auth"; // Removed unused import
// import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";
import { RecentDream } from "@/types"; // Import shared types
import { Prisma } from "@/generated/prisma"; // Import Prisma namespace only
// import { Prisma, type Goal } from "@/generated/prisma"; // Import Prisma namespace and Goal type
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
// import type { Session } from "next-auth"; // Removed unused import
// import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton
import { RecentDream } from "@/types"; // Import shared types
import { Prisma } from "@/generated/prisma"; // Import Prisma namespace only
import CoachPreviewCard from "@/components/CoachPreviewCard";
import RecentDreamsList from '@/components/dreams/RecentDreamsList';
import SpiralPassport from '@/components/SpiralPassport';
import { GoalCard, GoalCardData } from '@/components/goals/GoalCard'; // Import GoalCard and its data type
import Link from 'next/link'; // Import Link for "Create New Goal"
import { PlusCircle } from 'lucide-react'; // Icon for new goal button

// Shared types are now imported from @/types
// type RecentDream = { ... };
// type MoodData = { ... };
// type MotifData = { ... };

// Dynamically import components that require client-side rendering
// Removed MoodChart and MotifCloud as they will move to /progress
/* 
const MoodChart = dynamic(() => import("@/components/charts/MoodChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[240px] w-full" />,
});
const MotifCloud = dynamic(() => import("@/components/dreams/MotifCloud"), {
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full aspect-video" />
});
*/
// Removed unused dynamic import for DreamInputForm
// const DreamInputForm = dynamic(() => import("@/components/dreams/DreamInputForm"), { ... });
// Removed dynamic import for RecentDreamsList as it's imported directly now
// const RecentDreamsList = dynamic(() => import("@/components/dreams/RecentDreamsList"), { ... });
// Removed dynamic import for SpiralPassport as it's imported directly now
// const SpiralPassport = dynamic(() => import("@/components/SpiralPassport"), { ... });

// Removed dynamic import for CoachChat as it's imported directly now
// const CoachChat = dynamic(() => import("@/components/CoachChat"), { ... });

// Define props for the Client Component using imported types
interface DashboardClientProps {
  initialDreams: RecentDream[];
  // initialMoodData: MoodData[]; // Removed
  // initialTopMotifs: MotifData[]; // Removed
  initialStageBlend: Prisma.JsonValue | null;
  initialDominantBias: string | null;
}

// Define the Goal type matching GoalCardData and API response
// This should align with the select statement in GET /api/goals
type Goal = GoalCardData & { 
  // Add any other fields returned by GET /api/goals if needed for other purposes
  // For GoalCard, GoalCardData is sufficient
  createdAt?: string; // Optional, if needed elsewhere
  updatedAt?: string; // Optional, if needed elsewhere
};


export default function DashboardClient({
  initialDreams,
  initialStageBlend,
  initialDominantBias
}: DashboardClientProps) {
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [errorGoals, setErrorGoals] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoadingGoals(true);
      setErrorGoals(null);
      try {
        const response = await fetch('/api/goals');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch goals');
        }
        const goalsData: Goal[] = await response.json();
        setUserGoals(goalsData);
      } catch (err) {
        setErrorGoals(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoadingGoals(false);
      }
    };
    fetchGoals();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Passport & Goals */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spiral Passport</CardTitle>
            </CardHeader>
            <CardContent>
              <SpiralPassport
                stageBlend={initialStageBlend as Record<string, number>}
                narrativeSummary={initialDominantBias}
              />
            </CardContent>
          </Card>

          {/* Goals Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold tracking-tight">My Goals</h2>
              <Link href="/goal" passHref> {/* Assuming /goal is the page to create a new goal */}
                <Button variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Goal
                </Button>
              </Link>
            </div>
            {isLoadingGoals && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            )}
            {errorGoals && <p className="text-destructive">Error loading goals: {errorGoals}</p>}
            {!isLoadingGoals && !errorGoals && userGoals.length === 0 && (
              <Card className="text-center">
                <CardHeader>
                  <CardTitle>No Goals Yet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Ready to make some progress? Create your first goal!</p>
                  <Link href="/goal" passHref> {/* Assuming /goal is the page to create a new goal */}
                     <Button>Set a New Goal</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            {!isLoadingGoals && !errorGoals && userGoals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userGoals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Coach & Recent Dreams (No changes here) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dashboard chat preview card */}
          <CoachPreviewCard />
          {/* Recent Dreams List */}
          <RecentDreamsList dreams={initialDreams} />
        </div>

        {/* --- Mobile FAB (keep if desired) --- */}
        {/* <Button
          className="fixed bottom-6 right-6 lg:hidden rounded-full w-14 h-14 shadow-lg z-50"
          size="icon"
          // TODO: Add onClick to open modal for Dream Input
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">New Dream</span>
        </Button> */}

      </div>
    </div>
  );
} 

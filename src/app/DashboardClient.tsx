'use client'

import React from 'react';
// import type { Session } from "next-auth"; // Removed unused import
// import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";
import { RecentDream } from "@/types"; // Import shared types
import { Prisma } from "@/generated/prisma"; // Import Prisma namespace only
// import { Prisma, type Goal } from "@/generated/prisma"; // Import Prisma namespace and Goal type
// Removed unused Dialog imports
// import GoalCreatorModal from '@/components/GoalCreatorModal';
import CoachChat from "@/components/CoachChat";
import RecentDreamsList from '@/components/dreams/RecentDreamsList'; // Corrected import path
import SpiralPassport from '@/components/SpiralPassport'; // Ensure correct import path

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
  initialStageBlend: Prisma.JsonValue | null; // Add stageBlend prop
  initialDominantBias: string | null; // Add prop for narrative summary
  // session: Session; // Session prop is no longer needed here
}

export default function DashboardClient({
  initialDreams,
  // initialMoodData, // Removed
  // initialTopMotifs, // Removed
  initialStageBlend,
  initialDominantBias
}: DashboardClientProps) {
  // Removed unused state and handler for old goal functionality
  // const [userGoals, setUserGoals] = useState<Goal[]>([]);
  // const handleGoalCreated = (newGoal: Goal) => {
  //   setUserGoals(prev => [newGoal, ...prev]);
  //   // TODO: Maybe show a toast or update UI specifically
  // };

  // No need for loading state or session check here, handled by server component

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:py-8">
      {/* Updated 2-column layout based on mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- Column 1: Passport & Goal (Takes up 2/3 width on large screens) --- */}
        <div className="lg:col-span-2 space-y-6">
          <SpiralPassport
            stageBlend={initialStageBlend as Record<string, number>}
            narrativeSummary={initialDominantBias}
          />
          {/* Goal Card - Moved here */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Goal</CardTitle> {/* Changed title */}
              {/* TODO: Replace button or move functionality later */}
              {/* <GoalCreatorModal onGoalCreated={handleGoalCreated}>
                <Button size=\"sm\" variant=\"outline\">
                  <Plus className=\"h-4 w-4 mr-1\" /> Set Goal
                </Button>
              </GoalCreatorModal> */}
               <Button size="sm">Add check-in</Button> {/* TEMP: Added mockup button */}
            </CardHeader>
            <CardContent>
              {/* TODO: Implement Goal display based on mockup */}
              <h3 className="text-xl font-semibold mb-1">Reach 1,000 followers</h3> {/* Mockup Text */}
              <p className="text-sm text-muted-foreground mb-4">Post consistent, high-quality content to grow my audience.</p> {/* Mockup Text */}
              <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700"> {/* Mockup Progress */}
                 <div className="bg-blue-600 h-2.5 rounded-full" style={{width: "45%"}}></div> {/* Mockup Progress */}
              </div>

              {/* Original Goal List Logic - commented out for now */}
              {/* {userGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No goals set yet. Click &apos;Set Goal&apos; to create one.</p>
              ) : (
                <ul className="space-y-2">
                  {userGoals.map(goal => (
                    <li key={goal.id} className="text-sm p-2 border rounded-md">{goal.title}</li>
                  ))}
                </ul>
              )} */}
            </CardContent>
          </Card>
        </div>

        {/* --- Column 2: Coach & Recent Dreams (Takes up 1/3 width on large screens) --- */}
        <div className="lg:col-span-1 space-y-6">
          {/* Coach Card - Moved here */}
          <Card>
            <CardHeader>
              <CardTitle>Coach</CardTitle>
            </CardHeader>
            <CardContent>
              <CoachChat />
            </CardContent>
          </Card>
          {/* Recent Dreams List - Remains here */}
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

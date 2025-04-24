'use client'

import { useState } from "react";
// import type { Session } from "next-auth"; // Removed unused import
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentDream, MoodData, MotifData } from "@/types"; // Import shared types
import { Prisma } from "@/generated/prisma"; // Import Prisma for types

// Shared types are now imported from @/types
// type RecentDream = { ... };
// type MoodData = { ... };
// type MotifData = { ... };

// Dynamically import components that require client-side rendering
const MoodChart = dynamic(() => import("@/components/charts/MoodChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[240px] w-full" />,
});
const MotifCloud = dynamic(() => import("@/components/dreams/MotifCloud"), {
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full aspect-video" />
});
const DreamInputForm = dynamic(() => import("@/components/dreams/DreamInputForm"), {
  loading: () => <Skeleton className="h-[300px] w-full" />
});
const RecentDreamsList = dynamic(() => import("@/components/dreams/RecentDreamsList"), {
  loading: () => <Skeleton className="h-[400px] w-full" />
});
const SpiralPassport = dynamic(() => import("@/components/SpiralPassport"), { // Dynamically import Passport
    ssr: false, // Recharts needs client side
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />
});

// Define props for the Client Component using imported types
interface DashboardClientProps {
  initialDreams: RecentDream[];
  initialMoodData: MoodData[];
  initialTopMotifs: MotifData[];
  initialStageBlend: Prisma.JsonValue | null; // Add stageBlend prop
  // session: Session; // Session prop is no longer needed here
}

export default function DashboardClient({
  initialDreams,
  initialMoodData,
  initialTopMotifs,
  initialStageBlend
}: DashboardClientProps) {
  // State initialized with props from the Server Component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dreams, setDreams] = useState<RecentDream[]>(initialDreams);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [moodData, setMoodData] = useState<MoodData[]>(initialMoodData);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [topMotifs, setTopMotifs] = useState<MotifData[]>(initialTopMotifs);
  const [stageBlend, setStageBlend] = useState(initialStageBlend);
  const [filterMotif, setFilterMotif] = useState<string | null>(null);

  // TODO: Implement client-side logic to update `dreams`, `moodData`, `topMotifs`, `stageBlend`
  // For example, after submitting a new dream via DreamInputForm or after profile re-analysis

  const handleMotifClick = (motif: string) => {
    setFilterMotif(prev => prev === motif ? null : motif); // Toggle filter
  };

  const filteredDreams = filterMotif
    ? dreams.filter(dream => 
        dream.tags?.some(tag => tag.trim().toLowerCase() === filterMotif)
      )
    : dreams;

  // No need for loading state or session check here, handled by server component

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(auto,_20rem)] gap-6">

        {/* --- Column 1: Spiral Passport & Coach Placeholder --- */}
        <div className="lg:col-span-1 space-y-6">
          <SpiralPassport stageBlend={stageBlend as Record<string, number>} />
          <Card>
            <CardHeader><CardTitle>Daily Coach</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
              {/* Placeholder for CoachChat component (Step 7) */}
            </CardContent>
          </Card>
        </div>

        {/* --- Column 2: Insights (Existing) --- */}
        <div className="lg:col-span-1 space-y-6">
            <MoodChart data={moodData} />
            <MotifCloud motifs={topMotifs} onMotifClick={handleMotifClick} />
             {/* Consider moving Dream Input here or elsewhere */}
            {/* <Card>
                <CardHeader><CardTitle className="text-xl">New Dream</CardTitle></CardHeader>
                <CardContent><DreamInputForm /></CardContent>
            </Card> */}
        </div>

        {/* --- Column 3: Recent Dreams (Existing Sidebar) --- */}
        <div className="lg:col-span-1 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto xxl:fixed xxl:right-0 xxl:top-0 xxl:bottom-0 xxl:w-80 xxl:border-l xxl:border-border xxl:bg-background xxl:p-6 xxl:pt-20">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Dreams</h3>
                 {/* Quick Add button mentioned in roadmap snapshot */}
                <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
            </div>
            <RecentDreamsList dreams={filteredDreams} />
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

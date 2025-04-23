'use client'

import { useState } from "react";
// import type { Session } from "next-auth"; // Removed unused import
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentDream, MoodData, MotifData } from "@/types"; // Import shared types

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

// Define props for the Client Component using imported types
interface DashboardClientProps {
  initialDreams: RecentDream[];
  initialMoodData: MoodData[];
  initialTopMotifs: MotifData[];
  // session: Session; // Session prop is no longer needed here
}

export default function DashboardClient({
  initialDreams,
  initialMoodData,
  initialTopMotifs,
  // session // Remove session from destructuring
}: DashboardClientProps) {
  // State initialized with props from the Server Component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dreams, setDreams] = useState<RecentDream[]>(initialDreams);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [moodData, setMoodData] = useState<MoodData[]>(initialMoodData);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [topMotifs, setTopMotifs] = useState<MotifData[]>(initialTopMotifs);
  const [filterMotif, setFilterMotif] = useState<string | null>(null);

  // TODO: Implement client-side logic to update `dreams`, `moodData`, `topMotifs`
  // For example, after submitting a new dream via DreamInputForm

  const handleMotifClick = (motif: string) => {
    setFilterMotif(prev => prev === motif ? null : motif); // Toggle filter
  };

  const filteredDreams = filterMotif
    ? dreams.filter(dream =>
        dream.tags?.split(',').map(t => t.trim().toLowerCase()).includes(filterMotif)
      )
    : dreams;

  // No need for loading state or session check here, handled by server component

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(auto,_24rem)_1fr_20rem] gap-6">

        {/* --- Column 1: Input & Title --- */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-xl">New Dream</CardTitle></CardHeader>
            <CardContent><DreamInputForm /></CardContent> {/* Needs logic to update state */}
          </Card>
        </div>

        {/* --- Column 2: Insights --- */}
        <div className="lg:col-span-1 space-y-6">
          <MoodChart data={moodData} />
          <MotifCloud motifs={topMotifs} onMotifClick={handleMotifClick} />
        </div>

        {/* --- Column 3: Recent Dreams (Sidebar) --- */}
        <div className="lg:col-span-1 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto xxl:fixed xxl:right-0 xxl:top-0 xxl:bottom-0 xxl:w-80 xxl:border-l xxl:border-border xxl:bg-background xxl:p-6 xxl:pt-20">
          <RecentDreamsList dreams={filteredDreams} />
        </div>

        {/* --- Mobile FAB --- */}
        <Button
          className="fixed bottom-6 right-6 lg:hidden rounded-full w-14 h-14 shadow-lg z-50"
          size="icon"
          // TODO: Add onClick to open modal
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">New Dream</span>
        </Button>

      </div>
    </div>
  );
} 

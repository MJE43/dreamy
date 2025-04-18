'use client' // Convert page to client component for state/interaction

import { useState } from "react"; // Removed useEffect import
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth"; // Import Session type from next-auth
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { PrismaClient } from "@/generated/prisma"; // This might need adjustment if fetching is moved client-side
import dynamic from "next/dynamic"; // Import dynamic
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Dynamically import components
const MoodChart = dynamic(() => import("@/components/charts/MoodChart"), {
  ssr: false, // Disable SSR for client-side chart library
  loading: () => <Skeleton className="h-[240px] w-full" />, // Basic skeleton
});

const MotifCloud = dynamic(() => import("@/components/dreams/MotifCloud"), {
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full aspect-video" /> // Basic skeleton
});

const DreamInputForm = dynamic(() => import("@/components/dreams/DreamInputForm"), {
  loading: () => <Skeleton className="h-[300px] w-full" /> // Skeleton for form too
});

const RecentDreamsList = dynamic(() => import("@/components/dreams/RecentDreamsList"), {
  loading: () => <Skeleton className="h-[400px] w-full" /> // Skeleton for list
});

// Define types for data fetched server-side (can move later)
// Updated RecentDream type
type RecentDream = {
  id: string;
  createdAt: Date;
  description: string;
  mood: number;
  tags: string | null; // Added tags field
  analysis: {
    content: string;
  } | null;
};
type MoodData = { date: string; mood: number };
type MotifData = { tag: string; count: number };

// Define props for the Client Component
interface DashboardClientProps {
  initialDreams: RecentDream[];
  initialMoodData: MoodData[];
  initialTopMotifs: MotifData[];
  session: Session | null; // Pass the session object
}

function DashboardClient({
  initialDreams,
  initialMoodData,
  initialTopMotifs,
  session
}: DashboardClientProps) {
  // State initialized with props from the Server Component
  const [dreams, setDreams] = useState<RecentDream[]>(initialDreams);
  const [moodData, setMoodData] = useState<MoodData[]>(initialMoodData);
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

  // Removed useEffect for initial data fetching
  // Removed isLoading state for initial fetch

  if (!session) {
    // Should ideally be handled by the redirect in the server component,
    // but good practice to have a fallback.
    return <div className="flex justify-center items-center min-h-screen">Authentication required. Redirecting...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(auto,_24rem)_1fr_20rem] gap-6 p-4 md:p-8 min-h-screen">
      
      {/* --- Column 1: Input & Title --- */}
      <div className="lg:col-span-1 space-y-6">
        {/* Conditionally render title based on session loading state? */}
        {/* isLoading ? (
           <Skeleton className="h-10 w-3/4 mb-2" />
        ) : ( */}
           <div>
             <h1 className="text-4xl font-bold tracking-tight mb-2">log a dream, unveil the subtext.</h1>
             <p className="text-muted-foreground max-w-2xl">
                {`Welcome back, ${session.user.name || session.user.email}.`}
             </p>
           </div>
        {/* )} */}
        <Card>
          <CardHeader><CardTitle className="text-xl">New Dream</CardTitle></CardHeader>
          <CardContent><DreamInputForm /></CardContent> {/* Needs logic to update state */} 
        </Card>
      </div>

      {/* --- Column 2: Insights --- */}
      <div className="lg:col-span-1 space-y-6">
        <MoodChart data={moodData} /> {/* Uses dynamic import skeleton */} 
        <MotifCloud motifs={topMotifs} onMotifClick={handleMotifClick} /> {/* Uses dynamic import skeleton */} 
      </div>

      {/* --- Column 3: Recent Dreams (Sidebar) --- */}
      <div className="lg:col-span-1 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto xxl:fixed xxl:right-0 xxl:top-0 xxl:bottom-0 xxl:w-80 xxl:border-l xxl:border-border xxl:bg-background xxl:p-6 xxl:pt-20">
        <RecentDreamsList dreams={filteredDreams} /> {/* Uses dynamic import skeleton */} 
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
  );
}

// --- Server Component (Default Export) ---
// Fetches data on the server and passes it to the Client Component
export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/");
    // return null; // Redirect will stop execution, but return null for type safety if needed
  }
  const userId = session.user.id;
  const prisma = new PrismaClient(); // Instantiate prisma here on the server

  // Fetch Recent Dreams
  const recentDreams = await prisma.dream.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, createdAt: true, description: true, mood: true, tags: true,
      analysis: { select: { content: true } }
    }
  });

  // Fetch Mood Data
  const moodDataRaw = await prisma.dream.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'asc' },
    take: 30,
    select: { createdAt: true, mood: true }
  });
  const moodData = moodDataRaw.map(dream => ({
    date: new Date(dream.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    mood: dream.mood,
  }));

  // Fetch Tags for Motif Cloud
  const allDreamsForTags = await prisma.dream.findMany({
    where: { userId: userId },
    select: { tags: true }
  });
  
  // Reusing helper function - might need to be moved/imported
  function getTopMotifs(dreams: { tags: string | null }[], count: number): MotifData[] {
    const tagCounts: { [key: string]: number } = {};
    dreams.forEach(dream => {
      if (dream.tags) {
        dream.tags.split(',').forEach(tag => {
          const trimmedTag = tag.trim().toLowerCase();
          if (trimmedTag) {
            tagCounts[trimmedTag] = (tagCounts[trimmedTag] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }
  const topMotifs = getTopMotifs(allDreamsForTags, 15); // Get top 15 motifs for cloud

  // Clean up Prisma connection (optional but good practice if not using accelerate/pgbouncer)
  // await prisma.$disconnect(); // Consider if needed based on deployment environment

  // Render the Client Component with fetched data
  return (
    <DashboardClient
      initialDreams={recentDreams}
      initialMoodData={moodData}
      initialTopMotifs={topMotifs}
      session={session}
    />
  );
}

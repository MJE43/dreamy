import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { PrismaClient } from "@/generated/prisma";
import DreamInputForm from "@/components/dreams/DreamInputForm";
import RecentDreamsList from "@/components/dreams/RecentDreamsList";
import MoodChart from "@/components/charts/MoodChart";
import TopMotifs from "@/components/dreams/TopMotifs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const prisma = new PrismaClient();

// Helper function to process tags
function getTopMotifs(dreams: { tags: string }[], count: number): { tag: string; count: number }[] {
  const tagCounts: { [key: string]: number } = {};

  dreams.forEach(dream => {
    if (dream.tags) {
      dream.tags.split(',').forEach(tag => {
        const trimmedTag = tag.trim().toLowerCase(); // Normalize tags
        if (trimmedTag) {
          tagCounts[trimmedTag] = (tagCounts[trimmedTag] || 0) + 1;
        }
      });
    }
  });

  // Convert to array, sort by count, and take top N
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, count);
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/");
  }

  const userId = session.user.id;

  // Fetch recent dreams for the logged-in user
  const recentDreams = await prisma.dream.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, createdAt: true, description: true }
  });

  // Fetch data for Mood Chart (last 30 entries)
  const moodDataRaw = await prisma.dream.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'asc' }, // Fetch in ascending order for chart
    take: 30,
    select: { createdAt: true, mood: true }
  });

  // Format mood data for the chart (e.g., { date: "MM/DD", mood: 3 })
  const moodData = moodDataRaw.map(dream => ({
    date: new Date(dream.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    mood: dream.mood,
    // Optional: Add full date for tooltips if needed
    // fullDate: new Date(dream.createdAt).toLocaleDateString('en-US')
  }));

  // Fetch all dreams for tag processing
  const allDreamsForTags = await prisma.dream.findMany({
    where: { userId: userId },
    select: { tags: true } // Only select tags field
  });

  // Process tags to get top motifs
  const topMotifs = getTopMotifs(allDreamsForTags, 8); // Get top 8 motifs

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Top Title Section */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">log a dream, unveil the subtext.</h1>
        <p className="text-muted-foreground max-w-2xl">
          Welcome back, {session.user.name || session.user.email}. Record your latest dream or explore your recent entries and insights.
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-xl">New Dream</CardTitle></CardHeader>
            <CardContent><DreamInputForm /></CardContent>
          </Card>
          <TopMotifs motifs={topMotifs} />
        </div>

        {/* Column 2 */} 
        {/* Changed grid span for better alignment */}
        <div className="space-y-6 md:col-span-1 lg:col-span-1">
           <MoodChart data={moodData} />
        </div>
        
         {/* Recent Dreams List (now takes full width on mobile, spans 2 cols on lg) */}
         {/* Adjusted grid position for this component */}
         <div className="md:col-span-2 lg:col-span-1">
            <RecentDreamsList dreams={recentDreams} />
         </div>
      </div>
    </div>
  );
}

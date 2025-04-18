import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth"; // Keep Session type import here
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { PrismaClient } from "@/generated/prisma";
import DashboardClient from "./DashboardClient";
import { RecentDream, MoodData, MotifData } from "@/types"; // Import shared types

// Type definitions are now imported from @/types

// --- Server Component (Default Export) ---
export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/");
  }
  const userId = session.user.id;
  const prisma = new PrismaClient();

  // Fetch Recent Dreams (Type is inferred or can use RecentDream[])
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
  // Explicitly type the mapped array
  const moodData: MoodData[] = moodDataRaw.map(dream => ({
    date: new Date(dream.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    mood: dream.mood,
  }));

  // Fetch Tags for Motif Cloud
  const allDreamsForTags = await prisma.dream.findMany({
    where: { userId: userId },
    select: { tags: true }
  });

  // Helper function for motifs
  // Use imported MotifData type
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
  // Explicitly type the result array
  const topMotifs: MotifData[] = getTopMotifs(allDreamsForTags, 15);

  // Render the Client Component with fetched data
  return (
    <DashboardClient
      initialDreams={recentDreams}
      initialMoodData={moodData}
      initialTopMotifs={topMotifs}
      session={session} // Keep passing session
    />
  );
}

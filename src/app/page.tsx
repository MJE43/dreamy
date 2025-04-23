import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from "@/generated/prisma";
import { MoodData, MotifData, RecentDream } from "@/types";
import DashboardClient from "./DashboardClient";

// --- Server Component (Default Export) ---
export default async function Page() {
  // --- Supabase Auth Check ---
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Home Page - Auth Error:', authError);
    redirect('/login');
  }
  const userId = user.id;
  // --- End Auth Check ---

  const prisma = new PrismaClient();

  // Fetch Recent Dreams
  const recentDreams: RecentDream[] = await prisma.dream.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true, createdAt: true, description: true, mood: true, tags: true,
      analysis: { select: { id: true, content: true, createdAt: true } }
    }
  });

  // Fetch Mood Data
  const moodDataRaw = await prisma.dream.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'asc' },
    take: 30,
    select: { createdAt: true, mood: true }
  });
  const moodData: MoodData[] = moodDataRaw.map(dream => ({
    date: new Date(dream.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    mood: dream.mood,
  }));

  // Fetch Tags for Motif Cloud
  const allDreamsForTags = await prisma.dream.findMany({
    where: { userId: userId },
    select: { tags: true }
  });

  // Keep helper function for motifs
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
  // Calculate topMotifs - needed by DashboardClient
  const topMotifs: MotifData[] = getTopMotifs(allDreamsForTags, 15);

  return (
    <DashboardClient
      initialDreams={recentDreams}   // Pass as initialDreams
      initialMoodData={moodData}     // Pass as initialMoodData
      initialTopMotifs={topMotifs}  // Pass topMotifs as initialTopMotifs
    />
  );
}

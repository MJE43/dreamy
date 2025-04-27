import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import /* PrismaClient, Goal */ "@/generated/prisma"; // Goal & PrismaClient removed
import /* MotifData */ "@/types"; // MotifData removed
import ProgressClient from "./ProgressClient"; // Placeholder for client component

export default async function ProgressPage() {
  // --- Auth Check ---
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }
  // const userId = user.id; // Commented out - not used

  // const prisma = new PrismaClient(); // Comment out if not used elsewhere (or keep if needed)

  // --- Fetch Data ---
  // Commented out as props are removed from ProgressClient
  /*
    // Fetch Current Profile (for potential future timeline use)
    const currentProfile = await prisma.spiralProfile.findUnique({
        where: { userId: userId },
        select: { stageBlend: true, createdAt: true } // Get creation date too
    });

    // Fetch Goals (for streaks)
    const userGoals: Goal[] = await prisma.goal.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }
        // Select necessary fields for streak calculation (e.g., completed, updatedAt)
    });

    // Fetch Tags for Tag Cloud
    const allDreamsForTags = await prisma.dream.findMany({
        where: { userId: userId },
        select: { tags: true }
    });

    // Re-use helper function from dashboard page (consider moving to a lib file)
    function getTopMotifs(dreams: { tags: string[] | null }[], count: number): MotifData[] {
        const tagCounts: { [key: string]: number } = {};
        dreams.forEach(dream => {
            if (dream.tags) {
                dream.tags.forEach(tag => {
                const trimmedTag = tag.trim().toLowerCase();
                if (trimmedTag) {
                    tagCounts[trimmedTag] = (tagCounts[trimmedTag] || 0) + 1;
                }
                });
            }
        });
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count })) // Changed value->count for clarity
            .sort((a, b) => b.count - a.count)
            .slice(0, count);
    }
    const topTagsForCloud: MotifData[] = getTopMotifs(allDreamsForTags, 30); // Get more tags for cloud
    */

  // --- Pass data to Client Component ---
  return (
    <ProgressClient
    // initialProfile={currentProfile} // Removed prop
    // initialGoals={userGoals} // Removed prop
    // initialTags={topTagsForCloud} // Removed prop
    />
  );
} 

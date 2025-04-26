import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from "@/generated/prisma";
import { RecentDream } from "@/types";
import DashboardClient from "./DashboardClient";

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
  
  const prisma = new PrismaClient();
  
  // --- Check if Onboarding is Complete --- 
  const spiralProfile = await prisma.spiralProfile.findUnique({
    where: { userId: userId },
    select: { stageBlend: true, dominantBias: true }
  });

  // If no profile or no stageBlend, redirect to onboarding
  if (!spiralProfile || !spiralProfile.stageBlend) {
    console.log(`User ${userId} hasn't completed onboarding. Redirecting...`);
    redirect('/onboarding/step-1');
  }

  // --- Onboarding Complete: Fetch Dashboard Data --- 
  console.log(`User ${userId} has completed onboarding. Fetching dashboard data...`);

  // Fetch Recent Dreams (Only fetch needed for dashboard)
  const recentDreams: RecentDream[] = await prisma.dream.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true, createdAt: true, description: true, mood: true, tags: true,
      analysis: { select: { id: true, content: true, createdAt: true } }
    }
  });
  
  return (
    <DashboardClient
      initialDreams={recentDreams}
      initialStageBlend={spiralProfile.stageBlend}
      initialDominantBias={spiralProfile.dominantBias}
    />
  );

  // Remove minimal test element
  /*
  return (
    <div>
      <h1>Root Page Test</h1>
      <p>If you see this, the basic routing works.</p>
    </div>
  );
  */
}

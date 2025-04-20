import { getServerSession } from "next-auth/next";
// import { authOptions } from "./api/auth/[...nextauth]/route"; // Old path
import { authOptions } from "@/lib/authOptions"; // New path
import { redirect } from 'next/navigation';
import { PrismaClient } from "@/generated/prisma";
// import DashboardClient from "./DashboardClient"; // No longer using DashboardClient
import { MoodData, MotifData, RecentDream } from "@/types";
import dynamic from "next/dynamic";
import { Suspense } from "react"; // Import Suspense

// Import UI components and icons used in the v0 layout
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input"; // Keep if needed for Tag input in New Dream - Unused
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Uncomment Tabs import - Unused here now
// import { Textarea } from "@/components/ui/textarea"; // Likely handled by DreamInputForm
// import { Slider } from "@/components/ui/slider"; // Likely handled by DreamInputForm
// import { Badge } from "@/components/ui/badge"; // Unused
import { MoonStar, /* Sun, */ PlusCircle, /* TrendingUp, Cloud, */ Clock, Settings } from "lucide-react"; // Removed Sun, TrendingUp, Cloud
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
// import { ThemeToggle } from "@/components/theme/ThemeProvider"; // Trying specific file - Incorrect
// import { ThemeToggle } from "@/components/theme/theme-toggle"; // Also failed

// Dynamically import components that require client-side rendering
// Renamed imports for clarity
/* Remove dynamic imports for MoodChart/MotifCloud, handled in InsightsClient
const DynamicMoodChart = dynamic(() => import("@/components/charts/MoodChart"), {
  ssr: false, // This caused the error
  loading: () => <Skeleton className="h-[250px] w-full" />,
});
const DynamicMotifCloud = dynamic(() => import("@/components/dreams/MotifCloud"), {
  ssr: false, // This caused the error
  loading: () => <Skeleton className="h-[250px] w-full aspect-video" />,
});
*/
const DynamicDreamInputForm = dynamic(() => import("@/components/dreams/DreamInputForm"), {
  loading: () => <Skeleton className="min-h-[300px] w-full" />,
});
const DynamicRecentDreamsList = dynamic(() => import("@/components/dreams/RecentDreamsList"), {
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

// Import the new client component
import InsightsClient from "@/components/dashboard/InsightsClient";

// --- Server Component (Default Export) ---
export default async function Page() { // Renamed to Page
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/");
  }
  const userId = session.user.id;
  const userName = session.user.name || session.user.email?.split('@')[0] || "User"; // Get user name
  const userImage = session.user.image; // Get user image
  // const userEmail = session.user.email; // Get user email for fallback - Unused
  const userFallback = userName?.substring(0, 2).toUpperCase() || "ME";

  const prisma = new PrismaClient();

  // Fetch Recent Dreams (Type is inferred or can use RecentDream[])
  const recentDreams: RecentDream[] = await prisma.dream.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5, // Limit initial fetch for the card display
    select: {
      id: true, createdAt: true, description: true, mood: true, tags: true,
      analysis: { select: { id: true, content: true, createdAt: true } } // Include analysis status
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
  const hasEnoughMoodData = moodData.length >= 3;

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
      .map(([tag, count]) => ({ tag, count })) // Use 'tag' to match MotifData type
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }
  // Explicitly type the result array
  const topMotifs: MotifData[] = getTopMotifs(allDreamsForTags, 15);

  // --- Fetch Dream Patterns Data (Example - replace with actual logic if needed) ---
  const recurringThemesCount = await prisma.dream.count({
      where: {
          userId: userId,
          // Add criteria for recurring themes if applicable
          // e.g., based on tags appearing multiple times? Requires more complex query.
          // For now, just using total count as placeholder
      },
  });
  /* // Commenting out Lucid Dreams count due to missing isLucid field
  const lucidDreamsCount = await prisma.dream.count({
      where: {
          userId: userId,
          isLucid: true, // Assuming an 'isLucid' field exists
      },
  });
  */
  // --- End Fetch Dream Patterns Data ---


  // Render the new v0 layout structure
  return (
    // Removed outer div from previous version, body already has gradient
    // <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-slate-950 dark:to-purple-950">
      <div className="px-4 py-6">
        {/* Header - Using v0 structure */}
        {/* Consider removing Header from layout.tsx if this is preferred */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <MoonStar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dreamscape</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Integrate ThemeToggle - Commented out due to import issues */}
             {/* <ThemeToggle /> */}
            {/* User Avatar */}
            <Avatar className="h-9 w-9 border-2 border-purple-200 dark:border-purple-800">
               {/* Use session image if available */}
              <AvatarImage src={userImage ?? undefined} alt={userName} />
              <AvatarFallback>{userFallback}</AvatarFallback>
            </Avatar>
            {/* Settings Button (Placeholder) */}
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </header>

        {/* Welcome Banner */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-lg">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">Unveil the subtext of your dreams</h2>
           {/* Use dynamic name */}
          <p className="text-purple-100">Welcome back, {userName}. Ready to explore your subconscious?</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Left Column - New Dream */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-purple-500" />
                New Dream
              </CardTitle>
              <CardDescription>Record and analyze your dream</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {/* Integrate DreamInputForm */}
              <Suspense fallback={<Skeleton className="min-h-[300px] w-full" />}>
                 <DynamicDreamInputForm />
              </Suspense>
              {/* Removed static textarea, slider, tags from v0 code */}
            </CardContent>
            {/* Footer might be part of the form now, or keep for consistency */}
            {/* <CardFooter> */}
              {/* Button likely handled within DreamInputForm */}
              {/* <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Analyze Dream</Button> */}
            {/* </CardFooter> */}
          </Card>

          {/* Middle Column - Insights */}
          <Card className="md:col-span-1">
            <CardHeader>
              {/* Replace previous content with InsightsClient */}
              <Suspense fallback={<Skeleton className="h-[350px] w-full" />}> {/* Add suspense boundary */}
                <InsightsClient
                  moodData={moodData}
                  topMotifs={topMotifs}
                  hasEnoughMoodData={hasEnoughMoodData}
                />
              </Suspense>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Dream Patterns</h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* Use fetched data */}
                  <div className="rounded-md bg-purple-50 p-3 dark:bg-slate-800">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Recurring Themes</p>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{recurringThemesCount ?? 'N/A'}</p>
                  </div>
                  {/* Commenting out Lucid Dreams display */}
                  {/*
                  <div className="rounded-md bg-indigo-50 p-3 dark:bg-slate-800">
                    <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Lucid Dreams</p>
                    <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">{lucidDreamsCount ?? 'N/A'}</p>
                  </div>
                  */}
                  {/* Add a placeholder or adjust grid if only one item */}
                   <div className="rounded-md bg-indigo-50 p-3 dark:bg-slate-800 flex items-center justify-center">
                     <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 text-center">Lucid Dream tracking coming soon!</p>
                   </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4 dark:border-slate-700">
              {/* TODO: Link button */}
              <Button variant="outline" className="text-xs text-muted-foreground">
                View Full Analysis
              </Button>
            </CardFooter>
          </Card>

          {/* Right Column - Recent Dreams */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Recent Dreams
              </CardTitle>
              <CardDescription>Your dream journal entries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {/* Integrate RecentDreamsList */}
               {recentDreams.length > 0 ? (
                 <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                   {/* Pass fetched dreams */}
                   {/* Need to adapt RecentDreamsList to match v0 styling/structure inside */}
                   <DynamicRecentDreamsList dreams={recentDreams} />
                 </Suspense>
               ) : (
                 <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed border-purple-200 bg-purple-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                   <p className="text-sm text-muted-foreground">No recent dreams logged.</p>
                 </div>
               )}
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4 dark:border-slate-700">
              {/* TODO: Link button */}
              <Button variant="ghost" className="text-xs text-muted-foreground">
                View All Dreams
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    // </div>
  );
}

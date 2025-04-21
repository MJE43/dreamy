'use client'

// import { useState, Suspense } from "react"; // Removed useState
import { Suspense } from "react";
import dynamic from "next/dynamic";
// import { CardTitle } from "@/components/ui/card"; // Removed CardTitle
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Cloud } from "lucide-react";
import { MoodData, MotifData } from "@/types";

// Dynamically import components that require client-side rendering WITH ssr: false
const DynamicMoodChart = dynamic(() => import("@/components/charts/MoodChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full" />,
});
const DynamicMotifCloud = dynamic(() => import("@/components/dreams/MotifCloud"), {
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full" />,
});

interface InsightsClientProps {
  moodData: MoodData[];
  topMotifs: MotifData[];
  hasEnoughMoodData: boolean;
}

export default function InsightsClient({ moodData, topMotifs, hasEnoughMoodData }: InsightsClientProps) {
  // State for motif filtering (if needed within this client component)
  // const [filterMotif, setFilterMotif] = useState<string | null>(null);
  // const handleMotifClick = (motif: { value: string, count: number }) => {
  //   setFilterMotif(prev => (prev === motif.value ? null : motif.value)); // Toggle filter
  // };

  return (
    <Tabs defaultValue="mood" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="mood"
          className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-200"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Mood Trend
        </TabsTrigger>
        <TabsTrigger
          value="motifs"
          className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-200"
        >
          <Cloud className="mr-2 h-4 w-4" />
          Motif Cloud
        </TabsTrigger>
      </TabsList>
      <TabsContent value="mood" className="pt-4">
        {hasEnoughMoodData ? (
          <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
            <div className="h-[250px] w-full">
              <DynamicMoodChart data={moodData} />
            </div>
          </Suspense>
        ) : (
          <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed border-purple-200 bg-purple-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="text-center">
              <TrendingUp className="mx-auto h-10 w-10 text-purple-300 dark:text-purple-700" />
              <p className="mt-2 text-sm text-muted-foreground">
                Log at least 3 dreams to see your mood trends.
              </p>
            </div>
          </div>
        )}
      </TabsContent>
      <TabsContent 
        value="motifs" 
        className="pt-4 h-[280px] relative overflow-hidden"
      >
        {topMotifs.length > 0 ? (
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <div className="h-full w-full overflow-hidden">
              <DynamicMotifCloud motifs={topMotifs} />
            </div>
          </Suspense>
        ) : (
          <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed border-purple-200 bg-purple-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="text-center">
              <Cloud className="mx-auto h-10 w-10 text-purple-300 dark:text-purple-700" />
              <p className="mt-2 text-sm text-muted-foreground">
                Log dreams with tags to see your motif cloud.
              </p>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
} 

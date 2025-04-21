import { MoodData, MotifData } from "@/types";
import InsightsClient from "./InsightsClient";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardClientContentProps {
  moodData: MoodData[];
  motifData: MotifData[];
  hasEnoughMoodData: boolean;
  // dreamPatterns: any;
}

export default function DashboardClientContent({
  moodData,
  motifData,
  hasEnoughMoodData,
  // dreamPatterns
}: DashboardClientContentProps) {

  return (
    <Card className="h-full w-full flex flex-col">
      <CardContent className="flex-grow p-3">
        <InsightsClient 
          moodData={moodData} 
          topMotifs={motifData}
          hasEnoughMoodData={hasEnoughMoodData} 
        />
      </CardContent>
      {/* <DreamPatternsDisplay patterns={dreamPatterns} /> */}
    </Card>
  );
} 

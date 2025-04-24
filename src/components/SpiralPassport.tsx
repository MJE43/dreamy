'use client'

import { Skeleton } from "@/components/ui/skeleton";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

export interface SpiralPassportProps {
  stageBlend: Record<string, number>; // e.g., { BLUE: 0.55, ORANGE: 0.3 }
  loading?: boolean;
}

const defaultColors: Record<string, string> = {
  BEIGE: "#F5F5DC",
  PURPLE: "#E6E6FA",
  RED: "#FFCCCC",
  BLUE: "#D0E0FF",
  ORANGE: "#FFE5CC",
  GREEN: "#D0F0C0",
  YELLOW: "#FFFFE0",
  TURQUOISE: "#AFEEEE",
};

export function SpiralPassport({ stageBlend, loading }: SpiralPassportProps) {
  if (loading) return <Skeleton className="h-[300px] w-full rounded-xl" />;

  const data = Object.entries(stageBlend).map(([stage, value]) => ({
    stage,
    value: Math.round(value * 100),
  }));

  const dominant = data.reduce((a, b) => (a.value > b.value ? a : b), data[0]);

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold">Spiral Passport</h2>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[360px]">
          <RadarChart width={360} height={300} data={data} className="w-full">
            <PolarGrid />
            <PolarAngleAxis dataKey="stage" fontSize={12} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            <Radar
              name="You"
              dataKey="value"
              fill={defaultColors[dominant.stage] ?? "#8884d8"}
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Your worldview is currently anchored in{" "}
        <span className="font-medium">{dominant.stage}</span>, supported by traits from surrounding stages.
      </p>
    </div>
  );
} 

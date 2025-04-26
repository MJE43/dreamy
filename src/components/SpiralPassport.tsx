'use client'

import React from 'react';
import {
  Radar, 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

// Define the expected structure for stage blend data
interface StageBlend {
  [key: string]: number; // e.g., { RED: 0.2, BLUE: 0.5, ... }
}

interface SpiralPassportProps {
  stageBlend: StageBlend | null | undefined;
  narrativeSummary?: string | null;
}

// Define a standard order and potential colors for stages
const STAGE_ORDER: Record<string, { color: string, order: number }> = {
    BEIGE:    { color: '#F5F5DC', order: 1 }, // Or appropriate colors
    PURPLE:   { color: '#8A2BE2', order: 2 },
    RED:      { color: '#DC143C', order: 3 },
    BLUE:     { color: '#4169E1', order: 4 },
    ORANGE:   { color: '#FFA500', order: 5 },
    GREEN:    { color: '#228B22', order: 6 },
    YELLOW:   { color: '#FFD700', order: 7 },
    TURQUOISE:{ color: '#40E0D0', order: 8 },
};

const SpiralPassport: React.FC<SpiralPassportProps> = ({ stageBlend, narrativeSummary }) => {

  // Transform stageBlend into Recharts data format, respecting order and filling missing stages
  const chartData = Object.entries(STAGE_ORDER)
    .sort(([, a], [, b]) => a.order - b.order) // Sort by defined order
    .map(([stage, { color }]) => ({
      subject: stage.charAt(0) + stage.slice(1).toLowerCase(), // Capitalize
      value: stageBlend?.[stage] ? Math.round(stageBlend[stage] * 100) : 0, // Use % and default to 0
      fullMark: 100, // Max value for the axis
      color: color, // Store color for potential use
    }));

  if (!stageBlend) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Spiral Passport</CardTitle>
                <CardDescription>Your worldview analysis is processing.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Check back soon for your results.</p>
                 {/* Optional: Add a loading skeleton here */}
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Spiral Passport</CardTitle>
            <CardDescription>Your estimated worldview blend based on recent inputs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div style={{ width: '100%', height: 300 }}> {/* Define explicit size for ResponsiveContainer */}
                <ResponsiveContainer>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
            <Radar
                            name="Stage Blend" 
              dataKey="value"
                            stroke="#8884d8" 
                            fill="#8884d8" 
              fillOpacity={0.6}
            />
                        <Tooltip formatter={(value) => `${value}%`} />
                        {/* <Legend /> */}{/* Legend might be redundant if only one Radar */}
          </RadarChart>
                </ResponsiveContainer>
        </div>
            <div>
                <h4 className="font-semibold mb-2">Narrative Summary</h4>
                <p className="text-sm text-muted-foreground">
                    {narrativeSummary ? narrativeSummary : "Analysis pending..."}
                </p>
            </div>
        </CardContent>
    </Card>
  );
};

export default SpiralPassport; 

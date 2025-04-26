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

  // Simplified loading/error state (without Card)
  if (!stageBlend) {
    return (
        <div className="p-6 bg-card text-card-foreground rounded-lg shadow">
           <h3 className="text-lg font-semibold mb-2">Spiral Passport</h3>
           <p className="text-sm text-muted-foreground">Your worldview analysis is processing. Check back soon.</p>
            {/* Optional: Add a loading skeleton here */}
        </div>
    );
  }

  // Render directly without Card wrapper
  return (
    <div className="space-y-4"> {/* Replaces Card */} 
        {/* Removed CardHeader and CardTitle */}

        {/* Chart Section */}
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                {/* SVG Gradient Definition */}
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/> {/* Primary Blue */}
                    <stop offset="95%" stopColor="#40E0D0" stopOpacity={0.7}/> {/* Turquoise */} 
                  </linearGradient>
                </defs>
                
                {/* Grid and Axes */}
                <PolarGrid stroke="#445566" />
                <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#FFFFFF', fontSize: 12 }} 
                    tickFormatter={(value) => value.toUpperCase()}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} axisLine={{ stroke: '#FFFFFF' }} tick={{ fill: '#FFFFFF' }}/>
                
                {/* Radar Area */}
                <Radar
                  name="Stage Blend"
                  dataKey="value"
                  stroke="#FFFFFF"  /* White outline */
                  fill="url(#colorGradient)" /* Use gradient fill */
                  fillOpacity={1} /* Opacity controlled by gradient stops */
                />
                
                {/* Tooltip */}
                <Tooltip 
                    formatter={(value) => `${value}%`} 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155'}}
                    labelStyle={{ color: '#FFFFFF' }}
                />
              </RadarChart>
            </ResponsiveContainer>
        </div>

        {/* Narrative Summary Section (Optional) */}
        {narrativeSummary && (
            <div className="p-4 bg-card text-card-foreground rounded-lg"> {/* Added padding/bg */}
                <h4 className="font-semibold mb-2">Narrative Summary</h4>
                <p className="text-sm text-muted-foreground">
                    {narrativeSummary}
                </p>
            </div>
        )}
    </div>
  );
};

export default SpiralPassport; 

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Motif {
  tag: string;
  count: number;
}

interface MotifCloudProps {
  motifs: Motif[];
  onMotifClick?: (motif: string) => void; // Optional callback for filtering
}

// TODO: Implement SVG cloud generation (e.g., using d3-cloud or similar)
const generateCloudLayout = (motifs: Motif[]): { text: string; size: number; x: number; y: number }[] => {
  // Placeholder: Just return motifs with size based on count for now
  const maxSize = 36;
  const minSize = 12;
  const maxCount = Math.max(...motifs.map(m => m.count), 1);
  return motifs.map((motif, index) => ({
    text: motif.tag,
    size: minSize + (maxSize - minSize) * (motif.count / maxCount),
    // Simple placeholder positioning - replace with actual cloud layout logic
    x: (index % 5) * 60, 
    y: Math.floor(index / 5) * 40,
  }));
};

export default function MotifCloud({ motifs, onMotifClick }: MotifCloudProps) {
  if (!motifs || motifs.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-xl">Top Motifs</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No motifs found yet. Add tags to your dreams!</p>
        </CardContent>
      </Card>
    );
  }

  const layout = generateCloudLayout(motifs);
  const viewBoxWidth = 300; // Adjust as needed
  const viewBoxHeight = Math.max(...layout.map(l => l.y + l.size), 100); // Dynamic height based on layout

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Motif Cloud</CardTitle></CardHeader>
      <CardContent>
        <div className="w-full aspect-video max-h-[250px] overflow-hidden flex items-center justify-center">
           {/* Placeholder SVG - Replace with proper cloud layout */}
           <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full">
              <g transform={`translate(${viewBoxWidth / 2}, ${viewBoxHeight / 2})`}> {/* Center the group */} 
                {layout.map((word) => (
                  <text
                    key={word.text}
                    textAnchor="middle"
                    transform={`translate(${word.x - viewBoxWidth / 2}, ${word.y - viewBoxHeight / 2})`}
                    fontSize={word.size}
                    fill="currentColor"
                    className="cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => onMotifClick?.(word.text)}
                  >
                    {word.text}
                  </text>
                ))}
              </g>
           </svg>
        </div>
      </CardContent>
    </Card>
  );
} 

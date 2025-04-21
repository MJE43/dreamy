import React from 'react';
import { TagCloud, ColorOptions } from 'react-tagcloud';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Motif {
  tag: string;
  count: number;
}

// Type for the data structure react-tagcloud uses internally and passes to renderer/onClick
interface TagCloudTag {
  value: string;
  count: number;
}

interface MotifCloudProps {
  motifs: Motif[];
  onMotifClick?: (tagValue: string) => void; // Pass the tag value (string)
}

// Custom renderer for tags to handle clicks
// Explicitly type the tag and props parameters
const customTagRenderer = (tag: TagCloudTag, size: number, color: string, props?: React.HTMLAttributes<HTMLSpanElement>) => {
  // We will rely on the key provided by TagCloud's internal map, not spreading from props here.
  const { onClick, ...otherProps } = props || {}; 
  return (
    <span 
      // key prop should be handled by TagCloud's internal mapping
      style={{ 
        fontSize: `${size}px`, 
        color: color, 
        margin: '3px', 
        padding: '3px', 
        display: 'inline-block',
        cursor: onClick ? 'pointer' : 'default', // Show pointer if clickable
        verticalAlign: 'middle',
      }}
      onClick={onClick} // Attach the onClick handler passed by TagCloud
      className="hover:opacity-75 transition-opacity" // Added hover effect
      {...otherProps} // Spread remaining props
    >
      {tag.value}
    </span>
  );
}

export default function MotifCloud({ motifs, onMotifClick }: MotifCloudProps) {
  if (!motifs || motifs.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Motif Cloud</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No motifs found yet. Add tags to your dreams!</p>
        </CardContent>
      </Card>
    );
  }

  // Map data to the format expected by react-tagcloud
  const data: TagCloudTag[] = motifs.map(motif => ({ value: motif.tag, count: motif.count }));

  // Define controlled color options directly
  const colorOptions: ColorOptions = {
      luminosity: 'dark', // Keep dark for light text on dark background
      hue: 'purple' // Set a base hue like purple or blue (adjust as needed)
      // Consider 'random' if you want more color variety automatically
      // hue: 'random', 
  };

  return (
    <Card className="h-full w-full"> 
      <CardHeader className="pt-4 pb-2 px-4"><CardTitle className="text-base">Motif Cloud</CardTitle></CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-2 min-h-[200px]"> 
        <TagCloud
          minSize={14} 
          maxSize={40} 
          tags={data}
          colorOptions={colorOptions} // Use the defined color options
          onClick={(tag: TagCloudTag) => onMotifClick?.(tag.value)} 
          renderer={customTagRenderer} 
          className="text-center cursor-default" 
          shuffle={true} // Re-enable shuffle for dynamism, can be false if needed
        />
      </CardContent>
    </Card>
  );
} 

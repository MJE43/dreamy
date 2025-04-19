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
        <CardHeader><CardTitle className="text-xl">Motif Cloud</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No motifs found yet. Add tags to your dreams!</p>
        </CardContent>
      </Card>
    );
  }

  // Map data to the format expected by react-tagcloud
  const data: TagCloudTag[] = motifs.map(motif => ({ value: motif.tag, count: motif.count }));

  // Explicitly type the options object
  const options: ColorOptions = {
    luminosity: 'dark', // Use 'dark' for light text on dark background
    hue: 'blue',       // Base hue for tag colors (can be specific hex/rgb too)
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Motif Cloud</CardTitle></CardHeader>
      <CardContent>
        {/* Use a div container to constrain the cloud size */}
        <div className="w-full aspect-video max-h-[250px] overflow-hidden flex items-center justify-center p-4">
          <TagCloud
            minSize={12}
            maxSize={35}
            tags={data}
            colorOptions={options} // Pass the typed options object
            onClick={(tag: TagCloudTag) => onMotifClick?.(tag.value)} // Call onMotifClick with the tag value
            renderer={customTagRenderer} // Use the custom renderer
            className="text-center" // Optional: center align text if needed
          />
        </div>
      </CardContent>
    </Card>
  );
} 

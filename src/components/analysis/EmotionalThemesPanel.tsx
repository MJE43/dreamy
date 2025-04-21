'use client';

import { EmotionalTheme as EmotionalThemeType } from "@/lib/schemas/dreamAnalysis";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // For conditional classes
import { Smile, Meh, Frown } from "lucide-react"; // Example icons

interface EmotionalThemesPanelProps {
  themes: EmotionalThemeType[];
}

// Helper to get styling based on intensity
const getIntensityStyle = (intensity?: 'high' | 'medium' | 'low') => {
  switch (intensity) {
    case 'high':
      return { 
          icon: <Smile className="h-3.5 w-3.5 text-green-600"/>, 
          badgeClass: "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
      };
    case 'medium':
       return { 
           icon: <Meh className="h-3.5 w-3.5 text-yellow-600"/>, 
           badgeClass: "border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
       };
    case 'low':
       return { 
           icon: <Frown className="h-3.5 w-3.5 text-red-600"/>, 
           badgeClass: "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"
        };
    default:
        return { 
            icon: <Meh className="h-3.5 w-3.5 text-gray-500"/>, // Default icon
            badgeClass: "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300" 
        };
  }
};

export function EmotionalThemesPanel({ themes }: EmotionalThemesPanelProps) {
  if (!themes || themes.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No specific emotional themes identified.</p>;
  }

  return (
    <div className="space-y-2">
      {themes.map((theme, index) => {
         const { icon, badgeClass } = getIntensityStyle(theme.intensity);
         return (
            <div key={index} className="p-2 border rounded-md bg-background/20">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold flex items-center gap-1.5">
                        {icon}
                        {theme.theme}
                    </span>
                    {theme.intensity && (
                        <Badge variant="outline" className={cn("text-xs h-5 px-1.5 font-normal", badgeClass)}>
                           {theme.intensity}
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground ml-5">{theme.explanation}</p>
            </div>
         );
      })}
    </div>
  );
} 

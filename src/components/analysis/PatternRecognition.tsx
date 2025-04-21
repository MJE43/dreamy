'use client';

import { PatternRecognition as PatternRecognitionType } from "@/lib/schemas/dreamAnalysis";
import { Badge } from "@/components/ui/badge";
import { Repeat, TrendingUp } from "lucide-react";

interface PatternRecognitionProps {
  patterns?: PatternRecognitionType | null; // Make prop optional
}

export function PatternRecognition({ patterns }: PatternRecognitionProps) {
  const hasSymbols = patterns?.recurringSymbols && patterns.recurringSymbols.length > 0;
  const hasNotes = patterns?.evolutionNotes && patterns.evolutionNotes.trim() !== '';

  if (!hasSymbols && !hasNotes) {
    return <p className="text-sm text-muted-foreground italic">No recurring patterns or evolution noted.</p>;
  }

  return (
    <div className="space-y-3">
      {hasSymbols && (
        <div>
           <div className="flex items-center space-x-1 mb-1.5">
             <Repeat className="h-3.5 w-3.5 text-blue-500"/>
             <h5 className="text-xs font-semibold">Recurring Symbols</h5>
           </div>
           <div className="flex flex-wrap gap-1">
                {patterns?.recurringSymbols?.map((symbol, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-normal bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">{symbol}</Badge>
                ))}
           </div>
        </div>
      )}
      {hasNotes && (
        <div>
          <div className="flex items-center space-x-1 mb-1">
             <TrendingUp className="h-3.5 w-3.5 text-green-500"/>
             <h5 className="text-xs font-semibold">Theme Evolution</h5>
          </div>
          <p className="text-xs text-muted-foreground">{patterns?.evolutionNotes}</p>
        </div>
      )}
    </div>
  );
} 

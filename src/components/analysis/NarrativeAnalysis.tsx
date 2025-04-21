'use client';

import { NarrativeAnalysis as NarrativeAnalysisType } from "@/lib/schemas/dreamAnalysis";
import { MapPin, AlertTriangle, CheckCircle } from "lucide-react";

interface NarrativeAnalysisProps {
  narrative?: NarrativeAnalysisType | null; // Make prop optional
}

export function NarrativeAnalysis({ narrative }: NarrativeAnalysisProps) {
  const hasSetting = narrative?.setting && narrative.setting.trim() !== '';
  const hasConflict = narrative?.conflict && narrative.conflict.trim() !== '';
  const hasResolution = narrative?.resolution && narrative.resolution.trim() !== '';

  if (!hasSetting && !hasConflict && !hasResolution) {
    return <p className="text-sm text-muted-foreground italic">No specific narrative structure analysis available.</p>;
  }

  return (
    <div className="space-y-2">
      {hasSetting && (
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-xs font-semibold">Setting</h5>
            <p className="text-xs text-muted-foreground">{narrative?.setting}</p>
          </div>
        </div>
      )}
      {hasConflict && (
         <div className="flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-xs font-semibold">Conflict / Tension</h5>
            <p className="text-xs text-muted-foreground">{narrative?.conflict}</p>
          </div>
        </div>
      )}
      {hasResolution && (
         <div className="flex items-start space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-xs font-semibold">Resolution / Outcome</h5>
            <p className="text-xs text-muted-foreground">{narrative?.resolution}</p>
          </div>
        </div>
      )}
    </div>
  );
} 

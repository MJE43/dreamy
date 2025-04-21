'use client';

import * as React from 'react';
import { PerspectiveAnalysis as PerspectiveAnalysisType } from '@/lib/schemas/dreamAnalysis';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface PerspectiveAnalysisProps {
  perspectives?: PerspectiveAnalysisType | null; // Make prop optional
}

export function PerspectiveAnalysis({ perspectives }: PerspectiveAnalysisProps) {
  const availablePerspectives = React.useMemo(() => {
    return Object.entries(perspectives || {})
      // Use only the value for filtering, key is implicitly used by map
      .filter(([/* key */, value]) => value && value.trim() !== '') 
      .map(([key]) => key);
  }, [perspectives]);

  if (!perspectives || availablePerspectives.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No specific psychological perspective analysis available.</p>;
  }

  const defaultValue = availablePerspectives[0]; // Default to the first available perspective

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-2 h-8">
        {perspectives.jungian && <TabsTrigger value="jungian" className="text-xs h-6">Jungian</TabsTrigger>}
        {perspectives.freudian && <TabsTrigger value="freudian" className="text-xs h-6">Freudian</TabsTrigger>}
        {perspectives.existential && <TabsTrigger value="existential" className="text-xs h-6">Existential</TabsTrigger>}
        {/* Ensure list has items even if perspectives are missing */} 
         {!perspectives.jungian && <div/>}
         {!perspectives.freudian && <div/>}
         {!perspectives.existential && <div/>}
      </TabsList>
      
      {perspectives.jungian && (
        <TabsContent value="jungian" className="text-xs p-3 border rounded bg-background/20 mt-0">
          <p>{perspectives.jungian}</p>
        </TabsContent>
      )}
      {perspectives.freudian && (
        <TabsContent value="freudian" className="text-xs p-3 border rounded bg-background/20 mt-0">
           <p>{perspectives.freudian}</p>
        </TabsContent>
      )}
      {perspectives.existential && (
        <TabsContent value="existential" className="text-xs p-3 border rounded bg-background/20 mt-0">
           <p>{perspectives.existential}</p>
        </TabsContent>
      )}
    </Tabs>
  );
} 

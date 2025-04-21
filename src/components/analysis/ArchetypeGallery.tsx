'use client';

import { Archetype as ArchetypeType } from "@/lib/schemas/dreamAnalysis";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserCircle } from "lucide-react"; // Example Icon

interface ArchetypeGalleryProps {
  archetypes: ArchetypeType[];
}

export function ArchetypeGallery({ archetypes }: ArchetypeGalleryProps) {
  if (!archetypes || archetypes.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No specific archetypes prominently featured.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {archetypes.map((archetype, index) => (
        <Card key={index} className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 border-indigo-100 dark:border-indigo-900/50 shadow-sm overflow-hidden">
          <CardHeader className="p-3">
             <div className="flex items-center space-x-2 mb-1">
                 <UserCircle className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                 <CardTitle className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">{archetype.archetype}</CardTitle>
             </div>
             <CardDescription className="text-xs text-indigo-600 dark:text-indigo-400">
                {archetype.explanation}
             </CardDescription>
          </CardHeader>
          {/* CardContent could be used for more details or imagery later */}
        </Card>
      ))}
    </div>
  );
} 

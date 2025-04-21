'use client';

import { Lightbulb } from "lucide-react";

interface GuidedReflectionProps {
  questions: string[];
}

export function GuidedReflection({ questions }: GuidedReflectionProps) {
  if (!questions || questions.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No reflection questions provided.</p>;
  }

  return (
    <ul className="space-y-2">
      {questions.map((question, index) => (
        <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
           <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
           <span>{question}</span>
        </li>
      ))}
    </ul>
  );
} 

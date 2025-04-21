'use client';

import { KeySymbol as KeySymbolType } from "@/lib/schemas/dreamAnalysis";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react"; // Example Icon

interface SymbolExplorerProps {
  symbols: KeySymbolType[];
}

// Helper to get styling for relevance
const getRelevanceStyle = (relevance?: 'high' | 'medium' | 'low') => {
  switch (relevance) {
    case 'high':
      return "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300";
    case 'medium':
       return "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-600 dark:bg-sky-900/30 dark:text-sky-300";
    case 'low':
       return "border-gray-400 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400";
    default:
        return "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
};

export function SymbolExplorer({ symbols }: SymbolExplorerProps) {
  if (!symbols || symbols.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No specific key symbols identified.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-1">
      {symbols.map((symbol, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border border-muted bg-background/20 rounded-md px-3">
          <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
             <div className="flex items-center justify-between w-full mr-2">
                 <span className="flex items-center gap-1.5">
                     <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                     {symbol.symbol}
                 </span>
                 {symbol.relevance && (
                    <Badge variant="outline" className={cn("text-xs h-5 px-1.5 font-normal", getRelevanceStyle(symbol.relevance))}>
                        {symbol.relevance}
                    </Badge>
                 )}
             </div>
          </AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground pb-3">
            {symbol.interpretation}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
} 

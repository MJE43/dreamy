'use client';

interface AnalysisSummaryProps {
  summary: string | { toString: () => string }; // Allow object with toString for debugging
}

export function AnalysisSummary({ summary }: AnalysisSummaryProps) {
  const summaryText = typeof summary === 'string' ? summary : (summary?.toString() ?? '[Invalid Summary Data]');
  // Could add more styling or an icon later
  return (
      <p className="text-sm text-muted-foreground italic bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 p-3 rounded-md border border-purple-100 dark:border-purple-900/30 shadow-sm">
          {summaryText}
      </p>
  );
} 

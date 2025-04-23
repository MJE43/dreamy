'use client' // Added 'use client' because actions will be client-side

import React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Badge } from "@/components/ui/badge"; // Import Badge for tags and status
import { RecentDream } from "@/types"; // Import shared type

// Remove unused type definition within the file
// type RecentDream = { ... };

interface RecentDreamsListProps {
  dreams: RecentDream[];
}

// Removed getSynopsis, handleDelete, handleShare functions

export default function RecentDreamsList({ dreams }: RecentDreamsListProps) {
  const router = useRouter(); // Get router instance

  return (
    // Remove Card wrapper, Card is applied in page.tsx
    // Render the list directly with space-y-4
    <div className="space-y-4">
      {dreams.length > 0 ? (
        // Remove Accordion, map directly to divs
        dreams.map((dream) => (
          // Apply v0 styling to each dream entry div
          <div
            key={dream.id}
            className="rounded-lg border border-purple-100 p-3 transition-colors hover:bg-purple-50 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer" // Added cursor-pointer, can link later
            onClick={() => router.push(`/dream/${dream.id}`)} // Add navigation onClick
          >
            {/* Top row: Date and Analyzed Badge */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {/* Format date as in v0 */}
                {new Date(dream.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              {/* Conditionally render Analyzed badge */}
              {dream.analysis && (
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300">
                  Analyzed
                </Badge>
              )}
            </div>
            {/* Description */}
            <p className="mt-2 line-clamp-2 text-sm">
              {dream.description}
            </p>
            {/* Tags */}
            {dream.tags && (
              <div className="mt-2 flex flex-wrap gap-1">
                {dream.tags.split(',').map((tag) => {
                  const trimmedTag = tag.trim();
                  if (!trimmedTag) return null; // Skip empty tags
                  return (
                    <Badge
                      key={trimmedTag} // Use tag as key
                      variant="outline"
                      // Apply v0 tag styling
                      className="text-xs bg-purple-50 hover:bg-purple-100 dark:bg-slate-800 font-normal"
                    >
                      {trimmedTag}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        ))
      ) : (
        // Adjusted empty state text to match v0 placeholder in page.tsx
        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed border-purple-200 bg-purple-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm text-muted-foreground text-center">No recent dreams logged.</p>
        </div>
      )}
      {/* Removed Infinite Scroll Placeholder */}
    </div>
    // Remove Card closing tag
  );
} 

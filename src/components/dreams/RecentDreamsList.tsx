import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Type for the dream data expected by this component
// Matches the selection in page.tsx
type RecentDream = {
  id: string;
  createdAt: Date;
  description: string;
};

interface RecentDreamsListProps {
  dreams: RecentDream[];
}

export default function RecentDreamsList({ dreams }: RecentDreamsListProps) {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-xl">Recent Dreams</CardTitle>
      </CardHeader>
      <CardContent>
        {dreams.length > 0 ? (
          <ul className="space-y-4">
            {dreams.map((dream) => (
              <li key={dream.id} className="border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                <Link href={`/dream/${dream.id}`} className="block group hover:bg-muted/50 p-2 rounded-md transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(dream.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {/* Placeholder for mood emoji if we add mood to data later */}
                    {/* <span className="text-lg">😊</span> */}
                  </div>
                  <p className="text-sm text-foreground group-hover:text-primary truncate">
                    {dream.description}
                  </p>
                   {/* Optional: Show analysis summary preview if available */}
                  {/* <p className="text-xs text-muted-foreground mt-1 truncate">Analysis: ...</p> */}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No recent dreams recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
} 

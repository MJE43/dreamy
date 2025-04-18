import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Type for the data expected by this component
type MotifData = {
  tag: string;
  count: number;
};

interface TopMotifsProps {
  motifs: MotifData[];
}

export default function TopMotifs({ motifs }: TopMotifsProps) {
  return (
    <Card className="min-h-[200px]"> {/* Ensure consistent height with other cards */}
      <CardHeader>
        <CardTitle className="text-xl">Top Motifs</CardTitle>
      </CardHeader>
      <CardContent>
        {motifs.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {motifs.map((motif) => (
              <Badge key={motif.tag} variant="secondary" className="capitalize">
                {motif.tag}
                {/* Optional: Show count in a subtle way */}
                {/* <span className="ml-1.5 text-muted-foreground/80">({motif.count})</span> */}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No common motifs found yet. Keep logging dreams!</p>
        )}
      </CardContent>
    </Card>
  );
} 

'use client';

import { PersonalConnection as PersonalConnectionType } from "@/lib/schemas/dreamAnalysis";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "lucide-react";

interface PersonalConnectionsProps {
  connections?: PersonalConnectionType[] | null; // Make prop optional
}

export function PersonalConnections({ connections }: PersonalConnectionsProps) {
  if (!connections || connections.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No specific connections to waking life identified.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {connections.map((connection, index) => (
        <Card key={index} className="bg-background/20 border-purple-100 dark:border-purple-900/50 shadow-sm">
          <CardHeader className="p-3">
            <CardTitle className="text-xs font-semibold flex items-center">
                <Link className="h-3.5 w-3.5 mr-1.5 text-purple-500"/>
                {connection.area}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
            <p>{connection.insight}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 

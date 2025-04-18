'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DreamDisplayProps {
  title: string;
  description: string;
  analysis?: string; // Optional analysis field for later
}

export function DreamDisplay({ title, description, analysis }: DreamDisplayProps) {
  if (!title && !description) {
    return null; // Don't render anything if there's no dream data yet
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Untitled Dream"}</CardTitle>
        <CardDescription>Your submitted dream</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{description}</p>
        {analysis && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-2">Analysis</h3>
            <p className="whitespace-pre-wrap">{analysis}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
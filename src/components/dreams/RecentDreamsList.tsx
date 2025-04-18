'use client' // Added 'use client' because actions will be client-side

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For refresh after delete
import { toast } from 'sonner'; // For feedback
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, ExternalLink } from "lucide-react"; // Icons for buttons

// Updated type for the dream data
type RecentDream = {
  id: string;
  createdAt: Date;
  description: string;
  mood: number;
  analysis: {
    content: string;
  } | null; // Analysis can be null
};

interface RecentDreamsListProps {
  dreams: RecentDream[];
}

// Helper to generate synopsis
const getSynopsis = (content: string | null | undefined, maxLength = 150): string => {
  if (!content) return "No analysis available.";
  // Simple truncation, could be improved to respect sentences/paragraphs
  return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
};

export default function RecentDreamsList({ dreams }: RecentDreamsListProps) {
  const router = useRouter();

  const handleDelete = async (dreamId: string) => {
    // Basic confirmation
    if (!confirm("Are you sure you want to delete this dream?")) {
      return;
    }
    
    toast.loading("Deleting dream...");
    try {
      // TODO: Replace with server action or API call
      console.log(`TODO: Implement delete API call for dream ${dreamId}`);
      await new Promise(res => setTimeout(res, 1000)); // Simulate API call
      
      toast.success("Dream deleted successfully!");
      router.refresh(); // Refresh the page to update the list
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete dream.");
    }
  };

  const handleShare = (dream: RecentDream) => {
    const textToShare = `
Dream from: ${new Date(dream.createdAt).toLocaleDateString('en-US')}
Mood: ${dream.mood}/5

Description:
${dream.description}

${dream.analysis?.content ? `Analysis:\n${dream.analysis.content}` : ''}
    `.trim();
    
    try {
      navigator.clipboard.writeText(textToShare);
      toast.success("Dream content copied to clipboard!");
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to copy dream content.");
    }
    // Could also implement navigator.share() or file download here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Dreams</CardTitle>
      </CardHeader>
      <CardContent>
        {dreams.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-1">
            {dreams.map((dream) => (
              <AccordionItem value={dream.id} key={dream.id} className="border rounded-md overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 data-[state=open]:border-b">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(dream.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <p className="text-sm text-foreground truncate font-normal ml-2 mr-auto pl-2 text-left">
                        {dream.description.split('\n')[0]} {/* Show first line */} 
                    </p>
                    {/* Optional: Mood emoji */}
                    {/* <span className="text-lg mr-2">{moodMap[dream.mood]?.emoji}</span> */} 
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-3">
                    {getSynopsis(dream.analysis?.content)}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dream/${dream.id}`}><ExternalLink className="h-4 w-4 mr-1"/> Open</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare(dream)}>
                       <FileText className="h-4 w-4 mr-1"/> Share
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(dream.id)}>
                      <Trash2 className="h-4 w-4 mr-1"/> Delete
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">Log your first dream to see it here.</p> // Updated empty state
        )}
        {/* TODO: Add Infinite Scroll Trigger Here */}
      </CardContent>
    </Card>
  );
} 

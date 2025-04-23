import { PrismaClient } from '@/generated/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StructuredDreamAnalysis } from "@/lib/schemas/dreamAnalysis";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnalysisSummary } from '@/components/analysis/AnalysisSummary';
import { SymbolExplorer } from '@/components/analysis/SymbolExplorer';
import { ArchetypeGallery } from '@/components/analysis/ArchetypeGallery';
import { EmotionalThemesPanel } from '@/components/analysis/EmotionalThemesPanel';
import { NarrativeAnalysis } from '@/components/analysis/NarrativeAnalysis';
import { PersonalConnections } from '@/components/analysis/PersonalConnections';
import { PatternRecognition } from '@/components/analysis/PatternRecognition';
import { PerspectiveAnalysis } from '@/components/analysis/PerspectiveAnalysis';
import { GuidedReflection } from '@/components/analysis/GuidedReflection';
import { Separator } from '@/components/ui/separator';
import * as React from 'react';

const prisma = new PrismaClient();

// Define the expected Promise type for params in Next 15+
// Note: Using 'any' for the resolved value based on the error message, adjust if needed
type ParamsPromise = Promise<{ id: string }>;

// Rename interface to avoid potential global conflicts
interface DreamIdPageProps {
  params: ParamsPromise;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Helper component for section layout 
const AnalysisSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold tracking-tight text-purple-800 dark:text-purple-300">{title}</h3>
    <div className="p-4 border rounded-lg bg-background/30 shadow-sm border-purple-100 dark:border-purple-900/40">
      {children}
    </div>
  </div>
);

// This is a Server Component by default in the App Router
export default async function DreamPage({ params }: DreamIdPageProps) {
  // --- Supabase Auth Check ---
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirect to login if not authenticated, maybe preserve target url?
    // For simplicity, just redirect to login for now.
    redirect('/login'); 
  }
  const userId = user.id;
  // --- End Auth Check ---

  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    notFound();
  }

  // Fetch dream ONLY if it matches ID AND belongs to the logged-in user
  const dream = await prisma.dream.findUnique({
    where: {
      id: id,
      userId: userId, // Ensure the user owns this dream
    },
    include: { analysis: true },
  });

  // If dream is null here, it means either it doesn't exist OR the user doesn't own it.
  if (!dream) {
    notFound(); // Treat as not found for security
  }

  // Attempt to parse the analysis content
  let structuredAnalysis: StructuredDreamAnalysis | null = null;
  let analysisParseError: string | null = null;
  if (dream.analysis?.content) {
    try {
      structuredAnalysis = JSON.parse(dream.analysis.content);
      // Basic validation - checking only required fields
      if (!structuredAnalysis?.summary || 
          !structuredAnalysis?.keySymbols || 
          !structuredAnalysis?.archetypes || 
          !structuredAnalysis?.emotionalThemes || 
          !structuredAnalysis?.guidedReflection) {
         throw new Error("Parsed analysis is missing required fields.");
      }
    } catch (error) {
      console.error("Failed to parse dream analysis content for dream ID:", id, error); 
      analysisParseError = error instanceof Error ? error.message : "Could not parse analysis data.";
      structuredAnalysis = null; // Ensure it's null if parsing fails
    }
  }

  const renderTags = (tagsString: string | null) => {
    if (!tagsString) return <span className="text-sm text-muted-foreground">No tags.</span>;
    return tagsString.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
      <Badge key={tag} variant="secondary" className="mr-1 mb-1">{tag}</Badge>
    ));
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-3xl mx-auto overflow-hidden bg-gradient-to-b from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Dream Details</CardTitle>
          <CardDescription>Recorded on: {new Date(dream.createdAt).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Description:</h3>
            <div className="p-3 border rounded-md max-h-[250px] overflow-y-auto bg-background/50 backdrop-blur-sm">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{dream.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold">Mood:</h3>
              <p>{dream.mood} / 5</p>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold mb-1">Tags:</h3>
              <div className="flex flex-wrap">
                {renderTags(dream.tags)}
              </div>
            </div>
          </div>
          
          <Separator />

          {structuredAnalysis && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center text-purple-900 dark:text-purple-200 tracking-wide">Dream Analysis</h2>
              
              <AnalysisSummary summary={structuredAnalysis.summary} />
              
              <AnalysisSection title="Key Symbols">
                 <SymbolExplorer symbols={structuredAnalysis.keySymbols} />
              </AnalysisSection>
              
              <AnalysisSection title="Archetypes">
                  <ArchetypeGallery archetypes={structuredAnalysis.archetypes} />
              </AnalysisSection>
              
               <AnalysisSection title="Emotional Themes">
                  <EmotionalThemesPanel themes={structuredAnalysis.emotionalThemes} />
              </AnalysisSection>
              
              {structuredAnalysis.narrativeAnalysis && (Object.keys(structuredAnalysis.narrativeAnalysis).length > 0 && (Object.values(structuredAnalysis.narrativeAnalysis).some(v => v && v.trim() !== ''))) && (
                 <AnalysisSection title="Narrative Flow">
                   <NarrativeAnalysis narrative={structuredAnalysis.narrativeAnalysis} />
                 </AnalysisSection>
               )}
                
               {structuredAnalysis.personalConnections && structuredAnalysis.personalConnections.length > 0 && (
                  <AnalysisSection title="Waking Life Connections">
                     <PersonalConnections connections={structuredAnalysis.personalConnections} />
                  </AnalysisSection>
               )}

               {structuredAnalysis.patternRecognition && (structuredAnalysis.patternRecognition.recurringSymbols?.length || structuredAnalysis.patternRecognition.evolutionNotes) && (
                 <AnalysisSection title="Pattern Recognition">
                   <PatternRecognition patterns={structuredAnalysis.patternRecognition} />
                 </AnalysisSection>
               )}

               {structuredAnalysis.analysis && (Object.keys(structuredAnalysis.analysis).length > 0 && (Object.values(structuredAnalysis.analysis).some(v => v && v.trim() !== ''))) && (
                 <AnalysisSection title="Psychological Perspectives">
                    <PerspectiveAnalysis perspectives={structuredAnalysis.analysis} />
                 </AnalysisSection>
               )}
               
               <Separator />
               
               <AnalysisSection title="Guided Reflection">
                  <GuidedReflection questions={structuredAnalysis.guidedReflection} />
              </AnalysisSection>
            </div>
          )}

          {!structuredAnalysis && (
             <div className="border-t pt-6">
              {analysisParseError ? (
                 <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Analysis Error</AlertTitle>
                  <AlertDescription>
                    Could not load or display the dream analysis. Error: {analysisParseError}
                  </AlertDescription>
                </Alert>
              ) : (
                 // Only show this if analysis relation exists but content is null/empty or failed parse
                 dream.analysis ? 
                 <p className="text-muted-foreground text-center">Analysis processing failed or is unavailable.</p> : 
                 <p className="text-muted-foreground text-center">Analysis has not been generated for this dream yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Optional: Improve metadata for the page
// Keep generateMetadata as is for now, its props might be handled differently
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const dream = await prisma.dream.findUnique({ where: { id } });

  return {
    title: dream ? `Dream Analysis: ${new Date(dream.createdAt).toLocaleDateString()}` : 'Dream Analysis',
    description: dream ? `Analysis for dream recorded on ${new Date(dream.createdAt).toLocaleDateString()}` : 'Dream analysis details',
  };
} 

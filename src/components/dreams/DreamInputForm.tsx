'use client'

import * as React from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { Loader2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Combobox } from "@/components/ui/combobox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { useLiveRegion } from "@/context/LiveRegionContext"
import { cn } from "@/lib/utils";
// Import the structured analysis type
import { StructuredDreamAnalysis } from "@/lib/schemas/dreamAnalysis";

// Import new analysis components using alias
import { AnalysisSummary } from '@/components/analysis/AnalysisSummary';
import { SymbolExplorer } from '@/components/analysis/SymbolExplorer';
import { ArchetypeGallery } from '@/components/analysis/ArchetypeGallery';
import { EmotionalThemesPanel } from '@/components/analysis/EmotionalThemesPanel';
import { NarrativeAnalysis } from '@/components/analysis/NarrativeAnalysis';
import { PersonalConnections } from '@/components/analysis/PersonalConnections';
import { PatternRecognition } from '@/components/analysis/PatternRecognition';
import { PerspectiveAnalysis } from '@/components/analysis/PerspectiveAnalysis';
import { GuidedReflection } from '@/components/analysis/GuidedReflection';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Schema for the form data
const formSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  mood: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
})

type DreamFormData = z.infer<typeof formSchema>;

// Placeholder tags - TODO: replace with dynamic tags
const TAGS = [
  { value: "flying", label: "Flying" },
  { value: "falling", label: "Falling" },
  { value: "chased", label: "Chased" },
  { value: "school", label: "School" },
  { value: "work", label: "Work" },
];

// Mood mapping
const moodMap: { [key: number]: { emoji: string; label: string } } = {
  1: { emoji: "😞", label: "Very Negative" },
  2: { emoji: "🙁", label: "Negative" },
  3: { emoji: "😐", label: "Neutral" },
  4: { emoji: "🙂", label: "Positive" },
  5: { emoji: "😄", label: "Very Positive" },
};

// Helper component for section layout (removed unused defaultOpen)
const AnalysisSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <Card className="bg-background/10 border-slate-200 dark:border-slate-800 shadow-sm">
    <CardHeader className="p-3">
      <CardTitle className="text-base font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-3 pt-0">
      {children}
    </CardContent>
  </Card>
);

export default function DreamInputForm() {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<StructuredDreamAnalysis | null>(null);
  const [formData, setFormData] = React.useState<DreamFormData | null>(null);
  const router = useRouter();
  const { announce } = useLiveRegion();

  const form = useForm<DreamFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      mood: 3,
      tags: [],
    },
  });

  // Handler for submitting the initial form (Step 1)
  async function handleAnalyzeDream(values: DreamFormData) {
    setIsLoading(true);
    setAnalysisResult(null);
    setFormData(values);
    const dataToSend = { ...values, tags: values.tags?.join(",") || "" };

    try {
      // Call the analysis-only endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Failed to analyze dream');
      }

      // Expect result.analysis to be the StructuredDreamAnalysis object
      if (result.analysis) {
        setAnalysisResult(result.analysis as StructuredDreamAnalysis);
        setStep(2); // Move to analysis view step
        announce("Dream analysis ready.");
      } else {
         throw new Error('Analysis content missing from response.');
      }

    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? `Analysis Error: ${error.message}` : "An unknown error occurred during analysis.");
      setFormData(null); // Clear stored data on error
    } finally {
      setIsLoading(false);
    }
  }

  // Handler for saving the dream after viewing analysis (Step 2)
  async function handleSaveDream() {
    if (!formData || !analysisResult) {
      toast.error("Cannot save dream: Missing data.");
      return;
    }
    setIsLoading(true);

    const dataToSave = {
      ...formData,
      tags: formData.tags?.join(",") || "",
      // Stringify the analysis object before sending
      analysisContent: JSON.stringify(analysisResult),
    };

    try {
      // Call the modified ingest endpoint
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        // Include analysisPersisted status in error if available
        let errorMsg = result.error || 'Failed to save dream';
        if (result.hasOwnProperty('analysisPersisted') && !result.analysisPersisted) {
            errorMsg += ' (Analysis could not be saved)';
        }
        throw new Error(errorMsg);
      }

      toast.success("Dream saved successfully!");
      announce("Dream saved successfully.");
      form.reset(); // Reset the form fields
      setStep(1); // Go back to step 1
      setAnalysisResult(null);
      setFormData(null);
      router.refresh(); // Refresh server components on the current route (homepage)

    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? `Save Error: ${error.message}` : "An unknown error occurred while saving.");
      announce("Failed to save dream.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handler for going back to edit (Step 2)
  function handleEditDream() {
    setStep(1);
    setAnalysisResult(null); // Clear analysis
    // formData remains, form values are preserved by useForm
  }

  // Modified Stepper UI to show Progress bar in step 2
  const Stepper = () => {
    if (step === 2) {
        // Calculate progress - Step 2 is 100% of the form process shown here
        return (
          <div className="mb-4">
            <Progress value={100} className="h-2" />
            <p className="text-sm text-muted-foreground text-center mt-1">Analysis Ready</p>
          </div>
        );
    }
    // Default Step 1 view
    return (
      <div className="flex items-center justify-end space-x-1 mb-4 text-xs text-muted-foreground">
        <span className={cn("font-medium", step === 1 ? "text-purple-600 dark:text-purple-400" : "")}>1 Write Dream</span>
        <span className="mx-1">→</span>
        <span className={cn("font-medium", step === 2 ? "text-purple-600 dark:text-purple-400" : "")}>2 View Analysis</span>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div>
        <Stepper />

        {step === (1 as 1 | 2) && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAnalyzeDream)} className="space-y-4 relative">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dream Description</span>
                    </div>
                    <FormControl>
                      <TextareaAutosize
                        placeholder="Describe your dream in detail..."
                        className="flex min-h-[150px] w-full resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border-purple-100 focus:border-purple-300 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs italic">
                      Dreams don&apos;t judge punctuation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Mood</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Slider
                          defaultValue={[field.value]}
                          value={[field.value]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="flex-1 mood-slider"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 cursor-default">
                              {moodMap[field.value]?.emoji || "😐"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{moodMap[field.value]?.label || "Neutral"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Combobox
                        options={TAGS}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Add tags..."
                        className="h-auto min-h-[28px] text-xs border-dashed border-purple-200 dark:border-slate-700 justify-start font-normal"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Analyze Dream
              </Button>
            </form>
          </Form>
        )}

        {step === (2 as 1 | 2) && (
          <div className="space-y-4 relative">
             {isLoading && ( // Show overlay/spinner during save action
               <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md z-10">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
               </div>
             )}
             {/* Analysis Display - Use new components */}
             <div className="border rounded-md min-h-[200px] max-h-[500px] overflow-y-auto p-4 bg-muted/20 space-y-5">
                {analysisResult ? (
                   <div className="space-y-4">
                     <AnalysisSummary summary={analysisResult.summary} />
                     
                     <Separator />

                     <AnalysisSection title="Key Symbols">
                       <SymbolExplorer symbols={analysisResult.keySymbols} />
                     </AnalysisSection>

                     <AnalysisSection title="Archetypes">
                       <ArchetypeGallery archetypes={analysisResult.archetypes} />
                     </AnalysisSection>
                     
                     <AnalysisSection title="Emotional Themes">
                       <EmotionalThemesPanel themes={analysisResult.emotionalThemes} />
                     </AnalysisSection>

                     {/* Render Optional Sections Conditionally */} 
                     {analysisResult.narrativeAnalysis && (Object.keys(analysisResult.narrativeAnalysis).length > 0 && (Object.values(analysisResult.narrativeAnalysis).some(v => v && v.trim() !== ''))) && (
                       <AnalysisSection title="Narrative Flow">
                         <NarrativeAnalysis narrative={analysisResult.narrativeAnalysis} />
                       </AnalysisSection>
                     )}
                      
                     {analysisResult.personalConnections && analysisResult.personalConnections.length > 0 && (
                        <AnalysisSection title="Waking Life Connections">
                           <PersonalConnections connections={analysisResult.personalConnections} />
                        </AnalysisSection>
                     )}

                     {analysisResult.patternRecognition && (analysisResult.patternRecognition.recurringSymbols?.length || analysisResult.patternRecognition.evolutionNotes) && (
                       <AnalysisSection title="Pattern Recognition">
                         <PatternRecognition patterns={analysisResult.patternRecognition} />
                       </AnalysisSection>
                     )}

                     {analysisResult.analysis && (Object.keys(analysisResult.analysis).length > 0 && (Object.values(analysisResult.analysis).some(v => v && v.trim() !== ''))) && (
                       <AnalysisSection title="Psychological Perspectives">
                          <PerspectiveAnalysis perspectives={analysisResult.analysis} />
                       </AnalysisSection>
                     )}
                     
                      <Separator />
                      
                     <AnalysisSection title="Guided Reflection">
                       <GuidedReflection questions={analysisResult.guidedReflection} />
                     </AnalysisSection>
                   </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No analysis available or analysis failed.</p>
                )}
             </div>

             {/* Action Buttons */}
             <div className="flex justify-end space-x-3">
               <Button variant="outline" onClick={handleEditDream} disabled={isLoading}>Edit Dream</Button>
               <Button onClick={handleSaveDream} disabled={isLoading}>Save Dream</Button>
             </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
} 

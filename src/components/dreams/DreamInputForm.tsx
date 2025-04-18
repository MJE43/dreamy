'use client'

import * as React from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { Loader2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Slider } from "@/components/ui/slider"
import { Combobox } from "@/components/ui/combobox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { useLiveRegion } from "@/context/LiveRegionContext"

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

export default function DreamInputForm() {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<DreamFormData | null>(null); // Store form data for saving
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
    setFormData(values); // Store current form data
    const dataToSend = { ...values, tags: values.tags?.join(",") || "" };

    try {
      // Call the new analysis-only endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze dream');
      }

      if (result.analysis) {
        setAnalysisResult(result.analysis);
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
      analysisContent: analysisResult, // Include the analysis
    };

    try {
      // Call the modified ingest endpoint
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save dream');
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
      <div className="flex items-center justify-center space-x-2 mb-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">1 Write Dream</span>
        <span>→</span>
        <span>2 View Analysis</span>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div>
        <Stepper />

        {step === (1 as 1 | 2) && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAnalyzeDream)} className="space-y-6 relative">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dream Description</FormLabel>
                    <FormControl>
                      <TextareaAutosize
                        placeholder="Describe your dream..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        minRows={4}
                        maxRows={15}
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
                  <FormItem>
                    <FormLabel>Mood</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-3">
                        <Slider
                          defaultValue={[field.value]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="flex-grow mood-slider"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="font-medium w-12 text-center flex items-center justify-center space-x-1 cursor-default">
                              <span>{moodMap[field.value]?.emoji || "😐"}</span>
                              <span>({field.value})</span>
                            </div>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                       <Combobox
                         options={TAGS}
                         selected={field.value || []}
                         onChange={field.onChange}
                         placeholder="Select or create tags..."
                         allowFreeText={true}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Dream"}
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
             {/* Analysis Display */} 
             <div className="border rounded-md min-h-[200px] max-h-[350px] overflow-y-auto p-3 bg-muted/30">
                {analysisResult ? (
                   <ReactMarkdown
                     remarkPlugins={[remarkGfm]}
                     components={{
                       h1: ({ ...props }) => <h1 className="text-xl font-bold my-3" {...props} />,
                       h2: ({ ...props }) => <h2 className="text-lg font-semibold my-2" {...props} />,
                       p: ({ ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                       ul: ({ ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                       ol: ({ ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                       li: ({ ...props }) => <li className="ml-4" {...props} />,
                       a: ({ ...props }) => <a className="text-blue-600 hover:underline dark:text-blue-400" {...props} />,
                     }}
                   >
                        {analysisResult}
                   </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground">No analysis available.</p>
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

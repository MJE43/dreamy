"use client";

import * as React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  mood: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
});

const TAGS = [
  { value: "flying", label: "Flying" },
  { value: "falling", label: "Falling" },
  { value: "chased", label: "Chased" },
  { value: "school", label: "School" },
  { value: "work", label: "Work" },
];

type Step = "entry" | "analyzing" | "analysis" | "saving" | "success";

export default function DreamInputFormWizard({ onDreamSaved }: { onDreamSaved?: () => void }) {
  const [step, setStep] = React.useState<Step>("entry");
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      mood: 3,
      tags: [],
    },
  });

  // Step 1: Analyze dream (do not save yet)
  async function handleAnalyze(values: z.infer<typeof formSchema>) {
    setStep("analyzing");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: values.description,
          mood: values.mood,
          tags: values.tags?.join(",") || "",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Analysis failed");
      setAnalysis(result.analysis);
      setStep("analysis");
    } catch (error) {
      setStep("entry");
      toast.error((error as Error).message || "Failed to analyze dream");
    }
  }

  // Step 2: Save dream (after analysis, or skip analysis)
  async function handleSave() {
    setIsSaving(true);
    const values = form.getValues();
    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: values.description,
          mood: values.mood,
          tags: values.tags?.join(",") || "",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save dream");
      setStep("success");
      toast.success("Dream saved!");
      form.reset();
      setAnalysis(null);
      setIsSaving(false);
      if (onDreamSaved) onDreamSaved();
      // Reset to entry after short delay
      setTimeout(() => setStep("entry"), 1500);
    } catch (error) {
      setIsSaving(false);
      toast.error((error as Error).message || "Could not save dream");
    }
  }

  function handleEdit() {
    setStep("entry");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <span className={step === "entry" || step === "analyzing" ? "font-bold" : "text-muted-foreground"}>1. Write Dream</span>
            <span>→</span>
            <span className={step === "analysis" || step === "saving" || step === "success" ? "font-bold" : "text-muted-foreground"}>2. View Analysis</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === "entry" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAnalyze)}
              className="space-y-6"
              autoComplete="off"
            >
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood (1: Negative - 5: Positive)</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-3">
                        <Slider
                          defaultValue={[field.value]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="flex-grow"
                        />
                        <div className="font-medium w-4 text-center">{field.value}</div>
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
                    <Combobox
                      options={TAGS}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select or create tags..."
                      allowFreeText={true}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={step === "analyzing"}>
                {step === "analyzing" ? "Analyzing..." : "Analyze Dream"}
              </Button>
            </form>
          </Form>
        )}
        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4" />
            <div className="text-muted-foreground">Analyzing your dream...</div>
          </div>
        )}
        {step === "analysis" && (
          <div className="space-y-6">
            <div>
              <div className="font-semibold mb-2">AI Dream Analysis</div>
              <div className="prose prose-sm max-w-none bg-muted/50 rounded-md p-3 whitespace-pre-line">
                {analysis}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={handleEdit} disabled={isSaving}>
                Edit Dream
              </Button>
              <Button type="button" onClick={handleSave} loading={isSaving}>
                Save Dream
              </Button>
            </div>
          </div>
        )}
        {step === "success" && (
          <div className="flex flex-col items-center py-8">
            <div className="text-green-600 font-semibold mb-2">Dream saved!</div>
            <div className="text-muted-foreground">You can log another dream or view your dashboard insights.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

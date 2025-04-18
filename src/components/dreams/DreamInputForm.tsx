'use client'

import * as React from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Slider } from "@/components/ui/slider"
import { Combobox } from "@/components/ui/combobox"

// Define schema directly in the component or import from a shared location
const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  mood: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
})

// Placeholder tags - TODO: replace with dynamic tags fetched from DB or user history
const TAGS = [
  { value: "flying", label: "Flying" },
  { value: "falling", label: "Falling" },
  { value: "chased", label: "Chased" },
  { value: "school", label: "School" },
  { value: "work", label: "Work" },
];

export default function DreamInputForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      mood: 3,
      tags: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const dataToSend = {
      ...values,
      tags: values.tags?.join(",") || "",
    };

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save dream');
      }

      toast.success("Dream saved successfully! Redirecting...")

      if (result.dreamId) {
        router.push(`/dream/${result.dreamId}`);
        // Optionally reset form after successful redirect?
        // form.reset(); 
      } else {
        console.error("Dream ID missing from successful response.");
        toast.warning("Dream saved, but could not redirect.");
        form.reset(); // Reset form if redirect fails
      }

    } catch (error) {
      console.error("Submission error:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unknown error occurred while saving the dream.");
      }
      setIsSubmitting(false); // Only set submitting false on error if redirect fails
    }
     // Don't set isSubmitting to false here if redirect is successful, as the component might unmount
  }

  // Removed the outer Card and container divs, assuming the parent component will provide structure
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Description Field */}
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
                  minRows={4} // Slightly smaller default size for dashboard
                  maxRows={15}
                  {...field}
                />
              </FormControl>
              {/* <FormDescription>Describe your dream in as much detail as possible.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mood Field */}
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
              {/* <FormDescription>How did you feel overall?</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags Field */}
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
               {/* <FormDescription>Add tags to categorize.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Analyzing..." : "Analyze Dream"} {/* Changed button text */}
        </Button>
      </form>
    </Form>
  );
} 

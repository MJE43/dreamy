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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox" // Assuming combobox is created/imported correctly

// Placeholder tags - replace with dynamic tags later
const TAGS = [
  { value: "flying", label: "Flying" },
  { value: "falling", label: "Falling" },
  { value: "chased", label: "Chased" },
  { value: "school", label: "School" },
  { value: "work", label: "Work" },
];

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  mood: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(), // Array of strings for tags in the form
})

export default function NewDreamPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      mood: 3, // Default mood
      tags: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const dataToSend = {
      ...values,
      tags: values.tags?.join(",") || "",
    };
    console.log("Form Submitted:", values);
    console.log("Data to send:", dataToSend);

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

      console.log("API Response:", result);
      toast.success("Dream saved successfully! Redirecting...")

      if (result.dreamId) {
          router.push(`/dream/${result.dreamId}`);
      } else {
          console.error("Dream ID missing from successful response.");
          toast.warning("Dream saved, but could not redirect.");
      }

    } catch (error) {
       console.error("Submission error:", error);
       if (error instanceof Error) {
         toast.error(`Error: ${error.message}`);
       } else {
         toast.error("An unknown error occurred while saving the dream.");
       }
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Record a New Dream</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dream Description</FormLabel>
                    <FormControl>
                      <TextareaAutosize
                        placeholder="I was flying over..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        minRows={5}
                        maxRows={20}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your dream in as much detail as possible.
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
                    <FormLabel>Mood (1: Very Negative - 5: Very Positive)</FormLabel>
                    <FormControl>
                      <div>
                        <Slider
                          defaultValue={[field.value]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="bg-gradient-to-r from-green-300 via-yellow-300 to-red-400 rounded-full"
                        />
                        <div className="text-center mt-2 font-medium">{field.value}</div>
                      </div>
                    </FormControl>
                     <FormDescription>
                      How did you feel overall during the dream?
                    </FormDescription>
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
                    <FormDescription>
                      Add tags to categorize your dream (e.g., flying, work, specific person).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                 {isSubmitting ? "Saving..." : "Save Dream"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 

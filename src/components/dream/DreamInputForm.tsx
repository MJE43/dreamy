'use client'

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty." }).max(100, {
    message: "Title must not be longer than 100 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
})

interface DreamInputFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export function DreamInputForm({ onSubmit }: DreamInputFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  function handleSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    onSubmit(values) // Pass data to parent component
    form.reset() // Optionally reset the form
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dream Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Flying over the city" {...field} />
              </FormControl>
              <FormDescription>
                A brief title for your dream.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dream Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your dream in detail..."
                  className="resize-none"
                  rows={10}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include symbols, settings, characters, and feelings.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Analyze Dream</Button>
      </form>
    </Form>
  )
} 

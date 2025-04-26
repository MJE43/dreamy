'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { type Goal } from '@/generated/prisma'; // Import Goal type from Prisma

// Schema for form validation (matches API input)
const goalFormSchema = z.object({
    title: z.string().min(3, { message: "Goal title needs at least 3 characters." }),
    targetDate: z.string().optional(), // Keep as string for date input
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface GoalCreatorModalProps {
    onGoalCreated?: (newGoal: Goal) => void; // Use Prisma Goal type
    children: React.ReactNode; // The trigger button/element
}

export default function GoalCreatorModal({ onGoalCreated, children }: GoalCreatorModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<GoalFormValues>({
        resolver: zodResolver(goalFormSchema),
        defaultValues: {
            title: "",
            targetDate: "",
        },
    });

    const onSubmit = async (values: GoalFormValues) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Failed to create goal (${response.status})`);
            }

            toast.success("Goal created successfully!");
            if (onGoalCreated) {
                onGoalCreated(result); // Pass the new goal data back
            }
            form.reset(); // Clear form
            setIsOpen(false); // Close modal

        } catch (error: unknown) {
            let errorMessage = "An unexpected error occurred.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error("Failed to create goal:", error);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children} 
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Set a New Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="goal-title">Goal Title</Label>
                        <Input 
                            id="goal-title" 
                            placeholder="e.g., Learn Next.js App Router" 
                            {...form.register("title")}
                        />
                        {form.formState.errors.title && (
                            <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="goal-targetDate">Target Date (Optional)</Label>
                        <Input 
                            id="goal-targetDate" 
                            type="date" 
                            {...form.register("targetDate")}
                        />
                        {/* No validation error shown for optional field */}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" disabled={isLoading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Create Goal & Generate Milestones"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 

'use client';

import { useState } from 'react';
import { MilestoneItem, Milestone } from './MilestoneItem';
import { toast } from 'sonner';

interface MilestoneListProps {
  goalId: string;
  initialPlan: Milestone[];
  onPlanUpdate: (updatedGoal: any) => void; // Callback to update parent component's state
  isGoalCompleted: boolean;
}

export function MilestoneList({ goalId, initialPlan, onPlanUpdate, isGoalCompleted }: MilestoneListProps) {
  const [plan, setPlan] = useState<Milestone[]>(initialPlan);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMilestoneChange = async (index: number, completed: boolean) => {
    const newPlan = [...plan];
    newPlan[index] = { ...newPlan[index], completed };

    // Optimistic UI update
    setPlan(newPlan);
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update milestone');
      }

      const updatedGoal = await response.json();
      
      // Update local state with data from server
      setPlan(updatedGoal.plan); 
      onPlanUpdate(updatedGoal); // Notify parent component
      toast.success(`Milestone "${newPlan[index].text}" ${completed ? 'completed' : 'marked incomplete'}.`);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
      // Revert optimistic update if error
      setPlan(initialPlan); 
      // Potentially call onPlanUpdate with initialGoal if needed to revert parent state
    } finally {
      setIsUpdating(false);
    }
  };

  if (!plan || plan.length === 0) {
    return <p className="text-sm text-muted-foreground">No milestones defined for this goal yet.</p>;
  }

  return (
    <div className="space-y-2">
      {plan.map((milestone, index) => (
        <MilestoneItem
          key={index}
          id={`milestone-${goalId}-${index}`} // More unique ID
          milestone={milestone}
          onCheckedChange={(completed) => handleMilestoneChange(index, completed)}
          isUpdating={isUpdating || isGoalCompleted} // Disable if goal is completed
        />
      ))}
      {isGoalCompleted && (
         <p className="text-sm font-semibold text-green-600 dark:text-green-500 pt-2">
            🎉 Goal achieved! All milestones are complete.
        </p>
      )}
    </div>
  );
}

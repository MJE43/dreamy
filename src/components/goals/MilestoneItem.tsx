'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Milestone {
  text: string;
  completed: boolean;
}

interface MilestoneItemProps {
  milestone: Milestone;
  onCheckedChange: (completed: boolean) => void;
  isUpdating: boolean; // To disable checkbox while an update is in progress
  id: string; // Unique ID for the checkbox and label association
}

export function MilestoneItem({ milestone, onCheckedChange, isUpdating, id }: MilestoneItemProps) {
  return (
    <div className="flex items-center space-x-2 py-2">
      <Checkbox
        id={id}
        checked={milestone.completed}
        onCheckedChange={onCheckedChange}
        disabled={isUpdating}
        aria-label={`Mark milestone "${milestone.text}" as ${milestone.completed ? 'incomplete' : 'complete'}`}
      />
      <Label
        htmlFor={id}
        className={`text-sm ${milestone.completed ? "line-through text-muted-foreground" : ""}`}
      >
        {milestone.text}
      </Label>
    </div>
  );
}

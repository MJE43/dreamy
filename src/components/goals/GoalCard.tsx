'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Mirror the Goal type expected by this card
// (aligns with what GET /api/goals should return)
export interface GoalCardData {
  id: string;
  title: string;
  targetDate?: string | null; // Optional
  plan: Array<{ text: string; completed: boolean }>;
  completed: boolean;
  progress: number; // Progress percentage (0-100)
}

interface GoalCardProps {
  goal: GoalCardData;
}

export function GoalCard({ goal }: GoalCardProps) {
  const nextMilestones = goal.plan
    .filter(m => !m.completed)
    .slice(0, 2) // Get next 1-2 uncompleted milestones
    .map(m => m.text);

  return (
    <Link href={`/goal/${goal.id}`} passHref legacyBehavior>
      <a className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
        <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold leading-tight">{goal.title}</CardTitle>
              {goal.completed && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100">
                  Achieved!
                </Badge>
              )}
            </div>
            {goal.targetDate && (
                 <CardDescription className="text-xs">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                 </CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-muted-foreground">Progress</span>
                <span className="text-xs font-bold">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>

            {!goal.completed && nextMilestones.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-1 text-muted-foreground">Next up:</h4>
                <ul className="list-disc list-inside space-y-0.5">
                  {nextMilestones.map((text, index) => (
                    <li key={index} className="text-xs text-muted-foreground truncate" title={text}>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!goal.completed && nextMilestones.length === 0 && goal.plan.length > 0 && (
                 <p className="text-xs text-muted-foreground italic">All milestones planned are complete, but goal not marked achieved yet!</p>
            )}
            {goal.completed && goal.plan.length > 0 && (
                <p className="text-xs text-green-600 dark:text-green-500 italic">🎉 All milestones achieved!</p>
            )}
            {goal.plan.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No milestones defined yet.</p>
            )}
          </CardContent>
          {/* CardFooter can be added if needed, e.g. for quick actions */}
          {/* <CardFooter className="text-xs text-muted-foreground">
            <p>Updated: {new Date(goal.updatedAt).toLocaleDateString()}</p>
          </CardFooter> */}
        </Card>
      </a>
    </Link>
  );
}

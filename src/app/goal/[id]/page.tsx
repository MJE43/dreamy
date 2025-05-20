'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MilestoneList } from '@/components/goals/MilestoneList';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Mirror the Prisma Goal type structure, at least the parts we use
interface Goal {
  id: string;
  title: string;
  targetDate: string | null;
  plan: Array<{ text: string; completed: boolean }>;
  progress: number;
  completed: boolean;
  createdAt: string;
  // progressLog isn't directly displayed here yet, but good to have if needed
}

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goalId) {
      const fetchGoal = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/goals/${goalId}`);
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Goal not found.');
            } else if (response.status === 401) {
              throw new Error('Unauthorized to view this goal.');
            }
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch goal (status: ${response.status})`);
          }
          const data: Goal = await response.json();
          setGoal(data);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGoal();
    }
  }, [goalId]);

  const handlePlanUpdate = (updatedGoal: Goal) => {
    // Update the goal state which will re-render MilestoneList and Progress
    setGoal(updatedGoal);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!goal) {
    // Should be covered by error state, but as a fallback
    return (
         <div className="container mx-auto p-4 md:p-6 text-center">
            <p>Goal data could not be loaded.</p>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
        </div>
    );
  }
  
  const formattedTargetDate = goal.targetDate 
    ? new Date(goal.targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'Not set';

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Button onClick={() => router.back()} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold">{goal.title}</CardTitle>
            {goal.completed && <Badge color="green" className="text-sm bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100">Achieved!</Badge>}
          </div>
          <CardDescription>
            Target Date: {formattedTargetDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-bold">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="w-full h-3" />
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Milestones</h3>
          <MilestoneList
            goalId={goal.id}
            initialPlan={goal.plan}
            onPlanUpdate={handlePlanUpdate}
            isGoalCompleted={goal.completed}
          />
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Created on: {new Date(goal.createdAt).toLocaleDateString()}
        </CardFooter>
      </Card>
    </div>
  );
}

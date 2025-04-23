'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDilemmas, DilemmaForQuiz } from './actions'; // Server Action
import DilemmaCard from '@/components/DilemmaCard';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"; // For progress bar

interface Answer {
  code: string;
  choice: string; // 'A' or 'B'
}

export default function Step2Page() {
  const router = useRouter();
  const [dilemmas, setDilemmas] = useState<DilemmaForQuiz[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { [dilemmaCode]: choice }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDilemmas() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedDilemmas = await fetchDilemmas();
        if (!fetchedDilemmas || fetchedDilemmas.length === 0) {
           setError("Could not load dilemmas. Please try refreshing.");
        } else {
           setDilemmas(fetchedDilemmas);
        }
      } catch (err) {
        console.error("Failed to fetch dilemmas:", err);
        setError("An error occurred while loading dilemmas.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDilemmas();
  }, []);

  const handleAnswerChange = (dilemmaCode: string, choice: string) => {
    setAnswers(prev => ({ ...prev, [dilemmaCode]: choice }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalDilemmas = dilemmas.length;
  const progress = totalDilemmas > 0 ? (answeredCount / totalDilemmas) * 100 : 0;
  const allAnswered = answeredCount === totalDilemmas && totalDilemmas > 0;

  const handleNext = () => {
    if (!allAnswered) return;

    // Format answers for storage/API
    const formattedAnswers: Answer[] = Object.entries(answers).map(([code, choice]) => ({
      code,
      choice,
    }));

    try {
      // Store answers in sessionStorage for Step 3 to pick up
      sessionStorage.setItem('onboardingAnswers', JSON.stringify(formattedAnswers));
      router.push('./step-3');
    } catch (sessionError) {
        console.error("Error saving answers to sessionStorage:", sessionError);
        setError("Could not save progress. Please ensure cookies/session storage are enabled.");
        // Don't navigate if we can't save
    }
  };

  if (isLoading) {
    return <div>Loading dilemmas...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Step 2: Worldview Quiz</h2>
      <p className="text-muted-foreground mb-4">Choose the option that resonates most with you for each dilemma.</p>

      {totalDilemmas > 0 && (
         <div className="mb-6">
           <Progress value={progress} className="w-full" />
           <p className="text-sm text-muted-foreground mt-1 text-right">
             {answeredCount} / {totalDilemmas} answered
           </p>
         </div>
      )}

      <div className="space-y-4">
        {dilemmas.map((dilemma) => (
          <DilemmaCard
            key={dilemma.code}
            dilemma={dilemma} // Pass the whole dilemma object
            value={answers[dilemma.code]}
            onChange={(choice) => handleAnswerChange(dilemma.code, choice)}
          />
        ))}
      </div>

      <Button
        onClick={handleNext}
        disabled={!allAnswered || isLoading}
        className="mt-6"
      >
        Next: Dream Import Option
      </Button>
    </div>
  );
} 

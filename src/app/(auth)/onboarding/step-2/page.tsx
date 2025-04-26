'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDilemmas, DilemmaForQuiz, DilemmaChoice } from './actions'; // Server Action
import DilemmaCard from '@/components/DilemmaCard'; // Restore alias import
// import DilemmaCard from '../../../../components/DilemmaCard';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"; // For progress bar

// Matches structure expected by classifyWorldview API
interface AnswerPayload {
  code: string;  // e.g., "DILEMMA_01"
  choice: string; // Stage score, e.g., "GREEN", "ORANGE"
}

export default function Step2Page() {
  const router = useRouter();
  const [dilemmas, setDilemmas] = useState<DilemmaForQuiz[]>([]);
  // Store answers as { [dilemmaCode]: stageScore }
  const [answers, setAnswers] = useState<Record<string, string>>({}); 
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

  // Handler when a dilemma answer changes
  // Accepts the OPTION ('A' or 'B') selected by the user
  const handleAnswerChange = (dilemmaCode: string, option: string) => {
    // Find the dilemma and the chosen choice to get the score
    const dilemma = dilemmas.find(d => d.code === dilemmaCode);
    const choice = dilemma?.details?.choices?.find((c: DilemmaChoice) => c.option === option);
    const stageScore = choice?.score; // e.g., "GREEN", "ORANGE", etc.

    if (stageScore) {
        setAnswers(prev => ({
        ...prev,
        [dilemmaCode]: stageScore, // Store the score associated with the choice
        }));
    } else {
        // Handle case where score might be missing (optional logging/error handling)
        console.warn(`Score not found for dilemma ${dilemmaCode}, option ${option}`);
        // Optionally remove the answer if the selected option becomes invalid
        setAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[dilemmaCode];
            return newAnswers;
        });
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalDilemmas = dilemmas.length;
  const progress = totalDilemmas > 0 ? (answeredCount / totalDilemmas) * 100 : 0;
  const allAnswered = answeredCount === totalDilemmas && totalDilemmas > 0;

  const handleNext = () => {
    if (!allAnswered) return;

    // Format answers for storage: [{ code: string, choice: string (score) }]
    const formattedAnswers: AnswerPayload[] = Object.entries(answers).map(([code, score]) => ({
      code: code,
      choice: score, // Save the score as the 'choice'
    }));

    try {
      // Store answers in sessionStorage for Step 3 to pick up
      // Key matches the expected structure for /api/classifyWorldview
      sessionStorage.setItem('onboardingAnswers', JSON.stringify(formattedAnswers));
      router.push('./step-3');
    } catch (sessionError) {
        console.error("Error saving answers to sessionStorage:", sessionError);
        setError("Could not save progress. Please ensure cookies/session storage are enabled.");
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
        {dilemmas.map((dilemma) => {
          // Find the stage score associated with the currently selected answer (if any)
          const selectedScore = answers[dilemma.code]; 
          return (
            <DilemmaCard
              key={dilemma.code}
              dilemma={dilemma}
              value={selectedScore ? 
                       dilemma.details?.choices?.find(c => c.score === selectedScore)?.option 
                       : undefined} // Temporary: Pass A/B based on score for now
              onChange={(option) => handleAnswerChange(dilemma.code, option)}
            />
          );
        })}
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

// Placeholder for Step 3: Dream Import
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming shadcn Button
import { Checkbox } from '@/components/ui/checkbox'; // Assuming shadcn Checkbox
import { Label } from '@/components/ui/label'; // Assuming shadcn Label
import { useRouter } from 'next/navigation';

export default function Step3Page() {
  const router = useRouter();
  const [includeDreams, setIncludeDreams] = useState(false);

  // Define the expected structure for answers retrieved from storage
  interface StoredAnswer {
      code: string;
      choice: string;
  }

  const handleFinish = async () => {
    let answers: StoredAnswer[] = []; // Typed placeholder
    try {
      const storedAnswers = sessionStorage.getItem('onboardingAnswers');
      if (storedAnswers) {
        answers = JSON.parse(storedAnswers) as StoredAnswer[];
        // Basic validation could be added here if needed
      }
    } catch (e) {
        console.error("Failed to parse answers from sessionStorage", e);
        // TODO: Show error to user that progress might be lost
        // Potentially halt submission if answers are critical
    }

    console.log('Submitting final onboarding data:', { answers, includeDreams });

    try {
      const response = await fetch('/api/onboarding/dilemmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, includeDreams }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      const result = await response.json();
      if (result.ok) {
        // Optional: Clear sessionStorage
        // sessionStorage.removeItem('onboardingAnswers');
        router.push('/dashboard'); // Redirect on success
      } else {
        console.error('API did not return ok:', result);
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error('Error submitting onboarding data:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 3: Dream Import</h2>
      <p className="mb-6">
        Would you like to include your previously logged dreams in the initial worldview analysis?
        This can provide richer insights.
      </p>
      <div className="flex items-center space-x-2 mb-6">
        <Checkbox 
            id="includeDreams" 
            checked={includeDreams} 
            // Add type for checked state for shadcn Checkbox
            onCheckedChange={(checked: boolean | 'indeterminate') => setIncludeDreams(Boolean(checked))} 
        />
        <Label htmlFor="includeDreams">Include past dreams in analysis</Label>
      </div>
      <Button onClick={handleFinish}>Finish Onboarding</Button>
    </div>
  );
} 
 
// Placeholder for Step 3: Dream Import
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"; // Import toast for feedback

export default function Step3Page() {
  const router = useRouter();
  const [includeDreams, setIncludeDreams] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define the expected structure for answers retrieved from storage
  interface StoredAnswer {
      code: string;
      choice: string;
  }

  const handleFinish = async () => {
    setIsLoading(true);
    setError(null);
    let answers: StoredAnswer[] = [];

    // Retrieve answers from sessionStorage
    try {
      const storedAnswers = sessionStorage.getItem('onboardingAnswers');
      if (storedAnswers) {
        answers = JSON.parse(storedAnswers);
      } else {
        console.warn("No onboarding answers found in sessionStorage.");
        setError("Could not retrieve quiz answers. Please go back.");
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.error("Failed to parse answers from sessionStorage", e);
      setError("Failed to load quiz answers. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      // --- Step 1: Save profile data --- 
      console.log('Saving profile to /api/onboarding/dilemmas:', { answers, includeDreams });
      const profilePayload = { answers, includeDreams };
      const profileResponse = await fetch('/api/onboarding/dilemmas', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      });

      if (!profileResponse.ok) {
          const errorData = await profileResponse.json().catch(() => ({})); 
          console.error('Save Profile API Error:', errorData);
          throw new Error(errorData.error || `Failed to save profile data (${profileResponse.status})`);
      }
      console.log("Profile data saved successfully.");

      // --- Step 2: Trigger classification --- 
      console.log('Triggering classification via /api/classifyWorldview');
      const classifyResponse = await fetch('/api/classifyWorldview', { 
        method: 'POST', 
        // No body needed, API fetches data based on user session
        headers: { 'Content-Type': 'application/json' }, 
      });

      if (!classifyResponse.ok) {
          const errorData = await classifyResponse.json().catch(() => ({})); 
          console.error('Classify API Error Response:', errorData);
          // Include specific error from classification if available
          throw new Error(errorData.error || `Failed to classify worldview (${classifyResponse.status})`);
      }

      const result = await classifyResponse.json();
      console.log("Classification API Success Response:", result);

      toast.success("Onboarding complete! Welcome.");
      sessionStorage.removeItem('onboardingAnswers'); 
      router.push('/'); 

    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error during final onboarding step:', error);
      setError(errorMessage);
      toast.error("Error completing onboarding: " + errorMessage);
    } finally {
        setIsLoading(false);
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
            onCheckedChange={(checked: boolean | 'indeterminate') => setIncludeDreams(Boolean(checked))} 
        />
        <Label htmlFor="includeDreams">Include past dreams in analysis</Label>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">Error: {error}</p>}
      <Button onClick={handleFinish} disabled={isLoading}>
        {isLoading ? "Processing..." : "Finish Onboarding & Analyze"}
      </Button>
    </div>
  );
} 
 
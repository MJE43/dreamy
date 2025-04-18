'use client'

import { useState } from 'react';
import { DreamInputForm } from '@/components/dream/DreamInputForm';
import { DreamDisplay } from '@/components/dream/DreamDisplay';

interface DreamData {
  title: string;
  description: string;
  analysis?: string; // Placeholder for future analysis
}

export default function DreamPage() {
  const [currentDream, setCurrentDream] = useState<DreamData | null>(null);

  const handleDreamSubmit = (data: { title: string; description: string }) => {
    // Here you would eventually trigger the analysis API call
    console.log("Dream Submitted:", data);
    // For now, just update the state to display the submitted dream
    setCurrentDream({ ...data, analysis: undefined }); // Reset analysis when new dream is submitted
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Dream Analysis</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Enter Your Dream</h2>
          <DreamInputForm onSubmit={handleDreamSubmit} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Dream & Analysis</h2>
          {currentDream ? (
            <DreamDisplay
              title={currentDream.title}
              description={currentDream.description}
              analysis={currentDream.analysis} // Pass analysis here later
            />
          ) : (
            <p className="text-muted-foreground">Submit a dream to see it displayed here.</p>
          )}
        </div>
      </div>
    </div>
  );
} 
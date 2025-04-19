'use client'

// import { useState } from 'react'; // Unused now
import DreamInputForm from '@/components/dreams/DreamInputForm';
// import { DreamDisplay } from '@/components/dream/DreamDisplay'; // Unused now

/* Unused type definition
interface DreamData {
  title: string;
  description: string;
  analysis?: string; // Placeholder for future analysis
}
*/

export default function DreamPage() {
  // const [currentDream, setCurrentDream] = useState<DreamData | null>(null); // Commented out - Form handles its own state

  /* Remove unused handler function
  const handleDreamSubmit = (data: { title: string; description: string }) => {
    // Here you would eventually trigger the analysis API call
    console.log("Dream Submitted:", data);
    // For now, just update the state to display the submitted dream
    setCurrentDream({ ...data, analysis: undefined }); // Reset analysis when new dream is submitted
  };
  */

  // TODO: Need a way to update currentDream based on DreamInputForm's internal state/API calls

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Dream Analysis</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Enter Your Dream</h2>
          <DreamInputForm />
        </div>
        {/* Commented out display section as state is not currently updated
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
        */}
        {/* Added placeholder for the second column */}
        <div>
           <h2 className="text-2xl font-semibold mb-4">Dream & Analysis</h2>
           <p className="text-muted-foreground">Display area (currently inactive).</p>
        </div>
      </div>
    </div>
  );
} 

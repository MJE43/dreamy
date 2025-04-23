import React from 'react';

interface StepperProps {
  currentStep: number;
  steps: { title: string }[];
}

// Basic placeholder - implement actual styling later
export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="flex justify-center space-x-4 my-6 p-4 bg-muted rounded-md">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={step.title} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-muted-foreground bg-background text-muted-foreground'
                }`}
            >
              {isCompleted ? '✓' : stepNumber}
            </div>
            <span className={`mt-2 text-sm ${isActive ? 'font-semibold' : 'text-muted-foreground'}`}>
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
} 

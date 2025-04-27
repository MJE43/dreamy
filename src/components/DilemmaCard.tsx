'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DilemmaForQuiz } from "@/app/(auth)/onboarding/step-2/actions";

interface DilemmaCardProps {
  dilemma: DilemmaForQuiz;
  // value now represents the selected STAGE SCORE (e.g., "GREEN", "ORANGE")
  value?: string; 
  // onChange still provides the selected OPTION LETTER ('A' or 'B') for simplicity in RadioGroup
  onChange: (option: string) => void; 
}

const DilemmaCard: React.FC<DilemmaCardProps> = ({ dilemma, value, onChange }) => {
  const choices = dilemma.details?.choices;

  if (!choices || choices.length !== 2) {
    // Optional: Handle cases where choices are missing or not exactly two
    console.error(`Dilemma ${dilemma.code} has invalid choices.`);
    return null; // Or render an error state
  }

  // Determine the selected OPTION ('A' or 'B') based on the provided STAGE SCORE (value)
  const selectedOption = choices.find(c => c.score === value)?.option;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{dilemma.name}</CardTitle>
        <CardDescription>{dilemma.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 
          RadioGroup's value prop expects the value of the *selected item* ('A' or 'B').
          We map the parent's `value` (stage score) to the correct option ('A' or 'B').
          onValueChange still provides the selected item's value ('A' or 'B') back to the parent.
        */}
        <RadioGroup 
          value={selectedOption} // Set checked state based on the option corresponding to the score
          onValueChange={onChange} // Parent receives 'A' or 'B' 
          className="space-y-2"
        >
          {choices.map((choice) => (
            <div key={choice.option} className="flex items-center space-x-2">
              <RadioGroupItem value={choice.option} id={`${dilemma.code}-${choice.option}`} />
              <Label htmlFor={`${dilemma.code}-${choice.option}`} className="cursor-pointer">
                {choice.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default DilemmaCard; 

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Define a more specific type for Dilemma for clarity
// Assuming the structure fetched matches this, especially 'details.choices'
interface DilemmaChoice {
  option: string; // e.g., "A"
  text: string;
  score?: string; // e.g., "BLUE", "ORANGE"
}

interface Dilemma {
  id: string;
  code: string;
  name: string;
  description: string;
  details?: {
    choices?: DilemmaChoice[];
  } | null;
}

interface DilemmaCardProps {
  dilemma: Dilemma;
  value: string | undefined; // The selected option ('A' or 'B')
  onChange: (value: string) => void;
}

export default function DilemmaCard({ dilemma, value, onChange }: DilemmaCardProps) {
  // Extract choices safely
  const choices = dilemma.details?.choices || [];
  const choiceA = choices.find(c => c.option === 'A');
  const choiceB = choices.find(c => c.option === 'B');

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{dilemma.name}</CardTitle>
        <CardDescription>{dilemma.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={onChange}>
          {choiceA && (
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="A" id={`${dilemma.code}-A`} />
              <Label htmlFor={`${dilemma.code}-A`} className="font-normal cursor-pointer">
                {choiceA.text}
              </Label>
            </div>
          )}
          {choiceB && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B" id={`${dilemma.code}-B`} />
              <Label htmlFor={`${dilemma.code}-B`} className="font-normal cursor-pointer">
                {choiceB.text}
              </Label>
            </div>
          )}
        </RadioGroup>
      </CardContent>
    </Card>
  );
} 

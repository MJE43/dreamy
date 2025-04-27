'use server';

import { PrismaClient, RefType } from '@/generated/prisma'; // Use correct import path

const prisma = new PrismaClient();

// Define the specific structure for choices within the fetched dilemma details
interface DilemmaQuizChoice {
  option: string;
  text: string;
  score?: string; // Score is optional and a string based on mapping logic
}

// Define the structure for the choice part of an answer (exported as requested)
export interface DilemmaChoice {
  category: string;
  score: number;
}

// Define the structure for a dilemma fetched for the quiz based on actual data
// Rename DilemmaQuizData to DilemmaForQuiz and export it
export interface DilemmaForQuiz { // Renamed from DilemmaQuizData and exported
  id: number; // Prisma ID is a number
  code: string;
  name: string;
  description: string | null;
  details: { // Details object structure
    choices: DilemmaQuizChoice[];
  } | null; // Details can be null
}

// Interface for the expected structure within the Prisma 'details' JsonValue
interface PrismaDilemmaDetails {
  choices: Array<{
    option?: unknown; // Use unknown first
    text?: unknown;
    score?: unknown;
  }>;
}

// Helper type guard to check if an object has the expected details structure
function hasDilemmaDetails(details: unknown): details is PrismaDilemmaDetails {
  return (
    details != null &&
    typeof details === 'object' &&
    'choices' in details && // Check for 'choices' property existence
    Array.isArray((details as { choices: unknown }).choices) // Then safely check if it's an array
  );
}

export async function fetchDilemmas(): Promise<DilemmaForQuiz[]> { // Update return type
  try {
    const dilemmas = await prisma.spiralReference.findMany({
      where: { type: RefType.DILEMMA },
      take: 10,
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        details: true, // Select the Json field
      },
    });

    // Process the details field safely
    const formattedDilemmas: DilemmaForQuiz[] = dilemmas.map((d): DilemmaForQuiz => { // Update mapping return type
      const choicesForQuiz: DilemmaQuizChoice[] = [];

      // Type guard for details and choices array
      if (hasDilemmaDetails(d.details)) {
        // Now TypeScript knows d.details matches PrismaDilemmaDetails
        d.details.choices.forEach((c) => {
          // Validate structure and types before adding
          // Check individual properties are strings
          if (
            c &&
            typeof c === 'object' && // Ensure c is an object before accessing properties
            typeof c.option === 'string' &&
            typeof c.text === 'string'
          ) {
            choicesForQuiz.push({
              option: c.option,
              text: c.text,
              // Score is optional and kept as string if present
              score: typeof c.score === 'string' ? c.score : undefined,
            });
          }
        });
      }

      // Construct the final DilemmaForQuiz object
      const result: DilemmaForQuiz = {
        id: Number(d.id), // Explicitly convert d.id to number
        code: d.code,
        name: d.name,
        description: d.description,
        // Only include details if choices were successfully parsed
        details: choicesForQuiz.length > 0 ? { choices: choicesForQuiz } : null,
      };
      return result;
    });

    return formattedDilemmas;
  } catch (error) {
    console.error("Error fetching dilemmas:", error);
    return [];
  }
} 

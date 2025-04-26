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
interface DilemmaQuizData {
  id: number; // Prisma ID is a number
  code: string;
  name: string;
  description: string | null;
  details: { // Details object structure
    choices: DilemmaQuizChoice[];
  } | null; // Details can be null
}

export async function fetchDilemmas(): Promise<DilemmaQuizData[]> { // Update return type
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
    const formattedDilemmas: DilemmaQuizData[] = dilemmas.map((d): DilemmaQuizData => { // Update mapping return type
      const choicesForQuiz: DilemmaQuizChoice[] = [];

      // Type guard for details and choices array
      if (
        d.details &&
        typeof d.details === 'object' &&
        'choices' in d.details &&
        Array.isArray((d.details as any).choices) // Use 'any' briefly for type guard
      ) {
        // Iterate over raw choices, assuming structure based on PrismaDilemmaChoice logic
        ((d.details as any).choices).forEach((c: any) => { // Use 'any' for raw choice iteration
          // Validate structure and types before adding
          if (c && typeof c.option === 'string' && typeof c.text === 'string') {
            choicesForQuiz.push({
              option: c.option,
              text: c.text,
              // Score is optional and kept as string if present
              score: typeof c.score === 'string' ? c.score : undefined,
            });
          }
        });
      }

      // Construct the final DilemmaQuizData object
      const result: DilemmaQuizData = {
        id: d.id, // Keep as number
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

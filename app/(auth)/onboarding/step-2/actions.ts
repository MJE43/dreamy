'use server';

import { PrismaClient, RefType } from '@/generated/prisma'; // Use correct import path

const prisma = new PrismaClient();

// Interface for the data structure expected within the raw JSON 'details.choices' field
interface PrismaDilemmaChoice {
  option?: unknown;
  text?: unknown;
  score?: unknown;
}

// Define the specific structure for choices within DilemmaForQuiz
type DilemmaQuizChoice = {
  option: string;
  text: string;
  score?: string;
};

// Interface for the formatted dilemma data returned by the action
export interface DilemmaForQuiz {
  id: string;
  code: string;
  name: string;
  description: string;
  details?: {
    choices?: DilemmaQuizChoice[];
  } | null;
}

export async function fetchDilemmas(): Promise<DilemmaForQuiz[]> {
  try {
    const dilemmas = await prisma.spiralReference.findMany({
      where: { type: RefType.DILEMMA },
      take: 10,
      // Optionally add randomness later: orderBy: { /* Need a way to order randomly if desired */ }
      // For now, order by code for predictability
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        details: true, // Select the Json field
      },
    });

    // Process the details field (JsonValue | null) safely
    const formattedDilemmas = dilemmas.map((d): DilemmaForQuiz => {
      // Define the type for the choices array we are building for the final output
      const choicesForQuiz: DilemmaQuizChoice[] = [];

      // Type guard to check if details is an object and has choices array
      if (
        d.details &&
        typeof d.details === 'object' &&
        'choices' in d.details &&
        Array.isArray(d.details.choices)
      ) {
        // Iterate over raw choices, asserting the expected structure from JSON
        (d.details.choices as PrismaDilemmaChoice[]).forEach(c => {
          // Validate structure and types before adding to the formatted array
          if (typeof c.option === 'string' && typeof c.text === 'string') {
            choicesForQuiz.push({
              option: c.option,
              text: c.text,
              score: typeof c.score === 'string' ? c.score : undefined,
            });
          }
        });
      }

      // Explicitly return type DilemmaForQuiz
      const result: DilemmaForQuiz = {
        id: d.id,
        code: d.code,
        name: d.name,
        description: d.description,
        details: choicesForQuiz.length > 0 ? { choices: choicesForQuiz } : null,
      };
      return result;
    });

    return formattedDilemmas;
  } catch (error) {
    console.error("Error fetching dilemmas:", error);
    // In a real app, handle this more gracefully (e.g., throw specific error)
    return [];
  }
} 

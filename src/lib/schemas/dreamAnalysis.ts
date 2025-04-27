// src/lib/schemas/dreamAnalysis.ts
// Import only necessary types
// import { Schema, SchemaType } from "@google/generative-ai"; REMOVED
import * as z from 'zod'; // Add Zod import

// Define the structure using TypeScript interfaces/types for use within the application
export interface KeySymbol {
  symbol: string;
  interpretation: string;
  relevance?: 'high' | 'medium' | 'low';
}

export interface Archetype {
  archetype: string;
  explanation: string;
}

export interface EmotionalTheme {
  theme: string;
  explanation: string;
  intensity?: 'high' | 'medium' | 'low';
}

export interface NarrativeAnalysis {
  setting?: string;
  conflict?: string;
  resolution?: string;
}

export interface PersonalConnection {
  area: string;
  insight: string;
}

export interface PatternRecognition {
    recurringSymbols?: string[];
    evolutionNotes?: string;
}

export interface PerspectiveAnalysis {
    jungian?: string;
    freudian?: string;
    existential?: string;
}

export interface StructuredDreamAnalysis {
  summary: string;
  keySymbols: KeySymbol[];
  archetypes: Archetype[];
  emotionalThemes: EmotionalTheme[];
  narrativeAnalysis?: NarrativeAnalysis;
  personalConnections?: PersonalConnection[];
  guidedReflection: string[];
  patternRecognition?: PatternRecognition;
  analysis?: PerspectiveAnalysis;
}

// --- Zod Schema Definition --- 
// Sub-schemas for nested objects
const keySymbolSchema = z.object({
  symbol: z.string().describe("The symbol from the dream"),
  interpretation: z.string().describe("Psychological meaning of the symbol"),
  relevance: z.enum(['high', 'medium', 'low']).optional().describe("How significant this symbol appears to be")
});

const archetypeSchema = z.object({
  archetype: z.string().describe("Name of the archetype"),
  explanation: z.string().describe("How this archetype manifests in the dream")
});

const emotionalThemeSchema = z.object({
  theme: z.string().describe("The emotional theme"),
  explanation: z.string().describe("How this theme appears in the dream"),
  intensity: z.enum(['high', 'medium', 'low']).optional().describe("Relative strength of this emotional theme")
});

const narrativeAnalysisSchema = z.object({
  setting: z.string().optional().describe("Analysis of the dream environment"),
  conflict: z.string().optional().describe("Central tension or challenge in the dream"),
  resolution: z.string().optional().describe("How the dream concluded or attempted to resolve")
}).optional();

const personalConnectionSchema = z.object({
  area: z.string().describe("Life area (relationships, work, etc.)"),
  insight: z.string().describe("Potential meaning or reflection")
});

const patternRecognitionSchema = z.object({
    recurringSymbols: z.array(z.string()).optional(),
    evolutionNotes: z.string().optional().describe("How themes have evolved over time")
}).optional();

const perspectiveAnalysisSchema = z.object({
    jungian: z.string().optional().describe("Jungian interpretation focusing on collective unconscious"),
    freudian: z.string().optional().describe("Freudian interpretation focusing on wish fulfillment/repression"),
    existential: z.string().optional().describe("Existential interpretation focusing on meaning and choices")
}).optional();

// Main Zod schema mirroring StructuredDreamAnalysis
export const structuredDreamAnalysisZodSchema = z.object({
  summary: z.string().describe("Brief overall interpretation of the dream (2-3 sentences)"),
  keySymbols: z.array(keySymbolSchema).describe("Important symbols identified in the dream"),
  archetypes: z.array(archetypeSchema).describe("Jungian archetypes present in the dream"),
  emotionalThemes: z.array(emotionalThemeSchema).describe("Emotional patterns and themes"),
  narrativeAnalysis: narrativeAnalysisSchema.describe("Analysis of the dream's story structure"),
  personalConnections: z.array(personalConnectionSchema).optional().describe("Potential connections to the dreamer's waking life"),
  guidedReflection: z.array(z.string()).describe("Questions to help the dreamer explore meaning"),
  patternRecognition: patternRecognitionSchema.describe("Connections to previous dreams (if applicable)"),
  analysis: perspectiveAnalysisSchema.describe("Analysis from different psychological perspectives")
});

// Define and export the schema structure directly for use in generationConfig.responseSchema
// Type it as Schema for compatibility
// export const dreamAnalysisSchema: Schema = { // REMOVED type annotation
export const dreamAnalysisSchema = { // Keep the schema object itself, just remove the type
  type: 'OBJECT', // Replace SchemaType.OBJECT with string literal
  required: ["summary", "keySymbols", "archetypes", "emotionalThemes", "guidedReflection"],
  properties: {
    summary: {
      type: 'STRING', // Replace SchemaType.STRING with string literal
      description: "Brief overall interpretation of the dream (2-3 sentences)"
    },
    keySymbols: {
      type: 'ARRAY', // Replace SchemaType.ARRAY with string literal
      description: "Important symbols identified in the dream",
      items: {
        type: 'OBJECT', // Replace SchemaType.OBJECT with string literal
        required: ["symbol", "interpretation"],
        properties: {
          symbol: { type: 'STRING', description: "The symbol from the dream" }, // Replace SchemaType.STRING
          interpretation: { type: 'STRING', description: "Psychological meaning of the symbol" }, // Replace SchemaType.STRING
          relevance: { type: 'STRING', format: "enum", enum: ["high", "medium", "low"], description: "How significant this symbol appears to be" } // Replace SchemaType.STRING
        }
      }
    },
    archetypes: {
      type: 'ARRAY', // Replace SchemaType.ARRAY
      description: "Jungian archetypes present in the dream",
      items: {
        type: 'OBJECT', // Replace SchemaType.OBJECT with string literal
        required: ["archetype", "explanation"],
        properties: {
          archetype: { type: 'STRING', description: "Name of the archetype" }, // Replace SchemaType.STRING
          explanation: { type: 'STRING', description: "How this archetype manifests in the dream" } // Replace SchemaType.STRING
        }
      }
    },
    emotionalThemes: {
      type: 'ARRAY', // Replace SchemaType.ARRAY
      description: "Emotional patterns and themes",
      items: {
        type: 'OBJECT', // Replace SchemaType.OBJECT
        required: ["theme", "explanation"],
        properties: {
          theme: { type: 'STRING', description: "The emotional theme" }, // Replace SchemaType.STRING
          explanation: { type: 'STRING', description: "How this theme appears in the dream" }, // Replace SchemaType.STRING
          intensity: { type: 'STRING', format: "enum", enum: ["high", "medium", "low"], description: "Relative strength of this emotional theme" } // Replace SchemaType.STRING
        }
      }
    },
    narrativeAnalysis: {
      type: 'OBJECT', // Replace SchemaType.OBJECT
      description: "Analysis of the dream's story structure",
      nullable: true, 
      properties: {
        setting: { type: 'STRING', description: "Analysis of the dream environment", nullable: true }, // Replace SchemaType.STRING
        conflict: { type: 'STRING', description: "Central tension or challenge in the dream", nullable: true }, // Replace SchemaType.STRING
        resolution: { type: 'STRING', description: "How the dream concluded or attempted to resolve", nullable: true } // Replace SchemaType.STRING
      }
    },
    personalConnections: {
      type: 'ARRAY', // Replace SchemaType.ARRAY
      description: "Potential connections to the dreamer's waking life",
      nullable: true,
      items: {
        type: 'OBJECT', // Replace SchemaType.OBJECT
        required: ["area", "insight"],
        properties: {
          area: { type: 'STRING', description: "Life area (relationships, work, etc.)" }, // Replace SchemaType.STRING
          insight: { type: 'STRING', description: "Potential meaning or reflection" } // Replace SchemaType.STRING
        }
      }
    },
    guidedReflection: {
      type: 'ARRAY', // Replace SchemaType.ARRAY
      description: "Questions to help the dreamer explore meaning",
      items: {
        type: 'STRING' // Replace SchemaType.STRING
      }
    },
    patternRecognition: {
      type: 'OBJECT', // Replace SchemaType.OBJECT
      description: "Connections to previous dreams (if applicable)",
      nullable: true,
      properties: {
        recurringSymbols: { type: 'ARRAY', items: { type: 'STRING' }, nullable: true }, // Replace SchemaType.ARRAY, SchemaType.STRING
        evolutionNotes: { type: 'STRING', description: "How themes have evolved over time", nullable: true } // Replace SchemaType.STRING
      }
    },
    analysis: {
      type: 'OBJECT', // Replace SchemaType.OBJECT
      description: "Analysis from different psychological perspectives",
      nullable: true,
      properties: {
        jungian: { type: 'STRING', description: "Jungian interpretation focusing on collective unconscious", nullable: true }, // Replace SchemaType.STRING
        freudian: { type: 'STRING', description: "Freudian interpretation focusing on wish fulfillment/repression", nullable: true }, // Replace SchemaType.STRING
        existential: { type: 'STRING', description: "Existential interpretation focusing on meaning and choices", nullable: true } // Replace SchemaType.STRING
      }
    }
  }
};

// Remove the separate FunctionDeclarationSchema definition as it's not needed here
// export const dreamAnalysisFunctionDeclaration: FunctionDeclarationSchema = { ... };

// You might want a Zod schema for runtime validation as well
// import * as z from 'zod';
// export const structuredDreamAnalysisZodSchema = z.object({ ... define zod schema here ... });
// This can be added later if needed for stricter validation. 

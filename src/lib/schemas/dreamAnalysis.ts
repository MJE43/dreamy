// src/lib/schemas/dreamAnalysis.ts
// Import only necessary types
import { Schema, SchemaType } from "@google/generative-ai";

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

// Define and export the schema structure directly for use in generationConfig.responseSchema
// Type it as Schema for compatibility
export const dreamAnalysisSchema: Schema = {
  type: SchemaType.OBJECT, 
  required: ["summary", "keySymbols", "archetypes", "emotionalThemes", "guidedReflection"],
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "Brief overall interpretation of the dream (2-3 sentences)"
    },
    keySymbols: {
      type: SchemaType.ARRAY,
      description: "Important symbols identified in the dream",
      items: {
        type: SchemaType.OBJECT,
        required: ["symbol", "interpretation"],
        properties: {
          symbol: { type: SchemaType.STRING, description: "The symbol from the dream" },
          interpretation: { type: SchemaType.STRING, description: "Psychological meaning of the symbol" },
          relevance: { type: SchemaType.STRING, format: "enum", enum: ["high", "medium", "low"], description: "How significant this symbol appears to be" }
        }
      }
    },
    archetypes: {
      type: SchemaType.ARRAY,
      description: "Jungian archetypes present in the dream",
      items: {
        type: SchemaType.OBJECT,
        required: ["archetype", "explanation"],
        properties: {
          archetype: { type: SchemaType.STRING, description: "Name of the archetype" },
          explanation: { type: SchemaType.STRING, description: "How this archetype manifests in the dream" }
        }
      }
    },
    emotionalThemes: {
      type: SchemaType.ARRAY,
      description: "Emotional patterns and themes",
      items: {
        type: SchemaType.OBJECT,
        required: ["theme", "explanation"],
        properties: {
          theme: { type: SchemaType.STRING, description: "The emotional theme" },
          explanation: { type: SchemaType.STRING, description: "How this theme appears in the dream" },
          intensity: { type: SchemaType.STRING, format: "enum", enum: ["high", "medium", "low"], description: "Relative strength of this emotional theme" }
        }
      }
    },
    narrativeAnalysis: {
      type: SchemaType.OBJECT,
      description: "Analysis of the dream's story structure",
      nullable: true, 
      properties: {
        setting: { type: SchemaType.STRING, description: "Analysis of the dream environment", nullable: true },
        conflict: { type: SchemaType.STRING, description: "Central tension or challenge in the dream", nullable: true },
        resolution: { type: SchemaType.STRING, description: "How the dream concluded or attempted to resolve", nullable: true }
      }
    },
    personalConnections: {
      type: SchemaType.ARRAY,
      description: "Potential connections to the dreamer's waking life",
      nullable: true,
      items: {
        type: SchemaType.OBJECT,
        required: ["area", "insight"],
        properties: {
          area: { type: SchemaType.STRING, description: "Life area (relationships, work, etc.)" },
          insight: { type: SchemaType.STRING, description: "Potential meaning or reflection" }
        }
      }
    },
    guidedReflection: {
      type: SchemaType.ARRAY,
      description: "Questions to help the dreamer explore meaning",
      items: {
        type: SchemaType.STRING
      }
    },
    patternRecognition: {
      type: SchemaType.OBJECT,
      description: "Connections to previous dreams (if applicable)",
      nullable: true,
      properties: {
        recurringSymbols: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, nullable: true },
        evolutionNotes: { type: SchemaType.STRING, description: "How themes have evolved over time", nullable: true }
      }
    },
    analysis: {
      type: SchemaType.OBJECT,
      description: "Analysis from different psychological perspectives",
      nullable: true,
      properties: {
        jungian: { type: SchemaType.STRING, description: "Jungian interpretation focusing on collective unconscious", nullable: true },
        freudian: { type: SchemaType.STRING, description: "Freudian interpretation focusing on wish fulfillment/repression", nullable: true },
        existential: { type: SchemaType.STRING, description: "Existential interpretation focusing on meaning and choices", nullable: true }
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

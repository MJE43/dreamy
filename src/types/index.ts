// src/types/index.ts

// Type for individual dream entries, including analysis
export type RecentDream = {
  id: string;
  createdAt: Date;
  description: string;
  mood: number;
  tags: string[] | null;
  analysis: {
    content: string;
  } | null;
};

// Type for data points used in the mood chart
export type MoodData = { 
  date: string; 
  mood: number 
};

// Type for data points used in the motif cloud
export type MotifData = { 
  tag: string; 
  count: number 
};

// You might also want to export Session type from next-auth here
// export type { Session } from 'next-auth'; 

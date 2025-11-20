export type MoodType = 'amazing' | 'good' | 'okay' | 'difficult' | 'challenging';

export interface JournalEntry {
  id: string;
  date: string;
  mood: MoodType;
  highlights: string;
  challenges: string;
  gratitude: string;
  freeText: string;
  tags: string[];
  emoji?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WeeklyStats {
  totalEntries: number;
  moodDistribution: Record<MoodType, number>;
  commonTags: { tag: string; count: number }[];
  streak: number;
  weekStart: string;
  weekEnd: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

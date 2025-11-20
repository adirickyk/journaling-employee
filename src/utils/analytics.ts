import { JournalEntry, MoodType, WeeklyStats, Achievement } from '../types/journal';

export const analyticsUtils = {
  calculateStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  },

  getWeeklyStats(entries: JournalEntry[]): WeeklyStats {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    const moodDistribution: Record<MoodType, number> = {
      amazing: 0,
      good: 0,
      okay: 0,
      difficult: 0,
      challenging: 0
    };

    const tagCounts: Record<string, number> = {};

    weekEntries.forEach(entry => {
      moodDistribution[entry.mood]++;
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const commonTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEntries: weekEntries.length,
      moodDistribution,
      commonTags,
      streak: this.calculateStreak(entries),
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    };
  },

  getAchievements(entries: JournalEntry[]): Achievement[] {
    const achievements: Achievement[] = [];
    const streak = this.calculateStreak(entries);

    const achievementDefinitions = [
      { id: 'first_entry', title: 'First Step', description: 'Wrote your first journal entry', icon: '✨', threshold: 1 },
      { id: 'week_streak', title: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '🔥', threshold: 7 },
      { id: 'month_streak', title: 'Month Master', description: 'Maintained a 30-day streak', icon: '💪', threshold: 30 },
      { id: 'entries_10', title: 'Getting Started', description: 'Wrote 10 journal entries', icon: '📝', threshold: 10 },
      { id: 'entries_50', title: 'Dedicated Writer', description: 'Wrote 50 journal entries', icon: '📚', threshold: 50 },
      { id: 'entries_100', title: 'Journaling Pro', description: 'Wrote 100 journal entries', icon: '🏆', threshold: 100 }
    ];

    achievementDefinitions.forEach(def => {
      let unlocked = false;

      if (def.id.includes('streak')) {
        unlocked = streak >= def.threshold;
      } else if (def.id.includes('entries')) {
        unlocked = entries.length >= def.threshold;
      }

      if (unlocked) {
        achievements.push({
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          unlockedAt: Date.now()
        });
      }
    });

    return achievements;
  },

  getMoodTrend(entries: JournalEntry[], days: number = 7): { date: string; mood: number }[] {
    const moodValues: Record<MoodType, number> = {
      amazing: 5,
      good: 4,
      okay: 3,
      difficult: 2,
      challenging: 1
    };

    const today = new Date();
    const trend = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateStr = date.toISOString().split('T')[0];
      const dayEntries = entries.filter(e => e.date.startsWith(dateStr));

      if (dayEntries.length > 0) {
        const avgMood = dayEntries.reduce((sum, e) => sum + moodValues[e.mood], 0) / dayEntries.length;
        trend.push({ date: dateStr, mood: avgMood });
      } else {
        trend.push({ date: dateStr, mood: 0 });
      }
    }

    return trend;
  }
};

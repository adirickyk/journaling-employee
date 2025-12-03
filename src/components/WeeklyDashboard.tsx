import { useState } from "react"; // Added for state management
import {
  TrendingUp,
  Award,
  Flame,
  Target,
  Download,
  Upload,
  Loader2, // Added for loading spinner
} from "lucide-react";
import { JournalEntry, MoodType } from "../types/journal";
import { analyticsUtils } from "../utils/analytics";
import { storageUtils } from "../utils/storage";

interface WeeklyDashboardProps {
  entries: JournalEntry[];
}

interface AISummaryResponse {
  weekly_summary: string;
  emotional_patterns: string[];
  weekly_themes: string[];
  limiting_beliefs: string[];
  strengths_and_progress: string[];
  coaching_insights: string[];
  reflection_questions: string[];
  next_week_focus: string[];
}
const moodEmojis: Record<MoodType, string> = {
  amazing: "😄",
  good: "🙂",
  okay: "😐",
  difficult: "😟",
  challenging: "😢",
};

const moodColors: Record<MoodType, string> = {
  amazing: "bg-green-500",
  good: "bg-blue-500",
  okay: "bg-yellow-500",
  difficult: "bg-orange-500",
  challenging: "bg-red-500",
};

export default function WeeklyDashboard({ entries }: WeeklyDashboardProps) {
  const weeklyStats = analyticsUtils.getWeeklyStats(entries);
  const achievements = analyticsUtils.getAchievements(entries);
  const moodTrend = analyticsUtils.getMoodTrend(entries, 7);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false); // For loading state
  const [summaryError, setSummaryError] = useState<string | null>(null); // For error messages
  const [aiSummary, setAiSummary] = useState<AISummaryResponse | null>(null); // For storing API response

  const handleExport = () => {
    const data = storageUtils.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    setSummaryError(null);
    setAiSummary(null);

    try {
      // Step 1: Fetch data from localStorage
      const journalData = localStorage.getItem("journal_entries");
      if (!journalData) {
        throw new Error(
          "No journal entries found in localStorage. Please add some reflections first."
        );
      }

      let parsedData: JournalEntry[];
      try {
        parsedData = JSON.parse(journalData);
      } catch (parseError) {
        throw new Error("Invalid journal data format in localStorage.");
      }

      // Step 2: Post to the API endpoint
      // https://homepage.spartatech.id/page/sZhPlR0jBx9CFDU8dlFNN7Bp5kaY9H
      const response = await fetch("/api/summary", {
        // Change to your local endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData), // Send the journal entries as JSON
      });

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}: ${response.statusText}`
        );
      }

      // Step 3: Parse and validate the response
      const data: AISummaryResponse = await response.json();
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format from API.");
      }

      // Step 4: Store the response for display
      setAiSummary(data);
    } catch (error) {
      console.error("Error generating AI summary:", error);
      setSummaryError(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string;
            storageUtils.importData(data);
            alert("Journal data imported successfully!");
            window.location.reload();
          } catch (error) {
            alert("Failed to import data. Please check the file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const totalMoodEntries = Object.values(weeklyStats.moodDistribution).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Your Weekly Journey</h2>
        <p className="text-blue-100">
          Keep up the amazing work! Every entry brings you closer to your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {weeklyStats.totalEntries}
          </div>
          <div className="text-sm text-gray-600">Entries This Week</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Flame className="text-orange-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {weeklyStats.streak}
          </div>
          <div className="text-sm text-gray-600">Day Streak</div>
          {weeklyStats.streak > 0 && (
            <div className="mt-2 text-xs text-orange-600 font-semibold">
              Keep it going! 🔥
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {achievements.length}
          </div>
          <div className="text-sm text-gray-600">Achievements Unlocked</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {entries.length}
          </div>
          <div className="text-sm text-gray-600">Total Entries</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span> Mood Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(weeklyStats.moodDistribution).map(
              ([mood, count]) => {
                const percentage =
                  totalMoodEntries > 0 ? (count / totalMoodEntries) * 100 : 0;
                return (
                  <div key={mood}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {moodEmojis[mood as MoodType]}
                        </span>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {mood}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {count} entries
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${
                          moodColors[mood as MoodType]
                        } h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📈</span> 7-Day Mood Trend
          </h3>
          <div className="space-y-2">
            {moodTrend.map(({ date, mood }) => {
              const dateObj = new Date(date);
              const dayName = dateObj.toLocaleDateString("en-US", {
                weekday: "short",
              });
              const isToday =
                dateObj.toDateString() === new Date().toDateString();
              const moodPercent = (mood / 5) * 100;

              return (
                <div key={date} className="flex items-center gap-3">
                  <div
                    className={`text-sm font-medium w-12 ${
                      isToday ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {dayName}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    {mood > 0 && (
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${moodPercent}%` }}
                      >
                        <span className="text-xs text-white font-semibold">
                          {mood.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Scale: 1 (Challenging) to 5 (Amazing)
          </div>
        </div>
      </div>

      {weeklyStats.commonTags.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🏷️</span> Most Common Tags This Week
          </h3>
          <div className="flex flex-wrap gap-3">
            {weeklyStats.commonTags.map(({ tag, count }) => (
              <div
                key={tag}
                className="px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-full flex items-center gap-2"
              >
                <span className="font-semibold text-blue-800">{tag}</span>
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🏆</span> Your Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4 flex items-start gap-3"
              >
                <div className="text-4xl">{achievement.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-800">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>💾</span> Data Management
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Download size={20} />
            Export Journal Data
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <Upload size={20} />
            Import Journal Data
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Export your journal entries as a JSON backup, or import previously
          saved data.
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg shadow-md p-6 border-2 border-purple-300">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span>🤖</span> AI Weekly Analysis
        </h3>
        <p className="text-gray-700 mb-4">
          Get personalized insights and patterns from your weekly journal
          entries with AI-powered analysis.
        </p>
        <button
          onClick={handleGenerateSummary}
          disabled={isLoadingSummary}
          className={`px-6 py-3 font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2 ${
            isLoadingSummary
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {isLoadingSummary && <Loader2 size={20} className="animate-spin" />}
          {isLoadingSummary ? "Generating..." : "Generate AI Summary"}
        </button>
        {summaryError && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            Error: {summaryError}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-600">
          This feature analyzes your journal entries for personalized insights.
        </p>

        {/* Display API Response */}
        {aiSummary && (
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-bold text-gray-800">
              AI Summary Results
            </h4>

            {/* Weekly Summary */}
            {aiSummary.weekly_summary && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Weekly Summary
                </h5>
                <p className="text-gray-700">{aiSummary.weekly_summary}</p>
              </div>
            )}

            {/* Emotional Patterns */}
            {aiSummary.emotional_patterns.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Emotional Patterns
                </h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {aiSummary.emotional_patterns.map((pattern, index) => (
                    <li key={index}>{pattern}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weekly Themes */}
            {aiSummary.weekly_themes.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Weekly Themes
                </h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {aiSummary.weekly_themes.map((theme, index) => (
                    <li key={index}>{theme}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Limiting Beliefs */}
            {aiSummary.limiting_beliefs.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Limiting Beliefs
                </h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {aiSummary.limiting_beliefs.map((belief, index) => (
                    <li key={index}>{belief}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths and Progress */}
            {aiSummary.strengths_and_progress.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Strengths and Progress
                </h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {aiSummary.strengths_and_progress.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Coaching Insights */}
            {aiSummary.coaching_insights.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Coaching Insights
                </h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {aiSummary.coaching_insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reflection Questions */}
            {aiSummary.reflection_questions.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Reflection Questions
                </h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {aiSummary.reflection_questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Week Focus */}
            {aiSummary.next_week_focus.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Next Week Focus
                </h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {aiSummary.next_week_focus.map((focus, index) => (
                    <li key={index}>{focus}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { TrendingUp, Award, Flame, Target, Download, Upload } from 'lucide-react';
import { JournalEntry, MoodType } from '../types/journal';
import { analyticsUtils } from '../utils/analytics';
import { storageUtils } from '../utils/storage';

interface WeeklyDashboardProps {
  entries: JournalEntry[];
}

const moodEmojis: Record<MoodType, string> = {
  amazing: '😄',
  good: '🙂',
  okay: '😐',
  difficult: '😟',
  challenging: '😢'
};

const moodColors: Record<MoodType, string> = {
  amazing: 'bg-green-500',
  good: 'bg-blue-500',
  okay: 'bg-yellow-500',
  difficult: 'bg-orange-500',
  challenging: 'bg-red-500'
};

export default function WeeklyDashboard({ entries }: WeeklyDashboardProps) {
  const weeklyStats = analyticsUtils.getWeeklyStats(entries);
  const achievements = analyticsUtils.getAchievements(entries);
  const moodTrend = analyticsUtils.getMoodTrend(entries, 7);

  const handleExport = () => {
    const data = storageUtils.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string;
            storageUtils.importData(data);
            alert('Journal data imported successfully!');
            window.location.reload();
          } catch (error) {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const totalMoodEntries = Object.values(weeklyStats.moodDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Your Weekly Journey</h2>
        <p className="text-blue-100">Keep up the amazing work! Every entry brings you closer to your goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{weeklyStats.totalEntries}</div>
          <div className="text-sm text-gray-600">Entries This Week</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Flame className="text-orange-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{weeklyStats.streak}</div>
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
          <div className="text-3xl font-bold text-gray-800">{achievements.length}</div>
          <div className="text-sm text-gray-600">Achievements Unlocked</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{entries.length}</div>
          <div className="text-sm text-gray-600">Total Entries</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span> Mood Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(weeklyStats.moodDistribution).map(([mood, count]) => {
              const percentage = totalMoodEntries > 0 ? (count / totalMoodEntries) * 100 : 0;
              return (
                <div key={mood}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{moodEmojis[mood as MoodType]}</span>
                      <span className="text-sm font-medium text-gray-700 capitalize">{mood}</span>
                    </div>
                    <span className="text-sm text-gray-600">{count} entries</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${moodColors[mood as MoodType]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📈</span> 7-Day Mood Trend
          </h3>
          <div className="space-y-2">
            {moodTrend.map(({ date, mood }) => {
              const dateObj = new Date(date);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const isToday = dateObj.toDateString() === new Date().toDateString();
              const moodPercent = (mood / 5) * 100;

              return (
                <div key={date} className="flex items-center gap-3">
                  <div className={`text-sm font-medium w-12 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
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
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4 flex items-start gap-3"
              >
                <div className="text-4xl">{achievement.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-800">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
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
          Export your journal entries as a JSON backup, or import previously saved data.
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg shadow-md p-6 border-2 border-purple-300">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span>🤖</span> AI Weekly Analysis (Coming Soon)
        </h3>
        <p className="text-gray-700 mb-4">
          Get personalized insights and patterns from your weekly journal entries with AI-powered analysis.
        </p>
        <button
          disabled
          className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed"
        >
          Generate AI Summary
        </button>
        <p className="mt-2 text-xs text-gray-600">
          This feature will be available in a future update.
        </p>
      </div>
    </div>
  );
}

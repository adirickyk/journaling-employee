import { useState } from "react";
import {
  Calendar,
  Tag,
  Edit2,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Heart,
} from "lucide-react";
import { JournalEntry, MoodType } from "../types/journal";
import { storageUtils } from "../utils/storage";

interface JournalListProps {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onRefresh: () => void;
}

const moodEmojis: Record<MoodType, string> = {
  amazing: "✨",
  good: "😊",
  okay: "😌",
  difficult: "😔",
  challenging: "💙",
};

const moodColors: Record<MoodType, string> = {
  amazing:
    "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-300",
  good: "bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 border-cyan-300",
  okay: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300",
  difficult:
    "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-300",
  challenging:
    "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-indigo-300",
};

export default function JournalList({
  entries,
  onEdit,
  onRefresh,
}: JournalListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  const allTags = Array.from(
    new Set(entries.flatMap((entry) => entry.tags))
  ).sort();

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.highlights.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.challenges.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.gratitude.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.freeText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = !selectedTag || entry.tags.includes(selectedTag);
    const matchesMood = !selectedMood || entry.mood === selectedMood;

    return matchesSearch && matchesTag && matchesMood;
  });

  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this reflection? This action cannot be undone."
      )
    ) {
      storageUtils.deleteEntry(id);
      onRefresh();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
    setSelectedMood(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-emerald-800">
            Find Your Reflections
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your reflections..."
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-emerald-100 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all text-emerald-900 placeholder-emerald-400"
            />
          </div>

          {/* Mood Filter */}
          <select
            value={selectedMood || ""}
            onChange={(e) =>
              setSelectedMood((e.target.value as MoodType) || null)
            }
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-emerald-100 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all text-emerald-900"
          >
            <option value="">All Moods 🌈</option>
            <option value="amazing">✨ Amazing</option>
            <option value="good">😊 Good</option>
            <option value="okay">😌 Okay</option>
            <option value="difficult">😔 Difficult</option>
            <option value="challenging">💙 Challenging</option>
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag || ""}
            onChange={(e) => setSelectedTag(e.target.value || null)}
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-emerald-100 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all text-emerald-900"
          >
            <option value="">All Tags 🏷️</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        {(searchQuery || selectedTag || selectedMood) && (
          <div className="flex items-center justify-between mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="text-sm text-emerald-700 font-medium">
              Showing {filteredEntries.length} of {entries.length} reflections
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-emerald-600 hover:text-emerald-800 font-medium underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {sortedEntries.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 p-12 text-center">
            <div className="text-8xl mb-6">🌱</div>
            <h3 className="text-2xl font-bold text-emerald-800 mb-3">
              {entries.length === 0
                ? "Your Wellness Journey Awaits"
                : "No Reflections Found"}
            </h3>
            <p className="text-emerald-600 text-lg max-w-md mx-auto">
              {entries.length === 0
                ? "Begin your mindfulness journey by creating your first reflection. Every step counts!"
                : "Try adjusting your filters to discover more of your wellness reflections."}
            </p>
          </div>
        ) : (
          sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-emerald-100/50 transition-all duration-300 hover:scale-[1.01] overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`px-4 py-2 rounded-full border-2 ${
                        moodColors[entry.mood]
                      } shadow-sm`}
                    >
                      <span className="text-xl mr-2">
                        {moodEmojis[entry.mood]}
                      </span>
                      <span className="font-bold capitalize">{entry.mood}</span>
                    </div>
                    {entry.emoji && (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-2 rounded-full border border-emerald-100">
                        <span className="text-2xl">{entry.emoji}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(entry)}
                      className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 hover:scale-105 group"
                      title="Edit Reflection"
                    >
                      <Edit2
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 hover:scale-105 group"
                      title="Delete Reflection"
                    >
                      <Trash2
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </button>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 rounded-xl border border-emerald-100 w-fit">
                  <Calendar size={16} />
                  <span className="font-medium">{formatDate(entry.date)}</span>
                </div>

                {/* Content Sections */}
                <div className="space-y-4">
                  {entry.highlights && (
                    <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-xl p-4 border border-emerald-100/50">
                      <h4 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                        <span>✨</span>
                        Beautiful Moments
                      </h4>
                      <p className="text-emerald-900 leading-relaxed">
                        {entry.highlights}
                      </p>
                    </div>
                  )}

                  {entry.challenges && (
                    <div className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-xl p-4 border border-orange-100/50">
                      <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                        <span>🌱</span>
                        Growth Through Challenges
                      </h4>
                      <p className="text-orange-900 leading-relaxed">
                        {entry.challenges}
                      </p>
                    </div>
                  )}

                  {entry.gratitude && (
                    <div className="bg-gradient-to-r from-rose-50/50 to-pink-50/50 rounded-xl p-4 border border-rose-100/50">
                      <h4 className="text-sm font-bold text-rose-800 mb-2 flex items-center gap-2">
                        <span>🙏</span>
                        Heart Full of Gratitude
                      </h4>
                      <p className="text-rose-900 leading-relaxed">
                        {entry.gratitude}
                      </p>
                    </div>
                  )}

                  {entry.freeText && (
                    <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl p-4 border border-indigo-100/50">
                      <h4 className="text-sm font-bold text-indigo-800 mb-2 flex items-center gap-2">
                        <span>💭</span>
                        Free Flow of Thoughts
                      </h4>
                      <p className="text-indigo-900 leading-relaxed">
                        {entry.freeText}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Tag size={16} />
                      <span className="text-sm font-medium">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-full text-sm font-medium border border-emerald-200 hover:shadow-sm transition-shadow"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics */}
      {entries.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-emerald-800">
              Your Wellness Journey
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <div className="text-2xl font-bold text-emerald-700">
                {entries.length}
              </div>
              <div className="text-sm text-emerald-600 font-medium">
                Total Reflections
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
              <div className="text-2xl font-bold text-rose-700">
                {allTags.length}
              </div>
              <div className="text-sm text-rose-600 font-medium">
                Unique Tags
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="text-2xl font-bold text-indigo-700">
                {Math.ceil(
                  (Date.now() -
                    new Date(
                      entries[entries.length - 1]?.date || Date.now()
                    ).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </div>
              <div className="text-sm text-indigo-600 font-medium">
                Days of Growth
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

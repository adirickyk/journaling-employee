import { useState } from "react";
import { Plus, X, Sparkles, Heart } from "lucide-react";
import { JournalEntry, MoodType } from "../types/journal";
import { storageUtils } from "../utils/storage";

interface JournalEntryFormProps {
  onSave: () => void;
  onCancel: () => void;
  existingEntry?: JournalEntry;
}

const moods: {
  value: MoodType;
  label: string;
  emoji: string;
  color: string;
  bgGradient: string;
}[] = [
  {
    value: "amazing",
    label: "Amazing",
    emoji: "✨",
    color: "text-emerald-700",
    bgGradient: "bg-gradient-to-br from-emerald-400 to-teal-500",
  },
  {
    value: "good",
    label: "Good",
    emoji: "😊",
    color: "text-cyan-700",
    bgGradient: "bg-gradient-to-br from-cyan-400 to-blue-500",
  },
  {
    value: "okay",
    label: "Okay",
    emoji: "😌",
    color: "text-amber-700",
    bgGradient: "bg-gradient-to-br from-amber-400 to-yellow-500",
  },
  {
    value: "difficult",
    label: "Difficult",
    emoji: "😔",
    color: "text-orange-700",
    bgGradient: "bg-gradient-to-br from-orange-400 to-red-400",
  },
  {
    value: "challenging",
    label: "Challenging",
    emoji: "💙",
    color: "text-indigo-700",
    bgGradient: "bg-gradient-to-br from-indigo-400 to-purple-500",
  },
];

const mindfulPrompts = [
  "What brought you joy today? 🌟",
  "What moment made you feel most at peace? 🕊️",
  "How did you show yourself kindness today? 💚",
  "What are three things your heart feels grateful for? 🙏",
  "What lesson did today teach you about yourself? 🌱",
  "How did you nurture your wellbeing today? 🌸",
  "What challenged you to grow today? 🦋",
];

export default function JournalEntryForm({
  onSave,
  onCancel,
  existingEntry,
}: JournalEntryFormProps) {
  const [mood, setMood] = useState<MoodType>(existingEntry?.mood || "good");
  const [highlights, setHighlights] = useState(existingEntry?.highlights || "");
  const [challenges, setChallenges] = useState(existingEntry?.challenges || "");
  const [gratitude, setGratitude] = useState(existingEntry?.gratitude || "");
  const [freeText, setFreeText] = useState(existingEntry?.freeText || "");
  const [tags, setTags] = useState<string[]>(existingEntry?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(
    existingEntry?.emoji || ""
  );

  const randomPrompt =
    mindfulPrompts[Math.floor(Math.random() * mindfulPrompts.length)];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entry: JournalEntry = {
      id: existingEntry?.id || Date.now().toString(),
      date: existingEntry?.date || new Date().toISOString(),
      mood,
      highlights,
      challenges,
      gratitude,
      freeText,
      tags,
      emoji: selectedEmoji,
      createdAt: existingEntry?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    storageUtils.saveEntry(entry);
    onSave();
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100/50 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="relative">
            <Heart className="w-8 h-8 text-rose-400" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            {existingEntry
              ? "Update Your Reflection"
              : "Create a New Reflection"}
          </h2>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-emerald-700 font-medium text-lg">{randomPrompt}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mood Selection */}
        <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-2xl p-6 border border-emerald-100/50">
          <label className="block text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <span>🌈</span>
            How is your heart feeling today?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {moods.map(({ value, label, emoji, color, bgGradient }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMood(value)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  mood === value
                    ? `${bgGradient} border-transparent text-white shadow-2xl shadow-emerald-200 scale-105`
                    : "border-emerald-200 hover:border-emerald-300 bg-white/80 backdrop-blur-sm hover:shadow-lg"
                }`}
              >
                <div className="text-4xl mb-2 transition-transform group-hover:scale-110">
                  {emoji}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    mood === value ? "text-white" : color
                  }`}
                >
                  {label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-3">
          <label className="block text-lg font-bold text-emerald-800 flex items-center gap-2">
            <span>✨</span>
            Today's Beautiful Moments
          </label>
          <textarea
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all resize-none text-emerald-900 placeholder-emerald-400"
            rows={3}
            placeholder="What made your soul shine today? Share the moments that brought you joy..."
          />
        </div>

        {/* Challenges */}
        <div className="space-y-3">
          <label className="block text-lg font-bold text-emerald-800 flex items-center gap-2">
            <span>🌱</span>
            Growth Through Challenges
          </label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all resize-none text-emerald-900 placeholder-emerald-400"
            rows={3}
            placeholder="What challenged you today? Remember, every challenge is an opportunity to grow stronger..."
          />
        </div>

        {/* Gratitude */}
        <div className="space-y-3">
          <label className="block text-lg font-bold text-emerald-800 flex items-center gap-2">
            <span>🙏</span>
            Heart Full of Gratitude
          </label>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all resize-none text-emerald-900 placeholder-emerald-400"
            rows={3}
            placeholder="What fills your heart with gratitude today? Big or small, every blessing counts..."
          />
        </div>

        {/* Free Thoughts */}
        <div className="space-y-3">
          <label className="block text-lg font-bold text-emerald-800 flex items-center gap-2">
            <span>💭</span>
            Free Flow of Thoughts
          </label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all resize-none text-emerald-900 placeholder-emerald-400"
            rows={4}
            placeholder="Let your thoughts flow freely... What else is on your mind and in your heart?"
          />
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <label className="block text-lg font-bold text-emerald-800 flex items-center gap-2">
            <span>🏷️</span>
            Wellness Tags
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddTag())
              }
              className="flex-1 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all text-emerald-900 placeholder-emerald-400"
              placeholder="Add tags like: self-care, mindfulness, gratitude, growth..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-full text-sm font-medium border border-emerald-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-emerald-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Emojis */}
        <div className="space-y-4">
          <label className="block text-lg font-bold text-emerald-800 flex items-center gap-2">
            <span>🎨</span>
            Express with an Emoji
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              "🌟",
              "💚",
              "🌸",
              "🦋",
              "🌈",
              "🕊️",
              "💎",
              "🌺",
              "🍃",
              "☀️",
              "🌙",
              "⭐",
            ].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() =>
                  setSelectedEmoji(emoji === selectedEmoji ? "" : emoji)
                }
                className={`text-3xl p-4 rounded-2xl border-2 transition-all duration-200 transform hover:scale-110 ${
                  selectedEmoji === emoji
                    ? "border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg scale-110"
                    : "border-emerald-200 hover:border-emerald-300 bg-white/80 backdrop-blur-sm hover:shadow-md"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {existingEntry ? "✨ Update Reflection" : "🌿 Save Reflection"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 border-2 border-emerald-300 text-emerald-700 font-bold text-lg rounded-2xl hover:bg-emerald-50 transition-all duration-200 hover:border-emerald-400"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Footer Message */}
      <div className="mt-8 text-center">
        <p className="text-emerald-600 text-sm font-medium">
          🔒 Your reflections are private and stored securely on your device
        </p>
      </div>
    </div>
  );
}

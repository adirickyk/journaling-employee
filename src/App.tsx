import { useState, useEffect } from "react";
import { Heart, TrendingUp, Plus, Menu, X, Sparkles } from "lucide-react";
import JournalEntryForm from "./components/JournalEntryForm";
import JournalList from "./components/JournalList";
import WeeklyDashboard from "./components/WeeklyDashboard";
import { JournalEntry } from "./types/journal";
import { storageUtils } from "./utils/storage";

type View = "list" | "dashboard" | "new" | "edit";

function App() {
  const [currentView, setCurrentView] = useState<View>("list");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const loadedEntries = storageUtils.getAllEntries();
    setEntries(loadedEntries);
  };

  const handleSaveEntry = () => {
    loadEntries();
    setCurrentView("list");
    setEditingEntry(undefined);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setCurrentView("edit");
  };

  const handleCancelEdit = () => {
    setEditingEntry(undefined);
    setCurrentView("list");
  };

  const handleNewEntry = () => {
    setEditingEntry(undefined);
    setCurrentView("new");
  };

  const navItems = [
    { id: "list" as View, label: "My Reflections", icon: Heart },
    { id: "dashboard" as View, label: "Insights", icon: TrendingUp },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Every small step counts on your wellness journey",
      "Your mental health matters - take time to reflect",
      "Growth happens one day at a time",
      "You are worthy of peace and happiness",
      "Self-care is not selfish, it's essential",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-emerald-100/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="text-3xl">🌿</div>
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Mindful Journal
                </h1>
                <p className="text-xs text-emerald-600/70 hidden sm:block font-medium">
                  Your wellness companion
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                    currentView === item.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 scale-105"
                      : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleNewEntry}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-rose-200 hover:scale-105"
              >
                <Plus size={18} />
                New Entry
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-emerald-100 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    currentView === item.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                      : "text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  handleNewEntry();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:from-rose-600 hover:to-pink-600 transition-all"
              >
                <Plus size={20} />
                New Entry
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section - Only show on list view */}
        {currentView === "list" && (
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-2">
              {getGreeting()}! ✨
            </h2>
            <p className="text-emerald-600 text-lg font-medium mb-4">
              {getMotivationalMessage()}
            </p>
            <div className="flex justify-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-emerald-100">
                <p className="text-emerald-700 text-sm font-medium">
                  {entries.length === 0
                    ? "Begin your mindfulness journey today"
                    : `${entries.length} ${
                        entries.length === 1 ? "reflection" : "reflections"
                      } on your wellness path`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Views */}
        {(currentView === "new" || currentView === "edit") && (
          <div className="max-w-4xl mx-auto">
            <JournalEntryForm
              onSave={handleSaveEntry}
              onCancel={handleCancelEdit}
              existingEntry={editingEntry}
            />
          </div>
        )}

        {/* Journal List View */}
        {currentView === "list" && (
          <JournalList
            entries={entries}
            onEdit={handleEditEntry}
            onRefresh={loadEntries}
          />
        )}

        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-emerald-800 mb-2">
                Your Wellness Insights
              </h2>
              <p className="text-emerald-600">
                Track your journey and celebrate your growth
              </p>
            </div>
            <WeeklyDashboard entries={entries} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/40 backdrop-blur-sm border-t border-emerald-100/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-rose-400" />
              <span className="text-emerald-700 font-medium">
                Your Privacy Matters
              </span>
            </div>
            <p className="text-sm text-emerald-600/80 max-w-md mx-auto">
              All your reflections are stored securely on your device. Your
              wellness journey is private and belongs to you.
            </p>
            <div className="mt-4 flex justify-center gap-4 text-xs text-emerald-500">
              <span>🔒 Secure</span>
              <span>💚 Private</span>
              <span>🌱 Growing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

import { JournalEntry } from '../types/journal';

const STORAGE_KEY = 'journal_entries';

export const storageUtils = {
  getAllEntries(): JournalEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveEntry(entry: JournalEntry): void {
    try {
      const entries = this.getAllEntries();
      const existingIndex = entries.findIndex(e => e.id === entry.id);

      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save journal entry');
    }
  },

  deleteEntry(id: string): void {
    try {
      const entries = this.getAllEntries();
      const filtered = entries.filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      throw new Error('Failed to delete journal entry');
    }
  },

  exportData(): string {
    const entries = this.getAllEntries();
    return JSON.stringify(entries, null, 2);
  },

  importData(jsonData: string): void {
    try {
      const entries = JSON.parse(jsonData);
      if (!Array.isArray(entries)) {
        throw new Error('Invalid data format');
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }
};

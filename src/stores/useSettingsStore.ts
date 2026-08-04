import { create } from 'zustand';
import { storage } from '../services/storage';
import { UserSettings } from '../types/game';

interface SettingsState {
  settings: UserSettings;
  loadSettings: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    themeMode: 'system',
    soundEnabled: true,
    hapticsEnabled: true,
    paperGridTexture: true,
  },

  loadSettings: () => {
    const loaded = storage.getSettings();
    set({ settings: loaded });
  },

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    storage.saveSettings(updated);
    set({ settings: updated });
  },
}));

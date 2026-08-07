import { create } from 'zustand';
import { storage } from '../services/storage';
import { UserSettings } from '../types/game';

interface SettingsState {
  settings: UserSettings;
  loadSettings: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'system',
  soundEnabled: true,
  hapticsEnabled: true,
  paperGridTexture: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  loadSettings: () => {
    const loaded = storage.getSettings();
    set({ settings: loaded });
  },

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    storage.saveSettings(updated);
    set({ settings: updated });
  },

  resetSettings: () => {
    storage.saveSettings(DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });
  },
}));

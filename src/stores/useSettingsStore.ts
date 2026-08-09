import { create } from 'zustand';
import { storage } from '../services/storage';
import { UserSettings } from '../types/game';

interface SettingsState {
  settings: UserSettings;
  loadSettings: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  purchaseRemoveAds: () => void;
  restorePurchases: () => boolean;
  setAdBlockedState: (blocked: boolean) => void;
  resetAdFreeStatus: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'system',
  soundEnabled: true,
  hapticsEnabled: true,
  paperGridTexture: true,
  isAdFree: false,
  devForceShowAds: true,
  isAdBlocked: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  loadSettings: () => {
    const loaded = storage.getSettings();
    set({ settings: { ...DEFAULT_SETTINGS, ...loaded } });
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

  purchaseRemoveAds: () => {
    const updated: UserSettings = { ...get().settings, isAdFree: true };
    storage.saveSettings(updated);
    set({ settings: updated });
  },

  restorePurchases: () => {
    const isPro = get().settings.isAdFree ?? false;
    return isPro;
  },

  setAdBlockedState: (blocked: boolean) => {
    const updated: UserSettings = { ...get().settings, isAdBlocked: blocked };
    set({ settings: updated });
  },

  resetAdFreeStatus: () => {
    const updated: UserSettings = { ...get().settings, isAdFree: false };
    storage.saveSettings(updated);
    set({ settings: updated });
  },
}));

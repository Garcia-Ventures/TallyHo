import { create } from 'zustand';

import { trackEvent } from '../services/analytics';
import { storage } from '../services/storage';
import type { UserSettings } from '../types/game';
import { DEFAULT_USER_SETTINGS } from '../types/game';

interface SettingsState {
  settings: UserSettings;
  /** False until the on-device settings snapshot has been read. Ads wait so Pro does not flash a banner. */
  settingsLoaded: boolean;
  loadSettings: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  purchaseRemoveAds: () => void;
  setAdBlockedState: (blocked: boolean) => void;
  resetAdFreeStatus: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_USER_SETTINGS,
  settingsLoaded: false,

  loadSettings: () => {
    const loaded = storage.getSettings();
    set({ settings: { ...DEFAULT_USER_SETTINGS, ...loaded }, settingsLoaded: true });
  },

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    storage.saveSettings(updated);
    trackEvent('settings_updated', newSettings);
    set({ settings: updated });
  },

  resetSettings: () => {
    storage.saveSettings(DEFAULT_USER_SETTINGS);
    set({ settings: DEFAULT_USER_SETTINGS });
  },

  purchaseRemoveAds: () => {
    const updated: UserSettings = { ...get().settings, isAdFree: true };
    storage.saveSettings(updated);
    set({ settings: updated });
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

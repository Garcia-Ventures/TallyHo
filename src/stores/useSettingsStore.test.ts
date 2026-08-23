import { beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from './useSettingsStore';

if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    length: 0,
    key: () => null,
  };
}

describe('useSettingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.getState().resetSettings();
  });

  it('initializes with default state', () => {
    const settings = useSettingsStore.getState().settings;
    expect(settings.isAdFree).toBe(false);
    expect(settings.isAdBlocked).toBe(false);
    expect(settings.soundEnabled).toBe(true);
    expect(settings.hapticsEnabled).toBe(true);
    expect(settings.paperGridTexture).toBe(true);
    expect(settings.themeMode).toBe('system');
  });

  it('updates specific settings via updateSettings', () => {
    useSettingsStore.getState().updateSettings({
      soundEnabled: false,
      themeMode: 'dark',
    });

    const settings = useSettingsStore.getState().settings;
    expect(settings.soundEnabled).toBe(false);
    expect(settings.themeMode).toBe('dark');
    expect(settings.hapticsEnabled).toBe(true);
  });

  it('loads saved settings from storage via loadSettings', () => {
    useSettingsStore.getState().updateSettings({ paperGridTexture: false });

    // Re-trigger loadSettings
    useSettingsStore.getState().loadSettings();
    expect(useSettingsStore.getState().settings.paperGridTexture).toBe(false);
  });

  it('updates isAdFree to true when purchaseRemoveAds is called', () => {
    useSettingsStore.getState().purchaseRemoveAds();
    const settings = useSettingsStore.getState().settings;
    expect(settings.isAdFree).toBe(true);
  });

  it('restores purchases correctly', () => {
    expect(useSettingsStore.getState().restorePurchases()).toBe(false);

    useSettingsStore.getState().purchaseRemoveAds();
    expect(useSettingsStore.getState().restorePurchases()).toBe(true);
  });

  it('resets ad-free status back to false on resetAdFreeStatus', () => {
    useSettingsStore.getState().purchaseRemoveAds();
    expect(useSettingsStore.getState().settings.isAdFree).toBe(true);

    useSettingsStore.getState().resetAdFreeStatus();
    expect(useSettingsStore.getState().settings.isAdFree).toBe(false);
  });

  it('updates ad-blocker fallback state', () => {
    useSettingsStore.getState().setAdBlockedState(true);
    expect(useSettingsStore.getState().settings.isAdBlocked).toBe(true);

    useSettingsStore.getState().setAdBlockedState(false);
    expect(useSettingsStore.getState().settings.isAdBlocked).toBe(false);
  });

  it('resets all settings back to default', () => {
    useSettingsStore.getState().updateSettings({
      soundEnabled: false,
      hapticsEnabled: false,
      isAdFree: true,
      themeMode: 'light',
    });

    useSettingsStore.getState().resetSettings();
    const settings = useSettingsStore.getState().settings;
    expect(settings.soundEnabled).toBe(true);
    expect(settings.hapticsEnabled).toBe(true);
    expect(settings.isAdFree).toBe(false);
    expect(settings.themeMode).toBe('system');
  });
});

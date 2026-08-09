import { beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from './useSettingsStore';

describe('useSettingsStore Monetization & Ad-Blocker state', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings();
  });

  it('initializes with default ad state (isAdFree: false)', () => {
    const settings = useSettingsStore.getState().settings;
    expect(settings.isAdFree).toBe(false);
    expect(settings.isAdBlocked).toBe(false);
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
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockImpactAsync = vi.fn().mockResolvedValue(undefined);
const mockNotificationAsync = vi.fn().mockResolvedValue(undefined);

vi.mock('expo-haptics', () => ({
  impactAsync: mockImpactAsync,
  notificationAsync: mockNotificationAsync,
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

vi.mock('react-native', () => ({
  NativeModules: {
    ExpoHaptics: {},
  },
}));

import { nativeHaptics } from './haptics.native';
import { storage } from './storage';

describe('haptics.native service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(storage, 'getSettings').mockReturnValue({
      soundEnabled: true,
      hapticsEnabled: true,
      themeMode: 'system',
      paperGridTexture: true,
    });
  });

  it('triggers light impact via expo-haptics', async () => {
    await nativeHaptics.triggerLightImpact();
    expect(mockImpactAsync).toHaveBeenCalledWith('light');
  });

  it('triggers medium impact via expo-haptics', async () => {
    await nativeHaptics.triggerMediumImpact();
    expect(mockImpactAsync).toHaveBeenCalledWith('medium');
  });

  it('triggers heavy impact via expo-haptics', async () => {
    await nativeHaptics.triggerHeavyImpact();
    expect(mockImpactAsync).toHaveBeenCalledWith('heavy');
  });

  it('triggers victory notification via expo-haptics', async () => {
    await nativeHaptics.triggerVictoryNotification();
    expect(mockNotificationAsync).toHaveBeenCalledWith('success');
  });

  it('suppresses haptics when hapticsEnabled is false', async () => {
    vi.spyOn(storage, 'getSettings').mockReturnValue({
      soundEnabled: true,
      hapticsEnabled: false,
      themeMode: 'system',
      paperGridTexture: true,
    });

    await nativeHaptics.triggerLightImpact();
    await nativeHaptics.triggerMediumImpact();
    await nativeHaptics.triggerHeavyImpact();
    await nativeHaptics.triggerVictoryNotification();

    expect(mockImpactAsync).not.toHaveBeenCalled();
    expect(mockNotificationAsync).not.toHaveBeenCalled();
  });
});

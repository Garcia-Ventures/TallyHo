import * as Haptics from 'expo-haptics';
import { storage } from './storage';

/**
 * Native Haptic Feedback Service using expo-haptics.
 */
class NativeHapticsService {
  /**
   * Triggers a light impact tap (pen click, keypad tap).
   */
  public triggerLightImpact(): void {
    const settings = storage.getSettings();
    if (!settings.hapticsEnabled) {
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // Hardware fallback
    }
  }

  /**
   * Triggers a medium impact tap (paper rustle, view flip).
   */
  public triggerMediumImpact(): void {
    const settings = storage.getSettings();
    if (!settings.hapticsEnabled) {
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {
      // Hardware fallback
    }
  }

  /**
   * Triggers a heavy impact tap (round score submission).
   */
  public triggerHeavyImpact(): void {
    const settings = storage.getSettings();
    if (!settings.hapticsEnabled) {
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    } catch {
      // Hardware fallback
    }
  }

  /**
   * Triggers a victory notification pulse sequence.
   */
  public triggerVictoryNotification(): void {
    const settings = storage.getSettings();
    if (!settings.hapticsEnabled) {
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      // Hardware fallback
    }
  }
}

export const nativeHaptics = new NativeHapticsService();

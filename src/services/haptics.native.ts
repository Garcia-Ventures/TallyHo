import type { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
import { NativeModules } from 'react-native';

import { storage } from './storage';

interface LoadedHaptics {
  impactAsync: (style?: ImpactFeedbackStyle) => Promise<void>;
  notificationAsync: (type?: NotificationFeedbackType) => Promise<void>;
  ImpactFeedbackStyle: typeof ImpactFeedbackStyle;
  NotificationFeedbackType: typeof NotificationFeedbackType;
}

/** Native Haptic Feedback Service using expo-haptics with safe native guards. */
class NativeHapticsService {
  private hapticsModule: LoadedHaptics | null = null;
  private isAvailable = true;

  private async getHapticsModule(): Promise<LoadedHaptics | null> {
    if (!this.isAvailable) {
      return null;
    }
    if (this.hapticsModule) {
      return this.hapticsModule;
    }

    try {
      const hasHaptics = NativeModules && (NativeModules.ExpoHaptics || NativeModules.Haptics);
      if (!hasHaptics) {
        this.isAvailable = false;
        return null;
      }
      this.hapticsModule = await import('expo-haptics');
      return this.hapticsModule;
    } catch {
      this.isAvailable = false;
      return null;
    }
  }

  public async triggerLightImpact(): Promise<void> {
    const settings = storage.getSettings();
    if (!settings.hapticsEnabled) {
      return;
    }

    try {
      const Haptics = await this.getHapticsModule();
      if (Haptics?.impactAsync) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Hardware fallback
    }
  }

  public async triggerMediumImpact(): Promise<void> {
    const settings = storage.getSettings();
    if (!settings.hapticsEnabled) {
      return;
    }

    try {
      const Haptics = await this.getHapticsModule();
      if (Haptics?.impactAsync) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // Hardware fallback
    }
  }

  public async triggerHeavyImpact(): Promise<void> {
    const settings = storage.getSettings();
    if (!settings.hapticsEnabled) {
      return;
    }

    try {
      const Haptics = await this.getHapticsModule();
      if (Haptics?.impactAsync) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch {
      // Hardware fallback
    }
  }

  public async triggerVictoryNotification(): Promise<void> {
    const settings = storage.getSettings();
    if (!settings.hapticsEnabled) {
      return;
    }

    try {
      const Haptics = await this.getHapticsModule();
      if (Haptics?.notificationAsync) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Hardware fallback
    }
  }
}

export const nativeHaptics = new NativeHapticsService();

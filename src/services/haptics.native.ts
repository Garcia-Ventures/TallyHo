import { NativeModules } from 'react-native';
import { storage } from './storage';

interface HapticsModuleType {
  impactAsync?: (style: unknown) => Promise<unknown>;
  notificationAsync?: (type: unknown) => Promise<unknown>;
  ImpactFeedbackStyle?: {
    Light?: string;
    Medium?: string;
    Heavy?: string;
  };
  NotificationFeedbackType?: {
    Success?: string;
  };
}

/**
 * Native Haptic Feedback Service using expo-haptics with safe native guards.
 */
class NativeHapticsService {
  private hapticsModule: HapticsModuleType | null = null;
  private isAvailable = true;

  private async getHapticsModule(): Promise<HapticsModuleType | null> {
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
      const Haptics = await import('expo-haptics');
      this.hapticsModule = Haptics as unknown as HapticsModuleType;
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
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle?.Light || 'light');
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
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle?.Medium || 'medium');
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
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle?.Heavy || 'heavy');
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
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType?.Success || 'success');
      }
    } catch {
      // Hardware fallback
    }
  }
}

export const nativeHaptics = new NativeHapticsService();

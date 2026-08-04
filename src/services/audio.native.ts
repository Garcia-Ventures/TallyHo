import { NativeModules } from 'react-native';
import { nativeHaptics } from './haptics.native';
import { storage } from './storage';

interface SoundObject {
  replayAsync: () => Promise<unknown>;
}

interface AudioClass {
  Sound: {
    createAsync: (source: { uri: string }) => Promise<{ sound: SoundObject }>;
  };
}

/**
 * Native Sound Service for Expo / React Native with safe native module guards.
 */
class NativeSoundService {
  private soundCache: Record<string, SoundObject> = {};
  private AudioModule: AudioClass | null = null;
  private isAudioAvailable = true;

  private async getAudioModule(): Promise<AudioClass | null> {
    if (!this.isAudioAvailable) {
      return null;
    }
    if (this.AudioModule) {
      return this.AudioModule;
    }

    try {
      // Guard against missing ExponentAV native module in Expo Go or custom dev client
      const hasNativeAV = NativeModules && (NativeModules.ExponentAV || NativeModules.ExpoAudio);
      if (!hasNativeAV) {
        this.isAudioAvailable = false;
        return null;
      }

      const expoAv = await import('expo-av');
      this.AudioModule = expoAv.Audio as unknown as AudioClass;
      return this.AudioModule;
    } catch {
      this.isAudioAvailable = false;
      return null;
    }
  }

  private async playAudioFile(key: string, sourceUri?: string): Promise<void> {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    try {
      const Audio = await this.getAudioModule();
      if (!Audio) {
        return;
      }

      if (sourceUri && !this.soundCache[key]) {
        const { sound } = await Audio.Sound.createAsync({ uri: sourceUri });
        this.soundCache[key] = sound;
      }
      const cached = this.soundCache[key];
      if (cached) {
        await cached.replayAsync();
      }
    } catch {
      // Audio playback fallback
    }
  }

  public playPenClick(): void {
    nativeHaptics.triggerLightImpact();
    this.playAudioFile('pen_click');
  }

  public playPaperRustle(): void {
    nativeHaptics.triggerMediumImpact();
    this.playAudioFile('paper_rustle');
  }

  public playKeypadTap(): void {
    nativeHaptics.triggerLightImpact();
    this.playAudioFile('keypad_tap');
  }

  public playRoundSubmit(): void {
    nativeHaptics.triggerHeavyImpact();
    this.playAudioFile('round_submit');
  }

  public playVictoryFanfare(): void {
    nativeHaptics.triggerVictoryNotification();
    this.playAudioFile('victory_fanfare');
  }

  public playUndo(): void {
    nativeHaptics.triggerLightImpact();
    this.playAudioFile('undo');
  }
}

export const soundEffects = new NativeSoundService();
export const audio = soundEffects;
export const nativeSound = soundEffects;
export const soundEffectsNative = soundEffects;

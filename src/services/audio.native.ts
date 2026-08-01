import { Audio } from 'expo-av';
import { nativeHaptics } from './haptics.native';
import { storage } from './storage';

/**
 * Native Sound Service for Expo / React Native.
 */
class NativeSoundService {
  private soundCache: Record<string, Audio.Sound> = {};

  private async playAudioFile(key: string, sourceUri?: string): Promise<void> {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    try {
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

export const nativeSound = new NativeSoundService();
export const soundEffectsNative = nativeSound;

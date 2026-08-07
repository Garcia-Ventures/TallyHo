import { nativeHaptics } from './haptics.native';
import { storage } from './storage';

interface ExpoAudioPlayer {
  play: () => void;
}

/**
 * Native Sound Service for Expo / React Native using expo-audio and haptics.
 */
class NativeSoundService {
  private playerCache: Record<string, ExpoAudioPlayer> = {};
  private isAudioAvailable = true;

  private async playAudioFile(key: string, sourceUri?: string): Promise<void> {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    if (!sourceUri || !this.isAudioAvailable) {
      return;
    }

    try {
      if (!this.playerCache[key]) {
        const expoAudio = await import('expo-audio');
        if (expoAudio && typeof expoAudio.createAudioPlayer === 'function') {
          const player = expoAudio.createAudioPlayer(sourceUri);
          this.playerCache[key] = player as unknown as ExpoAudioPlayer;
        }
      }
      const player = this.playerCache[key];
      if (player) {
        player.play();
      }
    } catch {
      this.isAudioAvailable = false;
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

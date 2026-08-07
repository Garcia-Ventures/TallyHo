import { storage } from './storage';

class SoundService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Keypad Digit Tap (0-9)
   */
  public playKeypadTap(): void {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    try {
      const ctx = this.getContext();
      if (!ctx) {
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);

      this.triggerHaptic(10);
    } catch {
      // Ignore audio context errors
    }
  }

  /**
   * Keypad Clear / Delete (CLR, ⌫)
   */
  public playKeypadClear(): void {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    try {
      const ctx = this.getContext();
      if (!ctx) {
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);

      this.triggerHaptic(15);
    } catch {
      // Ignore audio context errors
    }
  }

  /**
   * Submitting Round Score (✓ Submit Round Score)
   */
  public playRoundSubmit(): void {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    try {
      const ctx = this.getContext();
      if (!ctx) {
        return;
      }

      const now = ctx.currentTime;
      [440, 660, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.1, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.08);
      });

      this.triggerHaptic([20, 30, 20]);
    } catch {
      // Ignore audio context errors
    }
  }

  /**
   * Preset Selection (Golf, Uno, Phase 10, etc.)
   */
  public playPresetSelect(): void {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    try {
      const ctx = this.getContext();
      if (!ctx) {
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);

      this.triggerHaptic(12);
    } catch {
      // Ignore audio context errors
    }
  }

  /**
   * Start Match Action ("🚀 Start Match")
   */
  public playGameStart(): void {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    try {
      const ctx = this.getContext();
      if (!ctx) {
        return;
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);

      this.triggerHaptic(30);
    } catch {
      // Ignore audio context errors
    }
  }

  /**
   * Switching Player Card / Active Turn
   */
  public playPlayerSwitch(): void {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    try {
      const ctx = this.getContext();
      if (!ctx) {
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);

      this.triggerHaptic(10);
    } catch {
      // Ignore audio context errors
    }
  }

  /**
   * Navigation Tap (Modal Close / Back)
   */
  public playNavigationTap(): void {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    try {
      const ctx = this.getContext();
      if (!ctx) {
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.025);

      this.triggerHaptic(10);
    } catch {
      // Ignore audio context errors
    }
  }

  /**
   * Settings Toggle Switch (Sound / Haptics On/Off)
   */
  public playToggle(enabled = true): void {
    const settings = storage.getSettings();
    if (!settings.soundEnabled && enabled) {
      // Allow feedback sound when enabling sound
    } else if (!settings.soundEnabled) {
      return;
    }

    try {
      const ctx = this.getContext();
      if (!ctx) {
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (enabled) {
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.04);
      } else {
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.04);
      }

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);

      this.triggerHaptic(10);
    } catch {
      // Ignore audio context errors
    }
  }

  /**
   * Game Over Victory Fanfare (Champion Celebration)
   */
  public playVictoryFanfare(): void {
    const settings = storage.getSettings();
    if (!settings.soundEnabled) {
      return;
    }

    try {
      const ctx = this.getContext();
      if (!ctx) {
        return;
      }

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        const duration = idx === notes.length - 1 ? 0.6 : 0.15;
        gain.gain.setValueAtTime(0.18, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + duration);
      });

      this.triggerHaptic([40, 60, 40, 100]);
    } catch {
      // Ignore audio context errors
    }
  }

  /**
   * Destructive Action / Undo
   */
  public playUndo(): void {
    this.playKeypadClear();
  }

  public playPenClick(): void {
    this.playKeypadTap();
  }

  public playPaperRustle(): void {
    this.playGameStart();
  }

  public triggerHaptic(pattern: number | number[] = 15): void {
    const settings = storage.getSettings();
    if (!settings.hapticsEnabled) {
      return;
    }

    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Haptics not allowed or unsupported
      }
    }
  }
}

export const audio = new SoundService();
export const soundEffects = audio;
export const nativeSound = audio;

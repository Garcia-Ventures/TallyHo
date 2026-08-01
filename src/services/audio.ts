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

  public playPenClick(): void {
    this.playKeypadTap();
  }

  public playPaperRustle(): void {
    this.playRoundSubmit();
  }

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

  public playUndo(): void {
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
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);

      this.triggerHaptic(15);
    } catch {
      // Ignore audio context errors
    }
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

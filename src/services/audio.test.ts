import { beforeEach, describe, expect, it, vi } from 'vitest';
import { audio } from './audio';
import { storage } from './storage';

describe('audio service', () => {
  let mockOscillator: {
    type: string;
    frequency: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };
  let mockGain: {
    gain: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
  };
  let mockAudioContext: {
    state: string;
    currentTime: number;
    destination: object;
    createOscillator: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
  };
  let mockVibrate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    mockVibrate = vi.fn();

    const mockNav = {
      vibrate: mockVibrate,
    };

    vi.stubGlobal('navigator', mockNav);
    vi.stubGlobal('window', {
      AudioContext: vi.fn(function () {
        return mockAudioContext;
      }),
      navigator: mockNav,
    });

    // Reset cached audio context on singleton for clean test isolation
    (audio as unknown as { ctx: typeof mockAudioContext }).ctx = mockAudioContext;

    vi.spyOn(storage, 'getSettings').mockReturnValue({
      soundEnabled: true,
      hapticsEnabled: true,
      themeMode: 'system',
      paperGridTexture: true,
    });
  });

  it('plays keypad tap sound and triggers haptic feedback', () => {
    audio.playKeypadTap();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  it('plays keypad clear sound', () => {
    audio.playKeypadClear();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockVibrate).toHaveBeenCalledWith(15);
  });

  it('plays round submit multi-tone sound', () => {
    audio.playRoundSubmit();
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
    expect(mockVibrate).toHaveBeenCalledWith([20, 30, 20]);
  });

  it('plays preset selection sound', () => {
    audio.playPresetSelect();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('plays game start sound', () => {
    audio.playGameStart();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('plays player switch sound', () => {
    audio.playPlayerSwitch();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('plays navigation tap sound', () => {
    audio.playNavigationTap();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('plays toggle on/off sounds', () => {
    audio.playToggle(true);
    audio.playToggle(false);
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
  });

  it('plays victory fanfare sound', () => {
    audio.playVictoryFanfare();
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4);
    expect(mockVibrate).toHaveBeenCalledWith([40, 60, 40, 100]);
  });

  it('plays convenience sound aliases (undo, penClick, paperRustle)', () => {
    audio.playUndo();
    audio.playPenClick();
    audio.playPaperRustle();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('suppresses audio when soundEnabled is false', () => {
    vi.spyOn(storage, 'getSettings').mockReturnValue({
      soundEnabled: false,
      hapticsEnabled: true,
      themeMode: 'system',
      paperGridTexture: true,
    });

    audio.playKeypadTap();
    audio.playVictoryFanfare();
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  it('suppresses haptics when hapticsEnabled is false', () => {
    vi.spyOn(storage, 'getSettings').mockReturnValue({
      soundEnabled: true,
      hapticsEnabled: false,
      themeMode: 'system',
      paperGridTexture: true,
    });

    audio.triggerHaptic(20);
    expect(mockVibrate).not.toHaveBeenCalled();
  });
});

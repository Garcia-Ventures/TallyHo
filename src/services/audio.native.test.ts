import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockHaptics } = vi.hoisted(() => {
  return {
    mockHaptics: {
      triggerLightImpact: vi.fn(),
      triggerMediumImpact: vi.fn(),
      triggerHeavyImpact: vi.fn(),
      triggerVictoryNotification: vi.fn(),
    },
  };
});

vi.mock('./haptics.native', () => ({
  nativeHaptics: mockHaptics,
}));

vi.mock('expo-audio', () => ({
  createAudioPlayer: vi.fn(() => ({
    play: vi.fn(),
  })),
}));

import { soundEffects } from './audio.native';
import { storage } from './storage';

describe('audio.native service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(storage, 'getSettings').mockReturnValue({
      soundEnabled: true,
      hapticsEnabled: true,
      themeMode: 'system',
      paperGridTexture: true,
    });
  });

  it('triggers light impact and plays audio for keypad tap', () => {
    soundEffects.playKeypadTap();
    expect(mockHaptics.triggerLightImpact).toHaveBeenCalled();
  });

  it('triggers medium impact for keypad clear and undo', () => {
    soundEffects.playKeypadClear();
    expect(mockHaptics.triggerMediumImpact).toHaveBeenCalled();

    soundEffects.playUndo();
    expect(mockHaptics.triggerMediumImpact).toHaveBeenCalledTimes(2);
  });

  it('triggers heavy impact for round submit and game start', () => {
    soundEffects.playRoundSubmit();
    expect(mockHaptics.triggerHeavyImpact).toHaveBeenCalled();

    soundEffects.playGameStart();
    expect(mockHaptics.triggerHeavyImpact).toHaveBeenCalledTimes(2);
  });

  it('triggers victory notification for victory fanfare', () => {
    soundEffects.playVictoryFanfare();
    expect(mockHaptics.triggerVictoryNotification).toHaveBeenCalled();
  });

  it('triggers light impact for preset select, player switch, navigation tap, toggle', () => {
    soundEffects.playPresetSelect();
    soundEffects.playPlayerSwitch();
    soundEffects.playNavigationTap();
    soundEffects.playToggle(true);
    soundEffects.playToggle(false);
    expect(mockHaptics.triggerLightImpact).toHaveBeenCalled();
  });

  it('executes convenience aliases (penClick, paperRustle)', () => {
    soundEffects.playPenClick();
    soundEffects.playPaperRustle();
    expect(mockHaptics.triggerLightImpact).toHaveBeenCalled();
    expect(mockHaptics.triggerHeavyImpact).toHaveBeenCalled();
  });
});

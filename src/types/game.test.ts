import { describe, expect, it } from 'vitest';

import { GAME_PRESETS, PLAYER_COLORS } from './game';

describe('Game Types & Constants', () => {
  describe('PLAYER_COLORS', () => {
    it('should be an array of length 6', () => {
      expect(Array.isArray(PLAYER_COLORS)).toBe(true);
      expect(PLAYER_COLORS.length).toBe(6);
    });

    it('should have correct structure for each color', () => {
      PLAYER_COLORS.forEach((color) => {
        expect(color).toHaveProperty('name');
        expect(color).toHaveProperty('hex');
        expect(color).toHaveProperty('bg');
        expect(color).toHaveProperty('text');
        expect(typeof color.name).toBe('string');
        expect(typeof color.hex).toBe('string');
        expect(typeof color.bg).toBe('string');
        expect(typeof color.text).toBe('string');
      });
    });

    it('should include specific known colors like Mustard', () => {
      const mustard = PLAYER_COLORS.find((c) => c.name === 'Mustard');
      expect(mustard).toBeDefined();
      expect(mustard?.bg).toBe('bg-chip-mustard');
    });
  });

  describe('GAME_PRESETS', () => {
    it('should be an array with elements', () => {
      expect(Array.isArray(GAME_PRESETS)).toBe(true);
      expect(GAME_PRESETS.length).toBeGreaterThan(0);
    });

    it('should have unique ids for all presets', () => {
      const ids = GAME_PRESETS.map((preset) => preset.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should conform to the GamePreset structure', () => {
      GAME_PRESETS.forEach((preset) => {
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('icon');
        expect(preset).toHaveProperty('scoringMode');
        expect(preset).toHaveProperty('roundScoringType');
        expect(preset).toHaveProperty('badgeText');

        expect(['RACE_HIGH', 'RACE_LOW', 'FIXED_ROUNDS']).toContain(preset.scoringMode);
        expect(['EVERY_PLAYER', 'SINGLE_WINNER']).toContain(preset.roundScoringType);
      });
    });

    it('should include the custom game preset', () => {
      const customPreset = GAME_PRESETS.find((p) => p.id === 'custom');
      expect(customPreset).toBeDefined();
      expect(customPreset?.name).toBe('Custom Game');
      expect(customPreset?.scoringMode).toBe('RACE_HIGH');
      expect(customPreset?.roundScoringType).toBe('EVERY_PLAYER');
    });
  });
});

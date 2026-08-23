import { beforeEach, describe, expect, it } from 'vitest';
import { GameSession, Player, UserSettings } from '../types/game';
import { storage } from './storage';

describe('storage service', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  describe('Active Game storage', () => {
    const mockGame: GameSession = {
      id: 'game_active_1',
      name: 'Game Night Test',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      targetScore: 100,
      status: 'ACTIVE',
      createdAt: '2026-08-23T00:00:00.000Z',
      updatedAt: '2026-08-23T00:00:00.000Z',
      players: [
        { id: 'p1', name: 'Alice', initials: 'A', color: '#E5A93C' },
        { id: 'p2', name: 'Bob', initials: 'B', color: '#6A9C78' },
      ],
      rounds: [
        {
          roundNumber: 1,
          timestamp: '2026-08-23T00:01:00.000Z',
          scores: {
            p1: { playerId: 'p1', points: 25 },
            p2: { playerId: 'p2', points: 15 },
          },
        },
      ],
    };

    it('saves and retrieves active game session correctly', () => {
      expect(storage.getActiveGame()).toBeNull();

      storage.saveActiveGame(mockGame);
      const retrieved = storage.getActiveGame();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('game_active_1');
      expect(retrieved?.players).toHaveLength(2);
      expect(retrieved?.rounds).toHaveLength(1);
    });

    it('clears active game session', () => {
      storage.saveActiveGame(mockGame);
      expect(storage.getActiveGame()).not.toBeNull();

      storage.clearActiveGame();
      expect(storage.getActiveGame()).toBeNull();
    });
  });

  describe('Match History storage', () => {
    const game1: GameSession = {
      id: 'hist_1',
      name: 'Match 1',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      status: 'COMPLETED',
      createdAt: '2026-08-22T00:00:00.000Z',
      updatedAt: '2026-08-22T00:30:00.000Z',
      players: [{ id: 'p1', name: 'Alice', initials: 'A', color: '#E5A93C' }],
      rounds: [],
    };

    const game2: GameSession = {
      id: 'hist_2',
      name: 'Match 2',
      scoringMode: 'RACE_LOW',
      roundScoringType: 'EVERY_PLAYER',
      status: 'COMPLETED',
      createdAt: '2026-08-22T01:00:00.000Z',
      updatedAt: '2026-08-22T01:30:00.000Z',
      players: [{ id: 'p2', name: 'Bob', initials: 'B', color: '#6A9C78' }],
      rounds: [],
    };

    it('saves match to history and places new matches at top', () => {
      storage.archiveMatch(game1);
      let history = storage.getMatchHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('hist_1');

      storage.archiveMatch(game2);
      history = storage.getMatchHistory();
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('hist_2');
      expect(history[1].id).toBe('hist_1');
    });

    it('updates existing match in history if same id is saved again', () => {
      storage.archiveMatch(game1);
      const updatedGame1: GameSession = {
        ...game1,
        name: 'Match 1 Updated',
      };
      storage.archiveMatch(updatedGame1);

      const history = storage.getMatchHistory();
      expect(history).toHaveLength(1);
      expect(history[0].name).toBe('Match 1 Updated');
    });

    it('deletes specific match from history', () => {
      storage.archiveMatch(game1);
      storage.archiveMatch(game2);

      storage.deleteMatch('hist_1');
      const history = storage.getMatchHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('hist_2');
    });
  });

  describe('Player Library storage', () => {
    const newPlayer: Player = { id: 'p_custom', name: 'Custom Hero', initials: 'CH', color: '#E5A93C' };

    it('returns default starter library initially', () => {
      const library = storage.getPlayerLibrary();
      expect(library).toHaveLength(4);
      expect(library[0].name).toBe('Player 1');
    });

    it('saves and retrieves custom players from library', () => {
      storage.savePlayerToLibrary(newPlayer);
      const retrieved = storage.getPlayerLibrary();
      expect(retrieved.some((p) => p.name === 'Custom Hero')).toBe(true);
    });

    it('deletes player from library', () => {
      storage.savePlayerToLibrary(newPlayer);
      storage.deletePlayerFromLibrary('p_custom');
      const retrieved = storage.getPlayerLibrary();
      expect(retrieved.some((p) => p.id === 'p_custom')).toBe(false);
    });
  });

  describe('User Settings storage', () => {
    const customSettings: UserSettings = {
      themeMode: 'dark',
      soundEnabled: false,
      hapticsEnabled: true,
      paperGridTexture: false,
      isAdFree: true,
      customServerUrl: 'https://custom.tallyho.dev',
    };

    it('returns default settings when none are stored', () => {
      const defaults = storage.getSettings();
      expect(defaults.themeMode).toBe('system');
      expect(defaults.soundEnabled).toBe(true);
      expect(defaults.hapticsEnabled).toBe(true);
      expect(defaults.paperGridTexture).toBe(true);
    });

    it('saves and merges custom user settings', () => {
      storage.saveSettings(customSettings);
      const retrieved = storage.getSettings();

      expect(retrieved.themeMode).toBe('dark');
      expect(retrieved.soundEnabled).toBe(false);
      expect(retrieved.isAdFree).toBe(true);
      expect(retrieved.customServerUrl).toBe('https://custom.tallyho.dev');
    });
  });

  describe('Storage Resilience & Fallback Handling', () => {
    it('clearAll wipes all TallyHo storage keys', () => {
      storage.saveSettings({
        themeMode: 'dark',
        soundEnabled: false,
        hapticsEnabled: false,
        paperGridTexture: false,
      });

      storage.clearAll();

      expect(storage.getSettings().themeMode).toBe('system');
    });
  });
});

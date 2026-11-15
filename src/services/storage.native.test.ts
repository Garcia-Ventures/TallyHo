import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GameSession } from '../types/game';

const disk = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getMany: async (keys: string[]) =>
      Object.fromEntries(keys.map((key) => [key, disk.get(key) ?? null])) as Record<string, string | null>,
    setItem: async (key: string, value: string) => {
      disk.set(key, value);
    },
    removeItem: async (key: string) => {
      disk.delete(key);
    },
  },
}));

describe('native storage hydration', () => {
  beforeEach(() => {
    disk.clear();
    vi.resetModules();
  });

  it('round-trips an active game through AsyncStorage', async () => {
    const game: GameSession = {
      id: 'game_saved',
      name: 'Basement Rummy',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      status: 'ACTIVE',
      createdAt: '2026-11-15T00:00:00.000Z',
      updatedAt: '2026-11-15T00:00:00.000Z',
      players: [{ id: 'p1', name: 'Ada', initials: 'A', color: '#E5A93C' }],
      rounds: [],
    };
    disk.set('tallyho_active_game', JSON.stringify(game));

    const { hydrateStorage, storage } = await import('./storage.native');
    await hydrateStorage();

    expect(storage.getActiveGame()?.name).toBe('Basement Rummy');

    storage.saveActiveGame({ ...game, name: 'Basement Rummy Rematch' });
    await vi.waitFor(() => {
      expect(disk.get('tallyho_active_game')).toContain('Rematch');
    });
  });

  it('does not seed the default roster before hydration finishes', async () => {
    const { storage, hydrateStorage } = await import('./storage.native');
    expect(storage.getPlayerLibrary()).toEqual([]);

    await hydrateStorage();
    expect(storage.getPlayerLibrary()).toHaveLength(4);
    await vi.waitFor(() => {
      expect(disk.get('tallyho_player_library')).toContain('Player 1');
    });
  });
});

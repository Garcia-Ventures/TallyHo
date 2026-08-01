import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './useGameStore';

// Ensure localStorage mock is present in Node/bun test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    length: 0,
    key: () => null,
  };
}

describe('useGameStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      activeGame: null,
      matchHistory: [],
      viewMode: 'HOME',
      isPlayMode: false,
    });
  });

  it('creates a new game session', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'Test Uno Match',
      scoringMode: 'RACE_LOW',
      roundScoringType: 'SINGLE_WINNER',
      targetScore: 500,
      players: [
        { id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' },
        { id: 'p2', name: 'Noah', initials: 'N', color: '#6A9C78' },
      ],
    });

    const active = useGameStore.getState().activeGame;
    expect(active).not.toBeNull();
    expect(active?.name).toBe('Test Uno Match');
    expect(active?.players.length).toBe(2);
    expect(useGameStore.getState().viewMode).toBe('MATCH');
  });

  it('submits a round score and checks win condition', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'Quick Race',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'SINGLE_WINNER',
      targetScore: 50,
      players: [
        { id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' },
        { id: 'p2', name: 'Noah', initials: 'N', color: '#6A9C78' },
      ],
    });

    const result = store.submitRoundScore({
      playerId: 'p1',
      points: 60,
    });

    expect(result.hasWinner).toBe(true);
    expect(result.winnerId).toBe('p1');
    expect(useGameStore.getState().activeGame?.status).toBe('COMPLETED');
    expect(useGameStore.getState().matchHistory.length).toBe(1);
  });
});

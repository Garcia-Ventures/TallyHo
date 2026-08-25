import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storage } from '../services/storage';
import { useGameStore } from './useGameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    storage.clearAll();
    useGameStore.setState({
      activeGame: null,
      matchHistory: [],
      viewMode: 'HOME',
      isPlayMode: false,
    });
  });

  it('creates a new game session and sets viewMode to MATCH', () => {
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
    expect(active?.rounds.length).toBe(1);
    expect(useGameStore.getState().viewMode).toBe('MATCH');
    expect(useGameStore.getState().isPlayMode).toBe(true);
  });

  it('loads initial data from storage when active game exists', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'Persisted Game',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      players: [{ id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' }],
    });

    // Reset store in-memory state
    useGameStore.setState({ activeGame: null, matchHistory: [], viewMode: 'HOME' });
    expect(useGameStore.getState().activeGame).toBeNull();

    // Call loadInitialData
    useGameStore.getState().loadInitialData();
    expect(useGameStore.getState().activeGame?.name).toBe('Persisted Game');
    expect(useGameStore.getState().viewMode).toBe('MATCH');
  });

  it('submits round score and advances round automatically in SINGLE_WINNER mode', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'Single Winner Match',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'SINGLE_WINNER',
      targetScore: 200,
      players: [
        { id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' },
        { id: 'p2', name: 'Noah', initials: 'N', color: '#6A9C78' },
      ],
    });

    const result = store.submitRoundScore({
      playerId: 'p1',
      points: 50,
    });

    expect(result.hasWinner).toBe(false);
    const active = useGameStore.getState().activeGame;
    // In SINGLE_WINNER, submitting advances to round 2
    expect(active?.rounds.length).toBe(2);
    expect(active?.rounds[0].scores['p1'].points).toBe(50);
  });

  it('submits round score and detects win condition in RACE_HIGH', () => {
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

  it('returns false when submitRoundScore is called without an active game', () => {
    useGameStore.setState({ activeGame: null });
    const result = useGameStore.getState().submitRoundScore({
      playerId: 'p1',
      points: 10,
    });
    expect(result.hasWinner).toBe(false);
    expect(result.winnerId).toBe('');
  });

  it('handles submitRoundScore when activeGame rounds array is empty', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'Empty Rounds Game',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      players: [{ id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' }],
    });

    // Artificially clear rounds
    const current = useGameStore.getState().activeGame!;
    useGameStore.setState({ activeGame: { ...current, rounds: [] } });

    const result = store.submitRoundScore({ playerId: 'p1', points: 20 });
    expect(result.hasWinner).toBe(false);
    expect(useGameStore.getState().activeGame?.rounds.length).toBe(2);
  });

  it('reorders players and persists to storage', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'Reorder Game',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      players: [
        { id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' },
        { id: 'p2', name: 'Noah', initials: 'N', color: '#6A9C78' },
      ],
    });

    store.reorderPlayers([
      { id: 'p2', name: 'Noah', initials: 'N', color: '#6A9C78' },
      { id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' },
    ]);

    const active = useGameStore.getState().activeGame;
    expect(active?.players[0].id).toBe('p2');
    expect(active?.players[1].id).toBe('p1');
  });

  it('safely handles reorderPlayers when activeGame is null', () => {
    useGameStore.setState({ activeGame: null });
    expect(() => useGameStore.getState().reorderPlayers([])).not.toThrow();
  });

  it('updates rounds in active game', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'Rounds Update Game',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      players: [{ id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' }],
    });

    const newRounds = [
      {
        roundNumber: 1,
        timestamp: new Date().toISOString(),
        scores: { p1: { playerId: 'p1', points: 99 } },
      },
    ];

    store.updateRounds(newRounds);
    expect(useGameStore.getState().activeGame?.rounds[0].scores['p1'].points).toBe(99);
  });

  it('safely handles updateRounds when activeGame is null', () => {
    useGameStore.setState({ activeGame: null });
    expect(() => useGameStore.getState().updateRounds([])).not.toThrow();
  });

  it('ends match manually and moves it to history', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'Manual End Match',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      players: [{ id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' }],
    });

    store.endMatchManually();
    expect(useGameStore.getState().activeGame?.status).toBe('COMPLETED');
    expect(useGameStore.getState().matchHistory.length).toBe(1);
  });

  it('safely handles endMatchManually when activeGame is null', () => {
    useGameStore.setState({ activeGame: null });
    expect(() => useGameStore.getState().endMatchManually()).not.toThrow();
  });

  it('deletes a match from history', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'To Delete',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      players: [{ id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' }],
    });
    const gameId = useGameStore.getState().activeGame!.id;
    store.endMatchManually();
    expect(useGameStore.getState().matchHistory.length).toBe(1);

    store.deleteMatchFromHistory(gameId);
    expect(useGameStore.getState().matchHistory.length).toBe(0);
  });

  it('clears full match history and clears active game', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'Match To Clear',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      players: [{ id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' }],
    });
    store.endMatchManually();
    expect(useGameStore.getState().matchHistory.length).toBe(1);

    store.clearHistory();
    expect(useGameStore.getState().matchHistory.length).toBe(0);

    store.clearActiveGame();
    expect(useGameStore.getState().activeGame).toBeNull();
    expect(useGameStore.getState().viewMode).toBe('HOME');
  });

  it('sets viewMode and isPlayMode directly', () => {
    const store = useGameStore.getState();
    store.setViewMode('MATCH');
    expect(useGameStore.getState().viewMode).toBe('MATCH');

    store.setIsPlayMode(true);
    expect(useGameStore.getState().isPlayMode).toBe(true);

    store.setIsPlayMode(false);
    expect(useGameStore.getState().isPlayMode).toBe(false);
  });

  it('handles localStorage errors gracefully during clearHistory', () => {
    const store = useGameStore.getState();
    store.createGame({
      name: 'Error Handling Match',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      players: [{ id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' }],
    });
    store.endMatchManually();
    expect(useGameStore.getState().matchHistory.length).toBe(1);

    // Mock the global localStorage since vitest might be running in an environment without standard Storage prototype
    let removeCalled = false;

    vi.stubGlobal('localStorage', {
      removeItem: vi.fn(() => {
        removeCalled = true;
        throw new Error('Simulated localStorage error');
      }),
    });

    try {
      expect(() => store.clearHistory()).not.toThrow();
      expect(removeCalled).toBe(true);
      expect(useGameStore.getState().matchHistory.length).toBe(0);
    } finally {
      // Restore global localStorage
      vi.unstubAllGlobals();
    }
  });
});

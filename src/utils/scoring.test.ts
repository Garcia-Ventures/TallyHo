import { describe, expect, it } from 'vitest';
import { GameSession, Player } from '../types/game';
import {
  calculateGameHighlights,
  calculatePlayerTotals,
  checkWinCondition,
  getSortedPlayers,
  shouldAdvanceRound,
} from './scoring';

describe('scoring utility', () => {
  const mockPlayers: Player[] = [
    { id: 'p1', name: 'Alice', color: '#E5A93C', initials: 'A' },
    { id: 'p2', name: 'Bob', color: '#6A9C78', initials: 'B' },
  ];

  const mockGame: GameSession = {
    id: 'game_1',
    name: 'Test Rummy',
    scoringMode: 'RACE_HIGH',
    roundScoringType: 'EVERY_PLAYER',
    targetScore: 100,
    players: mockPlayers,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rounds: [
      {
        roundNumber: 1,
        timestamp: new Date().toISOString(),
        scores: {
          p1: { playerId: 'p1', points: 40, bonusPoints: 10, penaltyPoints: 0 },
          p2: { playerId: 'p2', points: 20, bonusPoints: 0, penaltyPoints: 5 },
        },
      },
      {
        roundNumber: 2,
        timestamp: new Date().toISOString(),
        scores: {
          p1: { playerId: 'p1', points: 60, bonusPoints: 0, penaltyPoints: 0 },
          p2: { playerId: 'p2', points: 30, bonusPoints: 0, penaltyPoints: 0 },
        },
      },
    ],
  };

  it('calculates player net totals correctly', () => {
    const totals = calculatePlayerTotals(mockGame);
    // p1: (40 + 10 - 0) + (60 + 0 - 0) = 110
    // p2: (20 + 0 - 5) + (30 + 0 - 0) = 45
    expect(totals['p1']).toBe(110);
    expect(totals['p2']).toBe(45);
  });

  it('sorts players correctly in RACE_HIGH mode', () => {
    const sorted = getSortedPlayers(mockGame);
    expect(sorted[0].id).toBe('p1');
    expect(sorted[1].id).toBe('p2');
  });

  it('sorts players correctly in RACE_LOW mode', () => {
    const lowGame: GameSession = { ...mockGame, scoringMode: 'RACE_LOW' };
    const sorted = getSortedPlayers(lowGame);
    expect(sorted[0].id).toBe('p2');
    expect(sorted[1].id).toBe('p1');
  });

  it('detects win condition when target score is reached in RACE_HIGH mode', () => {
    const winResult = checkWinCondition(mockGame);
    expect(winResult.hasWinner).toBe(true);
    expect(winResult.winnerId).toBe('p1');
  });

  it('determines when round should advance for EVERY_PLAYER mode', () => {
    const incompleteScores = {
      p1: { playerId: 'p1', points: 10 },
    };
    expect(shouldAdvanceRound(mockGame, incompleteScores)).toBe(false);

    const completeScores = {
      p1: { playerId: 'p1', points: 10 },
      p2: { playerId: 'p2', points: 5 },
    };
    expect(shouldAdvanceRound(mockGame, completeScores)).toBe(true);
  });

  it('always advances round for SINGLE_WINNER mode', () => {
    const singleWinnerGame: GameSession = { ...mockGame, roundScoringType: 'SINGLE_WINNER' };
    const incompleteScores = {
      p1: { playerId: 'p1', points: 50 },
    };
    expect(shouldAdvanceRound(singleWinnerGame, incompleteScores)).toBe(true);
  });

  it('generates match highlights correctly', () => {
    const highlights = calculateGameHighlights(mockGame);
    expect(highlights.maxSingleRoundScore).toBe(60);
    expect(highlights.maxSingleRoundPlayer?.name).toBe('Alice');
    expect(highlights.winningMargin).toBe(65); // 110 - 45 = 65
    expect(highlights.highlights.length).toBe(2);
  });
});

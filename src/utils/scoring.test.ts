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

  describe('calculatePlayerTotals', () => {
    it('calculates player net totals correctly', () => {
      const totals = calculatePlayerTotals(mockGame);
      // p1: (40 + 10 - 0) + (60 + 0 - 0) = 110
      // p2: (20 + 0 - 5) + (30 + 0 - 0) = 45
      expect(totals['p1']).toBe(110);
      expect(totals['p2']).toBe(45);
    });

    it('handles negative net totals when penalties exceed points', () => {
      const penaltyGame: GameSession = {
        ...mockGame,
        rounds: [
          {
            roundNumber: 1,
            timestamp: new Date().toISOString(),
            scores: {
              p1: { playerId: 'p1', points: 10, bonusPoints: 0, penaltyPoints: 50 },
            },
          },
        ],
      };
      const totals = calculatePlayerTotals(penaltyGame);
      expect(totals['p1']).toBe(-40);
      expect(totals['p2']).toBe(0);
    });

    it('handles empty rounds and players with no score entries', () => {
      const emptyGame: GameSession = {
        ...mockGame,
        rounds: [],
      };
      const totals = calculatePlayerTotals(emptyGame);
      expect(totals['p1']).toBe(0);
      expect(totals['p2']).toBe(0);
    });

    it('safely ignores scores for player IDs not in the player roster', () => {
      const alienGame: GameSession = {
        ...mockGame,
        rounds: [
          {
            roundNumber: 1,
            timestamp: new Date().toISOString(),
            scores: {
              unknown_player: { playerId: 'unknown_player', points: 100 },
            },
          },
        ],
      };
      const totals = calculatePlayerTotals(alienGame);
      expect(totals['p1']).toBe(0);
      expect(totals['p2']).toBe(0);
      expect(totals['unknown_player']).toBeUndefined();
    });
  });

  describe('getSortedPlayers', () => {
    it('sorts players correctly in RACE_HIGH mode (highest score first)', () => {
      const sorted = getSortedPlayers(mockGame);
      expect(sorted[0].id).toBe('p1');
      expect(sorted[1].id).toBe('p2');
    });

    it('sorts players correctly in RACE_LOW mode (lowest score first)', () => {
      const lowGame: GameSession = { ...mockGame, scoringMode: 'RACE_LOW' };
      const sorted = getSortedPlayers(lowGame);
      expect(sorted[0].id).toBe('p2');
      expect(sorted[1].id).toBe('p1');
    });

    it('handles ties gracefully by maintaining player order', () => {
      const tiedGame: GameSession = {
        ...mockGame,
        rounds: [
          {
            roundNumber: 1,
            timestamp: new Date().toISOString(),
            scores: {
              p1: { playerId: 'p1', points: 50 },
              p2: { playerId: 'p2', points: 50 },
            },
          },
        ],
      };
      const sortedHigh = getSortedPlayers(tiedGame);
      expect(sortedHigh.length).toBe(2);
      expect(sortedHigh.map((p) => p.id)).toEqual(['p1', 'p2']);
    });
  });

  describe('checkWinCondition', () => {
    it('detects win condition when target score is reached in RACE_HIGH mode', () => {
      const winResult = checkWinCondition(mockGame);
      expect(winResult.hasWinner).toBe(true);
      expect(winResult.winnerId).toBe('p1');
    });

    it('returns no winner when target score is not yet met in RACE_HIGH', () => {
      const ongoingGame: GameSession = {
        ...mockGame,
        targetScore: 500,
      };
      const winResult = checkWinCondition(ongoingGame);
      expect(winResult.hasWinner).toBe(false);
      expect(winResult.winnerId).toBe('');
    });

    it('returns no winner when game state is far from the target score', () => {
      const farGame: GameSession = {
        ...mockGame,
        targetScore: 10000,
        rounds: [
          { roundNumber: 1, timestamp: new Date().toISOString(), scores: { p1: { playerId: 'p1', points: 1 } } },
        ],
      };
      const winResult = checkWinCondition(farGame);
      expect(winResult.hasWinner).toBe(false);
      expect(winResult.winnerId).toBe('');
    });

    it('returns no winner when targetScore is set but scoringMode is FIXED_ROUNDS (fallthrough)', () => {
      // Tests the fallthrough branch where targetScore is truthy but scoringMode is not RACE_HIGH or RACE_LOW.
      const invalidStateGame: GameSession = {
        ...mockGame,
        targetScore: 100,
        scoringMode: 'FIXED_ROUNDS',
        targetRounds: 1, // Even though targetRounds is met, it should fall through due to targetScore
        rounds: [
          { roundNumber: 1, timestamp: new Date().toISOString(), scores: { p1: { playerId: 'p1', points: 100 } } },
        ],
      };
      const winResult = checkWinCondition(invalidStateGame);
      expect(winResult.hasWinner).toBe(false);
      expect(winResult.winnerId).toBe('');
    });

    it('detects win condition in RACE_LOW mode when any player reaches or exceeds targetScore', () => {
      // In RACE_LOW (e.g. Hearts), when any player hits 100+, the player with LOWEST score wins!
      const heartsGame: GameSession = {
        ...mockGame,
        scoringMode: 'RACE_LOW',
        targetScore: 100,
      };
      const winResult = checkWinCondition(heartsGame);
      expect(winResult.hasWinner).toBe(true);
      // p1 has 110 (exceeded), p2 has 45 (lowest score) -> p2 is the winner!
      expect(winResult.winnerId).toBe('p2');
    });

    it('returns no winner in RACE_LOW when no player has reached targetScore', () => {
      const heartsGame: GameSession = {
        ...mockGame,
        scoringMode: 'RACE_LOW',
        targetScore: 200,
      };
      const winResult = checkWinCondition(heartsGame);
      expect(winResult.hasWinner).toBe(false);
      expect(winResult.winnerId).toBe('');
    });

    it('detects win condition when targetRounds (FIXED_ROUNDS) limit is met', () => {
      const fixedRoundsGame: GameSession = {
        ...mockGame,
        targetScore: undefined,
        targetRounds: 2,
        scoringMode: 'FIXED_ROUNDS',
      };
      const winResult = checkWinCondition(fixedRoundsGame);
      expect(winResult.hasWinner).toBe(true);
      expect(winResult.winnerId).toBe('p1');
    });

    it('returns no winner when completed rounds are fewer than targetRounds', () => {
      const fixedRoundsGame: GameSession = {
        ...mockGame,
        targetScore: undefined,
        targetRounds: 5,
        scoringMode: 'FIXED_ROUNDS',
      };
      const winResult = checkWinCondition(fixedRoundsGame);
      expect(winResult.hasWinner).toBe(false);
      expect(winResult.winnerId).toBe('');
    });

    it('ignores empty rounds when counting completed rounds against targetRounds', () => {
      const fixedRoundsGame: GameSession = {
        ...mockGame,
        targetScore: undefined,
        targetRounds: 2,
        rounds: [
          { roundNumber: 1, timestamp: new Date().toISOString(), scores: { p1: { playerId: 'p1', points: 10 } } },
          { roundNumber: 2, timestamp: new Date().toISOString(), scores: {} }, // empty round
        ],
      };
      const winResult = checkWinCondition(fixedRoundsGame);
      expect(winResult.hasWinner).toBe(false);
    });

    it('returns no winner when neither targetScore nor targetRounds is specified', () => {
      const endlessGame: GameSession = {
        ...mockGame,
        targetScore: undefined,
        targetRounds: undefined,
      };
      const winResult = checkWinCondition(endlessGame);
      expect(winResult.hasWinner).toBe(false);
      expect(winResult.winnerId).toBe('');
    });
  });

  describe('shouldAdvanceRound', () => {
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
  });

  describe('calculateGameHighlights', () => {
    it('generates match highlights correctly', () => {
      const highlights = calculateGameHighlights(mockGame);
      expect(highlights.maxSingleRoundScore).toBe(60);
      expect(highlights.maxSingleRoundPlayer?.name).toBe('Alice');
      expect(highlights.winningMargin).toBe(65); // 110 - 45 = 65
      expect(highlights.highlights.length).toBe(2);
    });

    it('handles games with 0 points without generating empty highlight cards', () => {
      const zeroGame: GameSession = {
        ...mockGame,
        rounds: [
          {
            roundNumber: 1,
            timestamp: new Date().toISOString(),
            scores: {
              p1: { playerId: 'p1', points: 0 },
              p2: { playerId: 'p2', points: 0 },
            },
          },
        ],
      };
      const highlights = calculateGameHighlights(zeroGame);
      expect(highlights.maxSingleRoundScore).toBe(0);
      expect(highlights.winningMargin).toBe(0);
      // Highlights will only include winning margin if 2 players exist
      expect(highlights.highlights.some((h) => h.title === 'Highest Single Round')).toBe(false);
    });

    it('handles single player game sessions without crashing', () => {
      const soloGame: GameSession = {
        ...mockGame,
        players: [{ id: 'p1', name: 'Alice', color: '#E5A93C', initials: 'A' }],
        rounds: [
          {
            roundNumber: 1,
            timestamp: new Date().toISOString(),
            scores: {
              p1: { playerId: 'p1', points: 42 },
            },
          },
        ],
      };
      const highlights = calculateGameHighlights(soloGame);
      expect(highlights.winningMargin).toBe(0);
      expect(highlights.maxSingleRoundScore).toBe(42);
      expect(highlights.maxSingleRoundPlayer?.name).toBe('Alice');
    });
  });
});

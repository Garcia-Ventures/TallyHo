import { create } from 'zustand';
import { trackEvent } from '../services/analytics';
import { storage } from '../services/storage';
import { GameSession, Player, Round, RoundScore, RoundScoringType, ScoringMode } from '../types/game';
import { checkWinCondition, shouldAdvanceRound } from '../utils/scoring';
import { trackMatchEvent } from '../utils/sentry';

interface GameState {
  activeGame: GameSession | null;
  matchHistory: GameSession[];
  viewMode: 'HOME' | 'MATCH';
  isPlayMode: boolean;

  // Actions
  loadInitialData: () => void;
  setViewMode: (mode: 'HOME' | 'MATCH') => void;
  setIsPlayMode: (isPlay: boolean) => void;
  createGame: (setup: {
    name: string;
    presetId?: string;
    scoringMode: ScoringMode;
    roundScoringType: RoundScoringType;
    targetScore?: number;
    targetRounds?: number;
    players: Player[];
  }) => void;
  submitRoundScore: (score: RoundScore) => { hasWinner: boolean; winnerId: string };
  reorderPlayers: (players: Player[]) => void;
  updateRounds: (rounds: Round[]) => void;
  endMatchManually: () => void;
  deleteMatchFromHistory: (gameId: string) => void;
  clearHistory: () => void;
  clearActiveGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  activeGame: null,
  matchHistory: [],
  viewMode: 'HOME',
  isPlayMode: false,

  loadInitialData: () => {
    const savedActive = storage.getActiveGame();
    const savedHistory = storage.getMatchHistory();
    set({
      activeGame: savedActive,
      matchHistory: savedHistory,
      viewMode: savedActive ? 'MATCH' : 'HOME',
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setIsPlayMode: (isPlay) => set({ isPlayMode: isPlay }),

  createGame: (setup) => {
    const initialRound: Round = {
      roundNumber: 1,
      timestamp: new Date().toISOString(),
      scores: {},
    };

    const newGame: GameSession = {
      id: `game_${Date.now()}`,
      name: setup.name,
      presetId: setup.presetId,
      scoringMode: setup.scoringMode,
      roundScoringType: setup.roundScoringType,
      targetScore: setup.targetScore,
      targetRounds: setup.targetRounds,
      players: setup.players,
      rounds: [initialRound],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentTurnIndex: 0,
    };

    storage.saveActiveGame(newGame);
    trackMatchEvent('match_created', {
      gameId: newGame.id,
      name: newGame.name,
      presetId: newGame.presetId,
      playerCount: newGame.players.length,
    });
    trackEvent('game_started', {
      preset: newGame.presetId || 'custom',
      player_count: newGame.players.length,
      scoring_mode: newGame.scoringMode,
      target_score: newGame.targetScore,
    });

    set({
      activeGame: newGame,
      viewMode: 'MATCH',
      isPlayMode: true,
    });
  },

  submitRoundScore: (score) => {
    const { activeGame } = get();
    if (!activeGame) {
      return { hasWinner: false, winnerId: '' };
    }

    const currentRounds = [...activeGame.rounds];
    if (currentRounds.length === 0) {
      currentRounds.push({
        roundNumber: 1,
        timestamp: new Date().toISOString(),
        scores: {},
      });
    }

    const latestRoundIdx = currentRounds.length - 1;
    const latestRound = { ...currentRounds[latestRoundIdx] };
    const updatedScores = { ...latestRound.scores, [score.playerId]: score };
    latestRound.scores = updatedScores;
    currentRounds[latestRoundIdx] = latestRound;

    trackEvent('round_submitted', {
      round_number: latestRound.roundNumber,
      scoring_mode: activeGame.scoringMode,
    });

    if (shouldAdvanceRound(activeGame, updatedScores)) {
      currentRounds.push({
        roundNumber: latestRound.roundNumber + 1,
        timestamp: new Date().toISOString(),
        scores: {},
      });
    }

    const updatedGame: GameSession = {
      ...activeGame,
      rounds: currentRounds,
      updatedAt: new Date().toISOString(),
    };

    storage.saveActiveGame(updatedGame);
    const winResult = checkWinCondition(updatedGame);

    if (winResult.hasWinner) {
      const completedGame: GameSession = {
        ...updatedGame,
        status: 'COMPLETED',
        winnerId: winResult.winnerId,
      };
      storage.archiveMatch(completedGame);
      const updatedHistory = storage.getMatchHistory();
      trackEvent('match_completed', {
        preset: completedGame.presetId || 'custom',
        total_rounds: completedGame.rounds.length,
        player_count: completedGame.players.length,
      });
      set({
        activeGame: completedGame,
        matchHistory: updatedHistory,
      });
    } else {
      set({ activeGame: updatedGame });
    }

    return winResult;
  },

  reorderPlayers: (updatedPlayers) => {
    const { activeGame } = get();
    if (!activeGame) {
      return;
    }

    const updatedGame: GameSession = {
      ...activeGame,
      players: updatedPlayers,
      updatedAt: new Date().toISOString(),
    };
    storage.saveActiveGame(updatedGame);
    set({ activeGame: updatedGame });
  },

  updateRounds: (updatedRounds) => {
    const { activeGame } = get();
    if (!activeGame) {
      return;
    }

    const updatedGame: GameSession = {
      ...activeGame,
      rounds: updatedRounds,
      updatedAt: new Date().toISOString(),
    };
    storage.saveActiveGame(updatedGame);
    set({ activeGame: updatedGame });
  },

  endMatchManually: () => {
    const { activeGame } = get();
    if (!activeGame) {
      return;
    }

    const completedGame: GameSession = {
      ...activeGame,
      status: 'COMPLETED',
    };
    storage.archiveMatch(completedGame);
    const updatedHistory = storage.getMatchHistory();
    trackEvent('match_completed', {
      preset: completedGame.presetId || 'custom',
      total_rounds: completedGame.rounds.length,
      player_count: completedGame.players.length,
      manual_end: true,
    });
    set({
      activeGame: completedGame,
      matchHistory: updatedHistory,
    });
  },

  deleteMatchFromHistory: (gameId) => {
    storage.deleteMatch(gameId);
    set({ matchHistory: storage.getMatchHistory() });
  },

  clearHistory: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('tallyho_match_history');
      } catch {}
    } else if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('tallyho_match_history');
      } catch {}
    }
    set({ matchHistory: [] });
  },

  clearActiveGame: () => {
    storage.clearActiveGame();
    set({ activeGame: null, viewMode: 'HOME' });
  },
}));

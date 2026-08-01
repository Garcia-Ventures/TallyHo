import { useEffect, useState } from 'react';
import { GameOverModal } from './components/GameOverModal';
import { GameSetupModal } from './components/GameSetupModal';
import { HistoryLogModal } from './components/HistoryLogModal';
import { HomeView } from './components/HomeView';
import { Navbar } from './components/Navbar';
import { PlayModeView } from './components/PlayModeView';
import { RoundHistoryModal } from './components/RoundHistoryModal';
import { ScoreboardView } from './components/ScoreboardView';
import { ScoreKeypadModal } from './components/ScoreKeypadModal';

import { soundEffects } from './services/audio';
import { storage } from './services/storage';
import { GamePreset, GameSession, Player, Round, RoundScore, RoundScoringType, ScoringMode } from './types/game';

export function App() {
  const [viewMode, setViewMode] = useState<'HOME' | 'MATCH'>('HOME');
  const [isPlayMode, setIsPlayMode] = useState<boolean>(false);

  const [activeGame, setActiveGame] = useState<GameSession | null>(null);
  const [matchHistory, setMatchHistory] = useState<GameSession[]>([]);

  // Modals
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<GamePreset | null>(null);

  const [keypadPlayer, setKeypadPlayer] = useState<Player | null>(null);
  const [isRoundHistoryOpen, setIsRoundHistoryOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isHistoryLogOpen, setIsHistoryLogOpen] = useState(false);

  useEffect(() => {
    const savedActive = storage.getActiveGame();
    if (savedActive) {
      setActiveGame(savedActive);
      setViewMode('MATCH');
    }
    setMatchHistory(storage.getMatchHistory());
  }, []);

  const handleStartSetup = (preset?: GamePreset) => {
    setSelectedPreset(preset || null);
    setIsSetupOpen(true);
  };

  const handleCreateGame = (setup: {
    name: string;
    presetId?: string;
    scoringMode: ScoringMode;
    roundScoringType: RoundScoringType;
    targetScore?: number;
    targetRounds?: number;
    players: Player[];
  }) => {
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

    setActiveGame(newGame);
    storage.saveActiveGame(newGame);
    setViewMode('MATCH');
    setIsPlayMode(true);
  };

  const handleResumeGame = () => {
    if (activeGame) {
      setViewMode('MATCH');
      setIsPlayMode(false);
    }
  };

  const togglePlayModeFlip = (targetIsPlayMode: boolean) => {
    soundEffects.playPaperRustle();
    setIsPlayMode(targetIsPlayMode);
  };

  const handleSubmitRoundScore = (score: RoundScore) => {
    if (!activeGame) {
      return;
    }

    soundEffects.playPenClick();
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

    const isSingleWinner = activeGame.roundScoringType === 'SINGLE_WINNER';

    // If SINGLE_WINNER or all players logged for EVERY_PLAYER, advance round
    const shouldAdvanceRound = isSingleWinner || activeGame.players.every((p) => Boolean(updatedScores[p.id]));

    if (shouldAdvanceRound) {
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

    setActiveGame(updatedGame);
    storage.saveActiveGame(updatedGame);

    checkWinCondition(updatedGame);
  };

  const checkWinCondition = (game: GameSession) => {
    const totals: Record<string, number> = {};
    game.players.forEach((p) => (totals[p.id] = 0));
    game.rounds.forEach((r) => {
      Object.values(r.scores).forEach((s) => {
        const net = s.points + (s.bonusPoints || 0) - (s.penaltyPoints || 0);
        totals[s.playerId] = (totals[s.playerId] || 0) + net;
      });
    });

    let hasWinner = false;
    let winnerId = '';

    if (game.targetScore) {
      if (game.scoringMode === 'RACE_HIGH') {
        const leader = game.players.find((p) => (totals[p.id] || 0) >= game.targetScore!);
        if (leader) {
          hasWinner = true;
          winnerId = leader.id;
        }
      } else if (game.scoringMode === 'RACE_LOW') {
        const exceeded = game.players.some((p) => (totals[p.id] || 0) >= game.targetScore!);
        if (exceeded) {
          hasWinner = true;
          const sorted = [...game.players].sort((a, b) => (totals[a.id] || 0) - (totals[b.id] || 0));
          winnerId = sorted[0]?.id || '';
        }
      }
    } else if (game.targetRounds) {
      const completedRounds = game.rounds.filter((r) => Object.keys(r.scores).length > 0);
      if (completedRounds.length >= game.targetRounds) {
        hasWinner = true;
        const sorted = [...game.players].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));
        winnerId = sorted[0]?.id || '';
      }
    }

    if (hasWinner) {
      soundEffects.playVictoryFanfare();
      const completedGame: GameSession = {
        ...game,
        status: 'COMPLETED',
        winnerId,
      };
      setActiveGame(completedGame);
      storage.archiveMatch(completedGame);
      setMatchHistory(storage.getMatchHistory());
      setIsGameOverOpen(true);
    }
  };

  const handleReorderPlayers = (updatedPlayers: Player[]) => {
    if (!activeGame) {
      return;
    }
    const updatedGame: GameSession = {
      ...activeGame,
      players: updatedPlayers,
      updatedAt: new Date().toISOString(),
    };
    setActiveGame(updatedGame);
    storage.saveActiveGame(updatedGame);
  };

  const handleUpdateRounds = (updatedRounds: Round[]) => {
    if (!activeGame) {
      return;
    }
    const updatedGame: GameSession = {
      ...activeGame,
      rounds: updatedRounds,
      updatedAt: new Date().toISOString(),
    };
    setActiveGame(updatedGame);
    storage.saveActiveGame(updatedGame);
  };

  const handleEndMatchManually = () => {
    if (!activeGame) {
      return;
    }
    soundEffects.playVictoryFanfare();
    const completedGame: GameSession = {
      ...activeGame,
      status: 'COMPLETED',
    };
    setActiveGame(completedGame);
    storage.archiveMatch(completedGame);
    setMatchHistory(storage.getMatchHistory());
    setIsGameOverOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF7] font-sans text-[#2C302E]">
      <Navbar
        hasActiveGame={Boolean(activeGame)}
        onNewGame={() => handleStartSetup()}
        onViewHistory={() => setIsHistoryLogOpen(true)}
        onReturnHome={() => setViewMode('HOME')}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
        {viewMode === 'HOME' && (
          <HomeView
            activeGame={activeGame}
            matchHistory={matchHistory}
            onSelectPreset={(p) => handleStartSetup(p)}
            onResumeGame={handleResumeGame}
          />
        )}

        {viewMode === 'MATCH' && activeGame && (
          /* 3D Paper Flip Card Container: Front (Dashboard) & Back (Play Mode) */
          <div className="perspective-1000 min-h-[600px] w-full">
            <div
              className={`preserve-3d relative h-full w-full transition-transform duration-700 ease-in-out ${
                isPlayMode ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF PAPER SHEET: Match Dashboard */}
              <div className={`w-full backface-hidden ${isPlayMode ? 'pointer-events-none' : ''}`}>
                <ScoreboardView
                  game={activeGame}
                  onOpenScoreKeypad={(player) => setKeypadPlayer(player)}
                  onOpenRoundHistory={() => setIsRoundHistoryOpen(true)}
                  onFlipToPlayMode={() => togglePlayModeFlip(true)}
                  onEndMatch={handleEndMatchManually}
                  onReorderPlayers={handleReorderPlayers}
                />
              </div>

              {/* BACK OF PAPER SHEET: Play Mode */}
              <div
                className={`absolute top-0 left-0 w-full rotate-y-180 backface-hidden ${
                  !isPlayMode ? 'pointer-events-none' : ''
                }`}
              >
                <PlayModeView
                  game={activeGame}
                  onScoreSubmitted={handleSubmitRoundScore}
                  onFlipToDashboard={() => togglePlayModeFlip(false)}
                  onEndMatch={handleEndMatchManually}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#E5E0D8] bg-[#F7F4EE]/50 py-4 text-center text-xs text-[#5A605C]">
        Tally Ho — Your digital pencil & paper for game night. Crafted with GV Tech Design Tokens.
      </footer>

      {/* Modals */}
      <GameSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        preset={selectedPreset}
        onStartGame={handleCreateGame}
      />

      {keypadPlayer && activeGame && (
        <ScoreKeypadModal
          isOpen={Boolean(keypadPlayer)}
          onClose={() => setKeypadPlayer(null)}
          player={keypadPlayer}
          onSubmitScore={handleSubmitRoundScore}
        />
      )}

      {activeGame && (
        <RoundHistoryModal
          isOpen={isRoundHistoryOpen}
          onClose={() => setIsRoundHistoryOpen(false)}
          game={activeGame}
          onUpdateRounds={handleUpdateRounds}
        />
      )}

      {activeGame && (
        <GameOverModal
          isOpen={isGameOverOpen}
          onClose={() => {
            setIsGameOverOpen(false);
            setActiveGame(null);
            setViewMode('HOME');
          }}
          game={activeGame}
          onRematch={() => {
            setIsGameOverOpen(false);
            handleCreateGame({
              name: activeGame.name,
              presetId: activeGame.presetId,
              scoringMode: activeGame.scoringMode,
              roundScoringType: activeGame.roundScoringType,
              targetScore: activeGame.targetScore,
              targetRounds: activeGame.targetRounds,
              players: activeGame.players,
            });
          }}
        />
      )}

      <HistoryLogModal
        isOpen={isHistoryLogOpen}
        onClose={() => setIsHistoryLogOpen(false)}
        history={matchHistory}
        onClearHistory={() => {
          localStorage.removeItem('tallyho_match_history');
          setMatchHistory([]);
        }}
      />
    </div>
  );
}

export default App;

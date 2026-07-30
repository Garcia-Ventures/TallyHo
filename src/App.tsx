import { useEffect, useState } from 'react';
import { GameOverModal } from './components/GameOverModal';
import { GameSetupModal } from './components/GameSetupModal';
import { HistoryLogModal } from './components/HistoryLogModal';
import { HomeView } from './components/HomeView';
import { Navbar } from './components/Navbar';
import { RoundHistoryModal } from './components/RoundHistoryModal';
import { ScoreboardView } from './components/ScoreboardView';
import { ScoreKeypadModal } from './components/ScoreKeypadModal';

import { storage } from './services/storage';
import { GamePreset, GameSession, Player, Round, RoundScore } from './types/game';

export function App() {
  const [view, setView] = useState<'HOME' | 'SCOREBOARD'>('HOME');
  const [activeGame, setActiveGame] = useState<GameSession | null>(null);
  const [matchHistory, setMatchHistory] = useState<GameSession[]>([]);

  // Modals state
  const [setupModalOpen, setSetupModalOpen] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<GamePreset | null>(null);

  const [keypadPlayer, setKeypadPlayer] = useState<Player | null>(null);
  const [roundHistoryOpen, setRoundHistoryOpen] = useState<boolean>(false);
  const [gameOverOpen, setGameOverOpen] = useState<boolean>(false);
  const [historyArchiveOpen, setHistoryArchiveOpen] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    const existing = storage.getActiveGame();
    if (existing && existing.status === 'ACTIVE') {
      setActiveGame(existing);
    }
    setMatchHistory(storage.getMatchHistory());
  }, []);

  // Sync active game to storage on change
  const updateActiveGame = (updated: GameSession) => {
    setActiveGame(updated);
    storage.saveActiveGame(updated);
  };

  // Start new match
  const handleStartNewGame = (game: GameSession) => {
    updateActiveGame(game);
    setSetupModalOpen(false);
    setView('SCOREBOARD');
  };

  // Submit round score from keypad
  const handleSubmitRoundScore = (score: RoundScore) => {
    if (!activeGame) {
      return;
    }

    const currentRounds = [...activeGame.rounds];
    const latestRoundIndex = currentRounds.length > 0 ? currentRounds.length - 1 : 0;
    const latestRound = currentRounds[latestRoundIndex];

    let updatedRounds: Round[] = [];

    // Check if current round has incomplete entries or if we create a new round
    if (latestRound && !latestRound.scores[score.playerId]) {
      // Append to current round
      const updatedScores = { ...latestRound.scores, [score.playerId]: score };
      currentRounds[latestRoundIndex] = { ...latestRound, scores: updatedScores };
      updatedRounds = currentRounds;
    } else {
      // Create new round
      const newRound: Round = {
        roundNumber: currentRounds.length + 1,
        timestamp: new Date().toISOString(),
        scores: { [score.playerId]: score },
      };
      updatedRounds = [...currentRounds, newRound];
    }

    const updatedGame: GameSession = {
      ...activeGame,
      rounds: updatedRounds,
      updatedAt: new Date().toISOString(),
    };

    updateActiveGame(updatedGame);
  };

  // Update rounds from history editor
  const handleUpdateRounds = (updatedRounds: Round[]) => {
    if (!activeGame) {
      return;
    }
    const updatedGame = { ...activeGame, rounds: updatedRounds, updatedAt: new Date().toISOString() };
    updateActiveGame(updatedGame);
  };

  // End match & victory
  const handleEndGame = () => {
    if (!activeGame) {
      return;
    }

    // Calculate winner
    const totals: Record<string, number> = {};
    activeGame.players.forEach((p) => (totals[p.id] = 0));
    activeGame.rounds.forEach((r) => {
      Object.entries(r.scores).forEach(([pId, s]) => {
        if (totals[pId] !== undefined && s) {
          totals[pId] += (s.points || 0) + (s.bonusPoints || 0) - (s.penaltyPoints || 0);
        }
      });
    });

    const sorted = [...activeGame.players].sort((a, b) =>
      activeGame.scoringMode === 'RACE_LOW' ? totals[a.id] - totals[b.id] : totals[b.id] - totals[a.id],
    );

    const winnerId = sorted[0]?.id;

    const completedGame: GameSession = {
      ...activeGame,
      status: 'COMPLETED',
      winnerId,
      updatedAt: new Date().toISOString(),
    };

    setActiveGame(completedGame);
    storage.saveMatchToHistory(completedGame);
    storage.clearActiveGame();
    setMatchHistory(storage.getMatchHistory());
    setGameOverOpen(true);
  };

  // Rematch with same players
  const handleRematch = () => {
    if (!activeGame) {
      return;
    }
    const newGame: GameSession = {
      id: 'game_' + Date.now(),
      name: activeGame.name,
      presetId: activeGame.presetId,
      scoringMode: activeGame.scoringMode,
      targetScore: activeGame.targetScore,
      targetRounds: activeGame.targetRounds,
      players: activeGame.players,
      rounds: [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGameOverOpen(false);
    handleStartNewGame(newGame);
  };

  // Delete match from history
  const handleDeleteMatchFromHistory = (id: string) => {
    storage.deleteMatchFromHistory(id);
    setMatchHistory(storage.getMatchHistory());
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF7] text-[#2C302E]">
      {/* Navigation Header */}
      <Navbar
        hasActiveGame={Boolean(activeGame && activeGame.status === 'ACTIVE')}
        onOpenNewGame={() => {
          setSelectedPreset(null);
          setSetupModalOpen(true);
        }}
        onOpenHistory={() => setHistoryArchiveOpen(true)}
        onOpenSettings={() => {}}
        onReturnHome={() => setView('HOME')}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {view === 'HOME' ? (
          <HomeView
            activeGame={activeGame}
            onResumeActiveGame={() => setView('SCOREBOARD')}
            onSelectPreset={(preset) => {
              setSelectedPreset(preset);
              setSetupModalOpen(true);
            }}
            onStartCustomGame={() => {
              setSelectedPreset(null);
              setSetupModalOpen(true);
            }}
            onOpenHistory={() => setHistoryArchiveOpen(true)}
            recentGames={matchHistory}
          />
        ) : activeGame ? (
          <ScoreboardView
            game={activeGame}
            onOpenKeypad={(player) => setKeypadPlayer(player)}
            onOpenRoundHistory={() => setRoundHistoryOpen(true)}
            onEndGame={handleEndGame}
          />
        ) : (
          <div className="p-12 text-center text-base text-[#5A605C]">
            No active game match found. Start a new match to begin scorekeeping!
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E0D8] bg-[#F7F4EE]/50 py-6 text-center text-xs font-semibold text-[#5A605C]">
        <p>Tally Ho — Digital Pencil & Paper for Game Night • Crafted with @gv-tech/design-system</p>
      </footer>

      {/* Setup Modal */}
      <GameSetupModal
        initialPreset={selectedPreset}
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onStartGame={handleStartNewGame}
      />

      {/* Keypad Modal */}
      <ScoreKeypadModal
        player={keypadPlayer}
        roundNumber={(activeGame?.rounds.length || 0) + 1}
        isOpen={Boolean(keypadPlayer)}
        onClose={() => setKeypadPlayer(null)}
        onSubmitScore={handleSubmitRoundScore}
      />

      {/* Round History Modal */}
      {activeGame && (
        <RoundHistoryModal
          game={activeGame}
          isOpen={roundHistoryOpen}
          onClose={() => setRoundHistoryOpen(false)}
          onUpdateRounds={handleUpdateRounds}
        />
      )}

      {/* Game Over Celebration Modal */}
      {activeGame && (
        <GameOverModal
          game={activeGame}
          isOpen={gameOverOpen}
          onRematch={handleRematch}
          onReturnHome={() => {
            setGameOverOpen(false);
            setView('HOME');
          }}
        />
      )}

      {/* Match History Archive Modal */}
      <HistoryLogModal
        history={matchHistory}
        isOpen={historyArchiveOpen}
        onClose={() => setHistoryArchiveOpen(false)}
        onDeleteMatch={handleDeleteMatchFromHistory}
      />
    </div>
  );
}

export default App;

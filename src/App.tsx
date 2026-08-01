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
import { useGameStore } from './stores/useGameStore';
import { usePlayerLibraryStore } from './stores/usePlayerLibraryStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { GamePreset, Player, RoundScore } from './types/game';

export function App() {
  const {
    activeGame,
    matchHistory,
    viewMode,
    isPlayMode,
    loadInitialData,
    setViewMode,
    setIsPlayMode,
    createGame,
    submitRoundScore,
    reorderPlayers,
    updateRounds,
    endMatchManually,
    clearHistory,
    clearActiveGame,
  } = useGameStore();

  const { loadPlayers } = usePlayerLibraryStore();
  const { loadSettings } = useSettingsStore();

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<GamePreset | null>(null);

  const [keypadPlayer, setKeypadPlayer] = useState<Player | null>(null);
  const [isRoundHistoryOpen, setIsRoundHistoryOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isHistoryLogOpen, setIsHistoryLogOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
    loadPlayers();
    loadSettings();
  }, [loadInitialData, loadPlayers, loadSettings]);

  const handleStartSetup = (preset?: GamePreset) => {
    setSelectedPreset(preset || null);
    setIsSetupOpen(true);
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

  const handleSubmitScore = (score: RoundScore) => {
    soundEffects.playPenClick();
    const winResult = submitRoundScore(score);
    if (winResult.hasWinner) {
      soundEffects.playVictoryFanfare();
      setIsGameOverOpen(true);
    }
  };

  const handleEndMatch = () => {
    soundEffects.playVictoryFanfare();
    endMatchManually();
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
                  onEndMatch={handleEndMatch}
                  onReorderPlayers={reorderPlayers}
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
                  onScoreSubmitted={handleSubmitScore}
                  onFlipToDashboard={() => togglePlayModeFlip(false)}
                  onEndMatch={handleEndMatch}
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
        onStartGame={createGame}
      />

      {keypadPlayer && activeGame && (
        <ScoreKeypadModal
          isOpen={Boolean(keypadPlayer)}
          onClose={() => setKeypadPlayer(null)}
          player={keypadPlayer}
          onSubmitScore={handleSubmitScore}
        />
      )}

      {activeGame && (
        <RoundHistoryModal
          isOpen={isRoundHistoryOpen}
          onClose={() => setIsRoundHistoryOpen(false)}
          game={activeGame}
          onUpdateRounds={updateRounds}
        />
      )}

      {activeGame && (
        <GameOverModal
          isOpen={isGameOverOpen}
          onClose={() => {
            setIsGameOverOpen(false);
            clearActiveGame();
          }}
          game={activeGame}
          onRematch={() => {
            setIsGameOverOpen(false);
            createGame({
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
        onClearHistory={clearHistory}
      />
    </div>
  );
}

export default App;

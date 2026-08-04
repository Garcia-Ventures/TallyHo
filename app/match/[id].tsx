import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { FlipCardContainer } from '../../src/components/FlipCardContainer';
import { PlayModeView } from '../../src/components/PlayModeView';
import { ScoreboardView } from '../../src/components/ScoreboardView';
import { nativeSound } from '../../src/services/audio';
import { useGameStore } from '../../src/stores/useGameStore';
import { Player, RoundScore } from '../../src/types/game';

export default function MatchScreen() {
  const router = useRouter();
  const { activeGame, isPlayMode, setIsPlayMode, submitRoundScore, reorderPlayers, endMatchManually } = useGameStore();

  const [_, setSelectedKeypadPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (!activeGame) {
      router.dismissTo('/');
    }
  }, [activeGame, router]);

  if (!activeGame) {
    return null;
  }

  const handleOpenScoreKeypad = (player: Player) => {
    setSelectedKeypadPlayer(player);
    router.push({
      pathname: '/modal/keypad',
      params: { playerId: player.id },
    });
  };

  const handleOpenRoundHistory = () => {
    router.push('/modal/round-history');
  };

  const handleToggleFlip = (targetPlayMode: boolean) => {
    nativeSound.playPaperRustle();
    setIsPlayMode(targetPlayMode);
  };

  const handleSubmitScore = (score: RoundScore) => {
    nativeSound.playPenClick();
    const result = submitRoundScore(score);
    if (result.hasWinner) {
      router.push('/modal/game-over');
    }
  };

  const handleEndMatch = () => {
    endMatchManually();
    router.push('/modal/game-over');
  };

  return (
    <View className="bg-background flex-1">
      <FlipCardContainer
        isFlipped={isPlayMode}
        frontComponent={
          <ScoreboardView
            game={activeGame}
            onOpenScoreKeypad={handleOpenScoreKeypad}
            onOpenRoundHistory={handleOpenRoundHistory}
            onFlipToPlayMode={() => handleToggleFlip(true)}
            onEndMatch={handleEndMatch}
            onReorderPlayers={reorderPlayers}
          />
        }
        backComponent={
          <PlayModeView
            game={activeGame}
            onScoreSubmitted={handleSubmitScore}
            onFlipToDashboard={() => handleToggleFlip(false)}
            onEndMatch={handleEndMatch}
          />
        }
      />
    </View>
  );
}

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { FlipCardContainerNative } from '../../src/components/FlipCardContainer';
import { PlayModeViewNative } from '../../src/components/PlayModeView';
import { ScoreboardViewNative } from '../../src/components/ScoreboardView';
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
    router.push('/modal/history-log');
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
    <View className="flex-1 bg-[#FDFBF7]">
      <FlipCardContainerNative
        isFlipped={isPlayMode}
        frontComponent={
          <ScoreboardViewNative
            game={activeGame}
            onOpenScoreKeypad={handleOpenScoreKeypad}
            onOpenRoundHistory={handleOpenRoundHistory}
            onFlipToPlayMode={() => handleToggleFlip(true)}
            onEndMatch={handleEndMatch}
            onReorderPlayers={reorderPlayers}
          />
        }
        backComponent={
          <PlayModeViewNative
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

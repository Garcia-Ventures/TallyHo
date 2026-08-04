import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { ConfettiCelebrationNative } from '../../src/components/ConfettiCelebration.native';
import { GameOverModalNative } from '../../src/components/GameOverModal';
import { useGameStore } from '../../src/stores/useGameStore';

export default function GameOverModalRoute() {
  const router = useRouter();
  const { activeGame, createGame, clearActiveGame } = useGameStore();

  if (!activeGame) {
    return null;
  }

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <ConfettiCelebrationNative />
      <GameOverModalNative
        isOpen={true}
        onClose={() => {
          clearActiveGame();
          router.replace('/');
        }}
        game={activeGame}
        onRematch={() => {
          createGame({
            name: activeGame.name,
            presetId: activeGame.presetId,
            scoringMode: activeGame.scoringMode,
            roundScoringType: activeGame.roundScoringType,
            targetScore: activeGame.targetScore,
            targetRounds: activeGame.targetRounds,
            players: activeGame.players,
          });
          const newGame = useGameStore.getState().activeGame;
          if (newGame) {
            router.replace(`/match/${newGame.id}`);
          }
        }}
      />
    </View>
  );
}

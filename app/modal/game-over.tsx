import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { ConfettiCelebration } from '../../src/components/ConfettiCelebration';
import { GameOverModal } from '../../src/components/GameOverModal';
import { useGameStore } from '../../src/stores/useGameStore';

export default function GameOverModalRoute() {
  const router = useRouter();
  const { activeGame, createGame, clearActiveGame } = useGameStore();

  if (!activeGame) {
    return null;
  }

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <ConfettiCelebration />
      <GameOverModal
        isOpen={true}
        isRouteModal={true}
        onClose={() => {
          clearActiveGame();
          router.dismissTo('/');
        }}
        game={activeGame}
        onRematch={() => {
          const setup = {
            name: activeGame.name,
            presetId: activeGame.presetId,
            scoringMode: activeGame.scoringMode,
            roundScoringType: activeGame.roundScoringType,
            targetScore: activeGame.targetScore,
            targetRounds: activeGame.targetRounds,
            players: activeGame.players,
          };
          clearActiveGame();
          createGame(setup);
          const newGame = useGameStore.getState().activeGame;
          if (newGame) {
            router.dismissTo(`/match/${newGame.id}`);
          }
        }}
      />
    </View>
  );
}

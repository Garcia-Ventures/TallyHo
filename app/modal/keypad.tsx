import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { ScoreKeypadModalNative } from '../../src/components/ScoreKeypadModal.native';
import { useGameStore } from '../../src/stores/useGameStore';

export default function KeypadModalRoute() {
  const router = useRouter();
  const { playerId } = useLocalSearchParams<{ playerId?: string }>();
  const { activeGame, submitRoundScore } = useGameStore();

  const player = activeGame?.players.find((p) => p.id === playerId);

  if (!player || !activeGame) {
    return null;
  }

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <ScoreKeypadModalNative
        isOpen={true}
        isRouteModal={true}
        onClose={() => router.back()}
        player={player}
        onSubmitScore={(score) => {
          const result = submitRoundScore(score);
          if (result.hasWinner) {
            router.replace('/modal/game-over');
          } else {
            router.back();
          }
        }}
      />
    </View>
  );
}

import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { RoundHistoryModal } from '../../src/components/RoundHistoryModal';
import { useGameStore } from '../../src/stores/useGameStore';

export default function RoundHistoryModalRoute() {
  const router = useRouter();
  const { activeGame, updateRounds } = useGameStore();

  if (!activeGame) {
    return null;
  }

  return (
    <View className="bg-background flex-1">
      <RoundHistoryModal
        isOpen={true}
        isRouteModal={true}
        game={activeGame}
        onClose={() => router.back()}
        onUpdateRounds={(updated) => updateRounds(updated)}
      />
    </View>
  );
}

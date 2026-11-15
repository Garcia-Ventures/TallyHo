import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { RoundHistoryModal } from '../../src/components/RoundHistoryModal';
import { useGameStore } from '../../src/stores/useGameStore';

export default function RoundHistoryModalRoute() {
  const router = useRouter();
  const activeGame = useGameStore((state) => state.activeGame);
  const updateRounds = useGameStore((state) => state.updateRounds);

  if (!activeGame) {
    return null;
  }

  return (
    <View className="bg-background flex-1">
      <RoundHistoryModal
        game={activeGame}
        onClose={() => router.back()}
        onUpdateRounds={(updated) => updateRounds(updated)}
      />
    </View>
  );
}

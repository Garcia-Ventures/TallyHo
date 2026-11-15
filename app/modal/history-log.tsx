import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { HistoryLogModal } from '../../src/components/HistoryLogModal';
import { useGameStore } from '../../src/stores/useGameStore';

export default function HistoryLogModalRoute() {
  const router = useRouter();
  const matchHistory = useGameStore((state) => state.matchHistory);
  const clearHistory = useGameStore((state) => state.clearHistory);

  return (
    <View className="bg-background flex-1">
      <HistoryLogModal
        history={matchHistory}
        onClearHistory={() => {
          clearHistory();
          router.back();
        }}
      />
    </View>
  );
}

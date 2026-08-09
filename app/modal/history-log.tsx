import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { HistoryLogModal } from '../../src/components/HistoryLogModal';
import { useGameStore } from '../../src/stores/useGameStore';

export default function HistoryLogModalRoute() {
  const router = useRouter();
  const { matchHistory, clearHistory } = useGameStore();

  return (
    <View className="bg-background flex-1">
      <HistoryLogModal
        isOpen={true}
        isRouteModal={true}
        onClose={() => router.back()}
        history={matchHistory}
        onClearHistory={() => {
          clearHistory();
          router.back();
        }}
      />
    </View>
  );
}

import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { HistoryLogModalNative } from '../../src/components/HistoryLogModal.native';
import { useGameStore } from '../../src/stores/useGameStore';

export default function HistoryLogModalRoute() {
  const router = useRouter();
  const { matchHistory, clearHistory } = useGameStore();

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <HistoryLogModalNative
        isOpen={true}
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

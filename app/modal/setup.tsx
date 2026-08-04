import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { GameSetupModal } from '../../src/components/GameSetupModal';
import { useGameStore } from '../../src/stores/useGameStore';
import { GAME_PRESETS } from '../../src/types/game';

export default function SetupModalRoute() {
  const router = useRouter();
  const { presetId } = useLocalSearchParams<{ presetId?: string }>();
  const createGame = useGameStore((state) => state.createGame);

  const preset = GAME_PRESETS.find((p) => p.id === presetId) || null;

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <GameSetupModal
        isOpen={true}
        isRouteModal={true}
        onClose={() => router.back()}
        preset={preset}
        onStartGame={(setup) => {
          createGame(setup);
          const activeGame = useGameStore.getState().activeGame;
          if (activeGame) {
            router.replace(`/match/${activeGame.id}`);
          }
        }}
      />
    </View>
  );
}

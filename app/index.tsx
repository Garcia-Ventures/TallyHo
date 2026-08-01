import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useGameStore } from '../src/stores/useGameStore';
import { GAME_PRESETS, GamePreset } from '../src/types/game';
import { calculatePlayerTotals, getSortedPlayers } from '../src/utils/scoring';

export default function HomeScreen() {
  const router = useRouter();
  const { activeGame, matchHistory } = useGameStore();

  const handleSelectPreset = (preset: GamePreset) => {
    router.push({
      pathname: '/modal/setup',
      params: { presetId: preset.id },
    });
  };

  const handleResumeMatch = () => {
    if (activeGame) {
      router.push(`/match/${activeGame.id}`);
    }
  };

  return (
    <ScrollView className="flex-1 space-y-5 bg-[#FDFBF7] p-4" showsVerticalScrollIndicator={false}>
      {/* Active Game Resume Banner */}
      {activeGame && activeGame.status === 'ACTIVE' && (
        <View className="space-y-3 rounded-2xl border border-[#E5A93C] bg-[#E5A93C]/15 p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl">🎲</Text>
              <View>
                <Text className="text-xs font-black tracking-widest text-[#E5A93C] uppercase">
                  Active Match in Progress
                </Text>
                <Text className="text-base font-black text-[#2C302E]">{activeGame.name}</Text>
              </View>
            </View>

            <View className="rounded-full bg-[#E5A93C] px-2.5 py-0.5">
              <Text className="text-[10px] font-black text-black">Round {activeGame.rounds.length}</Text>
            </View>
          </View>

          <Pressable
            onPress={handleResumeMatch}
            className="items-center justify-center rounded-xl bg-[#2C302E] py-3 shadow"
          >
            <Text className="text-xs font-black text-white">▶ Resume Game</Text>
          </Pressable>
        </View>
      )}

      {/* Start New Game Header */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-black tracking-widest text-[#5A605C] uppercase">Start a Game</Text>
          <Text className="text-xl font-black text-[#2C302E]">Rulebook Presets</Text>
        </View>

        <Pressable
          onPress={() => router.push('/modal/setup')}
          className="items-center justify-center rounded-xl bg-[#C84B31] px-4 py-2.5 shadow"
        >
          <Text className="text-xs font-black text-white">+ Custom Match</Text>
        </Pressable>
      </View>

      {/* Game Presets Grid */}
      <View className="flex-row flex-wrap gap-3">
        {GAME_PRESETS.map((preset) => (
          <Pressable
            key={preset.id}
            onPress={() => handleSelectPreset(preset)}
            className="w-[48%] space-y-2 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-4 shadow-xs"
          >
            <Text className="text-2xl">{preset.icon}</Text>
            <Text className="text-sm font-black text-[#2C302E]">{preset.name}</Text>
            <Text className="text-[10px] text-[#5A605C]" numberOfLines={2}>
              {preset.description}
            </Text>

            <View className="mt-1 self-start rounded-full bg-[#E5E0D8]/60 px-2 py-0.5">
              <Text className="text-[9px] font-extrabold text-[#2C302E]">{preset.badgeText}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Match History Overview */}
      <View className="space-y-3 pt-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-black tracking-widest text-[#5A605C] uppercase">Recent Matches</Text>

          {matchHistory.length > 0 && (
            <Pressable onPress={() => router.push('/modal/history-log')}>
              <Text className="text-xs font-bold text-[#C84B31]">View All ({matchHistory.length}) →</Text>
            </Pressable>
          )}
        </View>

        {matchHistory.length === 0 ? (
          <View className="items-center space-y-1 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-6">
            <Text className="text-2xl">📝</Text>
            <Text className="text-xs font-bold text-[#5A605C]">No completed matches yet.</Text>
          </View>
        ) : (
          matchHistory.slice(0, 3).map((game) => {
            const totals = calculatePlayerTotals(game);
            const sorted = getSortedPlayers(game, totals);
            const winner = sorted[0];

            return (
              <View
                key={game.id}
                className="flex-row items-center justify-between rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-4"
              >
                <View>
                  <Text className="text-sm font-black text-[#2C302E]">{game.name}</Text>
                  <Text className="text-[10px] text-[#5A605C]">
                    {game.rounds.length} Rounds • {game.players.length} Players
                  </Text>
                </View>

                {winner && (
                  <View className="items-end rounded-xl bg-[#E5A93C]/20 px-3 py-1.5">
                    <Text className="text-[9px] font-black text-[#E5A93C] uppercase">👑 Winner</Text>
                    <Text className="text-xs font-bold text-[#2C302E]">{winner.name}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

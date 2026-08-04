import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
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
    <ScrollView className="bg-background flex-1 space-y-5 p-4" showsVerticalScrollIndicator={false}>
      {/* Active Game Resume Banner */}
      {activeGame && activeGame.status === 'ACTIVE' && (
        <Card className="border-[#E5A93C] bg-[#E5A93C]/15 p-4 shadow-sm">
          <CardContent className="space-y-3 p-0">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">🎲</Text>
                <View>
                  <Text className="text-xs font-black tracking-widest text-[#E5A93C] uppercase">
                    Active Match in Progress
                  </Text>
                  <Text className="text-foreground text-base font-black">{activeGame.name}</Text>
                </View>
              </View>

              <Badge className="bg-[#E5A93C] px-2.5 py-0.5">
                <Text className="text-[10px] font-black text-black">Round {activeGame.rounds.length}</Text>
              </Badge>
            </View>

            <Button
              onPress={handleResumeMatch}
              className="bg-primary w-full items-center justify-center rounded-xl py-3 shadow"
            >
              <Text className="text-primary-foreground text-xs font-black">▶ Resume Game</Text>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Start New Game Header */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-muted-foreground text-xs font-black tracking-widest uppercase">Start a Game</Text>
          <Text className="text-foreground text-xl font-black">Rulebook Presets</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Button
            onPress={() => router.push('/modal/settings')}
            variant="outline"
            className="border-border bg-card items-center justify-center rounded-xl px-3 py-2.5 shadow-xs"
          >
            <Text className="text-foreground text-xs font-black">⚙️ Settings</Text>
          </Button>

          <Button
            onPress={() => router.push('/modal/setup')}
            className="items-center justify-center rounded-xl bg-[#C84B31] px-3.5 py-2.5 shadow"
          >
            <Text className="text-xs font-black text-white">+ Custom Match</Text>
          </Button>
        </View>
      </View>

      {/* Game Presets Grid */}
      <View className="flex-row flex-wrap gap-3">
        {GAME_PRESETS.map((preset) => (
          <Pressable key={preset.id} onPress={() => handleSelectPreset(preset)} className="w-[48%]">
            <Card className="border-border bg-card space-y-2 p-4 shadow-xs">
              <CardContent className="space-y-2 p-0">
                <Text className="text-2xl">{preset.icon}</Text>
                <Text className="text-foreground text-sm font-black">{preset.name}</Text>
                <Text className="text-muted-foreground text-[10px]" numberOfLines={2}>
                  {preset.description}
                </Text>

                <View className="mt-1 self-start">
                  <Badge variant="secondary" className="bg-muted px-2 py-0.5">
                    <Text className="text-foreground text-[9px] font-extrabold">{preset.badgeText}</Text>
                  </Badge>
                </View>
              </CardContent>
            </Card>
          </Pressable>
        ))}
      </View>

      {/* Match History Overview */}
      <View className="space-y-3 pt-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-muted-foreground text-xs font-black tracking-widest uppercase">Recent Matches</Text>

          {matchHistory.length > 0 && (
            <Pressable onPress={() => router.push('/modal/history-log')}>
              <Text className="text-xs font-bold text-[#C84B31]">View All ({matchHistory.length}) →</Text>
            </Pressable>
          )}
        </View>

        {matchHistory.length === 0 ? (
          <Card className="border-border bg-card items-center space-y-1 p-6">
            <CardContent className="items-center space-y-1 p-0">
              <Text className="text-2xl">📝</Text>
              <Text className="text-muted-foreground text-xs font-bold">No completed matches yet.</Text>
            </CardContent>
          </Card>
        ) : (
          matchHistory.slice(0, 3).map((game) => {
            const totals = calculatePlayerTotals(game);
            const sorted = getSortedPlayers(game, totals);
            const winner = sorted[0];

            return (
              <Card key={game.id} className="border-border bg-card p-4">
                <CardContent className="flex-row items-center justify-between p-0">
                  <View>
                    <Text className="text-foreground text-sm font-black">{game.name}</Text>
                    <Text className="text-muted-foreground text-[10px]">
                      {game.rounds.length} Rounds • {game.players.length} Players
                    </Text>
                  </View>

                  {winner && (
                    <View className="items-end rounded-xl bg-[#E5A93C]/20 px-3 py-1.5">
                      <Text className="text-[9px] font-black text-[#E5A93C] uppercase">👑 Winner</Text>
                      <Text className="text-foreground text-xs font-bold">{winner.name}</Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

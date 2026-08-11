import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { AdBannerCard } from '../src/components/AdBannerCard';
import { ScreenContainer } from '../src/components/ScreenContainer';
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
    <ScreenContainer>
      <View className="gap-8">
        {/* Active Game Resume Banner */}
        {activeGame && activeGame.status === 'ACTIVE' && (
          <Card className="border-chip-mustard bg-chip-mustard/15 p-5 shadow-sm sm:p-6">
            <CardContent className="gap-4 p-0">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">🎲</Text>
                  <View>
                    <Text className="text-chip-mustard text-xs font-black tracking-widest uppercase">
                      Active Match in Progress
                    </Text>
                    <Text className="text-foreground text-lg font-black">{activeGame.name}</Text>
                  </View>
                </View>

                <Badge className="bg-chip-mustard px-3 py-1">
                  <Text className="text-[10px] font-black text-black">Round {activeGame.rounds.length}</Text>
                </Badge>
              </View>

              <Button
                onPress={handleResumeMatch}
                className="bg-primary w-full items-center justify-center rounded-xl py-3.5 shadow"
              >
                <Text className="text-primary-foreground text-xs font-black">▶ Resume Game</Text>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Start New Game Header */}
        <View className="gap-4">
          <View className="mb-2 flex-row flex-wrap items-center justify-between gap-3">
            <View>
              <Text className="text-muted-foreground text-xs font-black tracking-widest uppercase">Start a Game</Text>
              <Text className="text-foreground text-2xl font-black">Rulebook Presets</Text>
            </View>

            <View className="flex-row items-center gap-2.5">
              <Button
                onPress={() => router.push('/modal/settings')}
                variant="outline"
                className="border-border bg-card items-center justify-center rounded-xl px-3.5 py-2.5 shadow-xs"
              >
                <Text className="text-foreground text-xs font-black">⚙️ Settings</Text>
              </Button>

              <Button
                onPress={() => router.push('/modal/setup')}
                className="bg-ink-stamp items-center justify-center rounded-xl px-4 py-2.5 shadow"
              >
                <Text className="text-xs font-black text-white">+ Custom Match</Text>
              </Button>
            </View>
          </View>

          {/* Game Presets Grid */}
          <View className="flex-row flex-wrap justify-start gap-3.5 sm:gap-5">
            {GAME_PRESETS.map((preset) => (
              <Pressable key={preset.id} onPress={() => handleSelectPreset(preset)} className="w-[47.5%] sm:w-[31.5%]">
                <Card className="border-border bg-card justify-between p-5 shadow-xs">
                  <CardContent className="justify-between gap-2.5 p-0">
                    <View className="gap-2">
                      <Text className="text-2xl">{preset.icon}</Text>
                      <Text className="text-foreground text-base font-black">{preset.name}</Text>
                      <Text className="text-muted-foreground text-xs leading-relaxed" numberOfLines={2}>
                        {preset.description}
                      </Text>
                    </View>

                    <View className="mt-3 self-start">
                      <Badge variant="secondary" className="bg-muted px-2.5 py-1">
                        <Text className="text-foreground text-[10px] font-extrabold">{preset.badgeText}</Text>
                      </Badge>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Ad Banner Surface */}
        <AdBannerCard placement="home" className="pt-2" />

        {/* Match History Overview */}
        <View className="gap-4 pt-4 sm:pt-6">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-muted-foreground text-xs font-black tracking-widest uppercase">Recent Matches</Text>

            {matchHistory.length > 0 && (
              <Pressable onPress={() => router.push('/modal/history-log')}>
                <Text className="text-ink-stamp text-xs font-bold">View All ({matchHistory.length}) →</Text>
              </Pressable>
            )}
          </View>

          {matchHistory.length === 0 ? (
            <Card className="border-border bg-card items-center gap-2 p-8">
              <CardContent className="items-center gap-2 p-0">
                <Text className="text-3xl">📝</Text>
                <Text className="text-muted-foreground text-sm font-bold">No completed matches yet.</Text>
              </CardContent>
            </Card>
          ) : (
            <View className="gap-3.5">
              {matchHistory.slice(0, 3).map((game) => {
                const totals = calculatePlayerTotals(game);
                const sorted = getSortedPlayers(game, totals);
                const winner = sorted[0];

                return (
                  <Card key={game.id} className="border-border bg-card p-5">
                    <CardContent className="flex-row items-center justify-between p-0">
                      <View className="gap-1">
                        <Text className="text-foreground text-base font-black">{game.name}</Text>
                        <Text className="text-muted-foreground text-xs">
                          {game.rounds.length} Rounds • {game.players.length} Players
                        </Text>
                      </View>

                      {winner && (
                        <View className="bg-chip-mustard/20 items-end rounded-xl px-3.5 py-2">
                          <Text className="text-chip-mustard text-[9px] font-black uppercase">👑 Winner</Text>
                          <Text className="text-foreground text-xs font-bold">{winner.name}</Text>
                        </View>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

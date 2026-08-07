import { Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { GameSession, Player } from '../types/game';
import { calculatePlayerTotals, getSortedPlayers } from '../utils/scoring';

interface ScoreboardViewProps {
  game: GameSession;
  onOpenScoreKeypad: (player: Player) => void;
  onOpenRoundHistory: () => void;
  onFlipToPlayMode: () => void;
  onEndMatch: () => void;
  onReorderPlayers: (updatedPlayers: Player[]) => void;
}

export const ScoreboardView: React.FC<ScoreboardViewProps> = ({
  game,
  onOpenScoreKeypad,
  onOpenRoundHistory,
  onFlipToPlayMode,
  onEndMatch,
  onReorderPlayers,
}) => {
  const totals = calculatePlayerTotals(game);
  const sortedPlayers = getSortedPlayers(game, totals);
  const leaderScore = totals[sortedPlayers[0]?.id] || 0;

  const currentRounds = game.rounds || [];
  const activeRoundIndex = currentRounds.length > 0 ? currentRounds.length - 1 : 0;
  const activeRound = currentRounds[activeRoundIndex] || { roundNumber: 1, scores: {} };

  const handleMoveOrder = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= game.players.length) {
      return;
    }
    const updated = [...game.players];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onReorderPlayers(updated);
  };

  return (
    <ScrollView
      className="bg-background flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}
    >
      <View className="w-full max-w-4xl space-y-4 p-4">
        {/* Match Header Banner */}
        <Card className="border-border bg-card gap-3 rounded-2xl border p-4 shadow-sm">
          <CardContent className="gap-3 p-0">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-foreground text-xl font-black">{game.name}</Text>
                <Text className="text-muted-foreground text-xs">
                  Round {game.rounds.length > 0 ? game.rounds.length : 1} in progress • {game.players.length} Players
                </Text>
              </View>
              <View className="flex-row gap-2">
                {game.targetScore ? (
                  <View className="border-border bg-popover rounded-full border px-2.5 py-1">
                    <Text className="text-foreground text-[10px] font-bold">{game.targetScore} pts target</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Hero Actions Bar */}
            <View className="flex-row flex-wrap gap-2">
              <Button
                onPress={onFlipToPlayMode}
                className="flex-1 items-center justify-center rounded-xl bg-[#C84B31] py-3 shadow"
              >
                <Text className="text-xs font-black text-white">🎮 Enter Play Mode →</Text>
              </Button>

              <Button
                onPress={onOpenRoundHistory}
                variant="outline"
                size="sm"
                className="items-center justify-center rounded-xl px-3.5 py-3"
              >
                <Text className="text-foreground text-xs font-bold">📜 Log ({game.rounds.length})</Text>
              </Button>

              <Button
                onPress={onEndMatch}
                size="sm"
                className="bg-primary items-center justify-center rounded-xl px-3.5 py-3"
              >
                <Text className="text-primary-foreground text-xs font-bold">🏆 End</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Leaderboard Player Cards Grid */}
        <View className="flex-row flex-wrap gap-2.5">
          {game.players.map((player) => {
            const totalScore = totals[player.id] || 0;
            const isLeader = player.id === sortedPlayers[0]?.id && game.rounds.length > 0;
            const diffFromLeader = totalScore - leaderScore;
            const hasLoggedCurrentRound = Boolean(activeRound.scores[player.id]);

            return (
              <Card
                key={player.id}
                className={`will-change-variable border-border w-[calc(50%-5px)] min-w-[140px] overflow-hidden rounded-2xl border shadow-xs sm:w-[calc(33.333%-7px)] md:w-[calc(25%-8px)] ${
                  hasLoggedCurrentRound ? 'bg-muted/70' : 'bg-card'
                }`}
              >
                {/* Color Strip */}
                <View className="h-1.5 w-full" style={{ backgroundColor: player.color }} />

                <CardContent className="gap-2 p-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center gap-1.5 pr-1">
                      <View
                        className="h-7 w-7 items-center justify-center rounded-full"
                        style={{ backgroundColor: player.color }}
                      >
                        <Text className="text-xs font-black text-white">{player.initials}</Text>
                      </View>
                      <Text className="text-foreground text-xs font-bold" numberOfLines={1}>
                        {player.name}
                      </Text>
                    </View>

                    {isLeader && (
                      <View className="rounded bg-[#E5A93C] px-1.5 py-0.5">
                        <Text className="text-[9px] font-black text-black">👑 1st</Text>
                      </View>
                    )}
                  </View>

                  {/* Score Number Display */}
                  <View>
                    <Text className="text-foreground text-2xl font-black">{totalScore}</Text>
                    <Text className="text-muted-foreground text-[10px]">
                      {isLeader ? 'Leader' : `${diffFromLeader > 0 ? `+${diffFromLeader}` : diffFromLeader} pts`}
                    </Text>
                  </View>

                  {/* Card Action */}
                  <View className="border-border border-t pt-2">
                    {hasLoggedCurrentRound ? (
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[10px] font-bold text-[#6A9C78]">✓ Done</Text>
                        <Button onPress={() => onOpenScoreKeypad(player)} variant="ghost" size="sm" className="p-0.5">
                          <Text className="text-muted-foreground text-[10px] underline">Edit</Text>
                        </Button>
                      </View>
                    ) : (
                      <Button
                        onPress={() => onOpenScoreKeypad(player)}
                        variant="outline"
                        size="sm"
                        className="items-center rounded-lg py-1.5"
                      >
                        <Text className="text-foreground text-[11px] font-bold">+ Score</Text>
                      </Button>
                    )}
                  </View>
                </CardContent>
              </Card>
            );
          })}
        </View>

        {/* Turn Sequence Bar */}
        <Card className="border-border bg-card gap-2 rounded-xl border p-3">
          <CardContent className="gap-2 p-0">
            <Text className="text-muted-foreground text-xs font-bold">Turn Sequence Roster:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
              contentContainerStyle={{ gap: 8 }}
            >
              {game.players.map((p, idx) => (
                <View
                  key={p.id}
                  className="border-border bg-popover flex-row items-center gap-1.5 rounded-lg border px-2.5 py-1.5"
                >
                  <Text className="text-muted-foreground text-[10px] font-bold">#{idx + 1}</Text>
                  <Text className="text-foreground text-xs font-bold">{p.name}</Text>
                  <Pressable onPress={() => handleMoveOrder(idx, 'UP')} disabled={idx === 0} className="px-1">
                    <Text className={`text-foreground text-[10px] font-bold ${idx === 0 ? 'opacity-20' : ''}`}>←</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleMoveOrder(idx, 'DOWN')}
                    disabled={idx === game.players.length - 1}
                    className="px-1"
                  >
                    <Text
                      className={`text-foreground text-[10px] font-bold ${idx === game.players.length - 1 ? 'opacity-20' : ''}`}
                    >
                      →
                    </Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};

export const ScoreboardViewNative = ScoreboardView;

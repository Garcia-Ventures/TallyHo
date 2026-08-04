import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GameSession, Player } from '../types/game';
import { calculatePlayerTotals, getSortedPlayers } from '../utils/scoring';

interface ScoreboardViewNativeProps {
  game: GameSession;
  onOpenScoreKeypad: (player: Player) => void;
  onOpenRoundHistory: () => void;
  onFlipToPlayMode: () => void;
  onEndMatch: () => void;
  onReorderPlayers: (updatedPlayers: Player[]) => void;
}

export const ScoreboardViewNative: React.FC<ScoreboardViewNativeProps> = ({
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
      className="flex-1 bg-[#FDFBF7] p-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
    >
      {/* Match Header Banner */}
      <View className="gap-3 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-xl font-black text-[#2C302E]">{game.name}</Text>
            <Text className="text-xs text-[#5A605C]">
              Round {game.rounds.length > 0 ? game.rounds.length : 1} in progress • {game.players.length} Players
            </Text>
          </View>
          <View className="flex-row gap-2">
            {game.targetScore ? (
              <View className="rounded-full border border-[#E5E0D8] bg-white px-2.5 py-1">
                <Text className="text-[10px] font-bold text-[#2C302E]">{game.targetScore} pts target</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Hero Actions Bar */}
        <View className="flex-row flex-wrap gap-2">
          <Pressable
            onPress={onFlipToPlayMode}
            className="flex-1 items-center justify-center rounded-xl bg-[#C84B31] py-3 shadow"
          >
            <Text className="text-xs font-black text-white">🎮 Enter Play Mode →</Text>
          </Pressable>

          <Pressable
            onPress={onOpenRoundHistory}
            className="items-center justify-center rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-3"
          >
            <Text className="text-xs font-bold text-[#2C302E]">📜 Log ({game.rounds.length})</Text>
          </Pressable>

          <Pressable onPress={onEndMatch} className="items-center justify-center rounded-xl bg-[#2C302E] px-3.5 py-3">
            <Text className="text-xs font-bold text-white">🏆 End</Text>
          </Pressable>
        </View>
      </View>

      {/* Leaderboard Player Cards Grid */}
      <View className="flex-row flex-wrap gap-2.5">
        {game.players.map((player) => {
          const totalScore = totals[player.id] || 0;
          const isLeader = player.id === sortedPlayers[0]?.id && game.rounds.length > 0;
          const diffFromLeader = totalScore - leaderScore;
          const hasLoggedCurrentRound = Boolean(activeRound.scores[player.id]);

          return (
            <View
              key={player.id}
              className={`will-change-variable max-w-[49%] min-w-[145px] flex-1 overflow-hidden rounded-2xl border border-[#E5E0D8] shadow-xs ${
                hasLoggedCurrentRound ? 'bg-[#EFEAE1]/70' : 'bg-[#F7F4EE]'
              }`}
            >
              {/* Color Strip */}
              <View className="h-1.5 w-full" style={{ backgroundColor: player.color }} />

              <View className="gap-2 p-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center gap-1.5 pr-1">
                    <View
                      className="h-7 w-7 items-center justify-center rounded-full"
                      style={{ backgroundColor: player.color }}
                    >
                      <Text className="text-xs font-black text-white">{player.initials}</Text>
                    </View>
                    <Text className="text-xs font-bold text-[#2C302E]" numberOfLines={1}>
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
                  <Text className="text-2xl font-black text-[#2C302E]">{totalScore}</Text>
                  <Text className="text-[10px] text-[#5A605C]">
                    {isLeader ? 'Leader' : `${diffFromLeader > 0 ? `+${diffFromLeader}` : diffFromLeader} pts`}
                  </Text>
                </View>

                {/* Card Action */}
                <View className="border-t border-[#E5E0D8] pt-2">
                  {hasLoggedCurrentRound ? (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[10px] font-bold text-[#6A9C78]">✓ Done</Text>
                      <Pressable onPress={() => onOpenScoreKeypad(player)} className="p-0.5">
                        <Text className="text-[10px] text-[#5A605C] underline">Edit</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => onOpenScoreKeypad(player)}
                      className="items-center rounded-lg border border-[#E5E0D8] bg-white py-1.5"
                    >
                      <Text className="text-[11px] font-bold text-[#2C302E]">+ Score</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Turn Sequence Bar */}
      <View className="gap-2 rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
        <Text className="text-xs font-bold text-[#5A605C]">Turn Sequence Roster:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ gap: 8 }}
        >
          {game.players.map((p, idx) => (
            <View
              key={p.id}
              className="flex-row items-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-white px-2.5 py-1.5"
            >
              <Text className="text-[10px] font-bold text-[#5A605C]">#{idx + 1}</Text>
              <Text className="text-xs font-bold text-[#2C302E]">{p.name}</Text>
              <Pressable onPress={() => handleMoveOrder(idx, 'UP')} disabled={idx === 0} className="px-1">
                <Text className={`text-[10px] font-bold ${idx === 0 ? 'opacity-20' : ''}`}>←</Text>
              </Pressable>
              <Pressable
                onPress={() => handleMoveOrder(idx, 'DOWN')}
                disabled={idx === game.players.length - 1}
                className="px-1"
              >
                <Text className={`text-[10px] font-bold ${idx === game.players.length - 1 ? 'opacity-20' : ''}`}>
                  →
                </Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

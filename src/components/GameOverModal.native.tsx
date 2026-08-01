import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { GameSession } from '../types/game';
import { calculateGameHighlights, calculatePlayerTotals, getSortedPlayers } from '../utils/scoring';

interface GameOverModalNativeProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameSession;
  onRematch: () => void;
}

export const GameOverModalNative: React.FC<GameOverModalNativeProps> = ({ isOpen, onClose, game, onRematch }) => {
  if (!isOpen) {
    return null;
  }

  const totals = calculatePlayerTotals(game);
  const sortedPlayers = getSortedPlayers(game, totals);
  const winner = sortedPlayers[0];
  const secondPlace = sortedPlayers[1];
  const thirdPlace = sortedPlayers[2];
  const { highlights } = calculateGameHighlights(game);

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/70">
        <View className="max-h-[85%] space-y-4 rounded-t-3xl border-t border-[#E5E0D8] bg-[#FDFBF7] p-5 shadow-2xl">
          {/* Header */}
          <View className="items-center space-y-1 rounded-2xl bg-[#2C302E] p-4">
            <Text className="text-3xl">👑</Text>
            <Text className="text-xs font-black tracking-widest text-[#E5A93C] uppercase">Game Night Champion</Text>
            <Text className="text-2xl font-black text-white">
              {winner ? `${winner.name} Wins!` : 'Match Completed'}
            </Text>
            <Text className="text-xs text-gray-300">
              {game.name} • {game.rounds.length} Rounds Logged
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
            {/* Podium Standings */}
            <View className="flex-row items-end justify-center gap-2 pt-2">
              {/* 2nd Place */}
              {secondPlace && (
                <View className="flex-1 items-center space-y-1 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-[#3B5998]">
                    <Text className="text-xs font-black text-white">2</Text>
                  </View>
                  <Text className="text-xs font-bold text-[#2C302E]" numberOfLines={1}>
                    {secondPlace.name}
                  </Text>
                  <Text className="text-base font-black text-[#2C302E]">{totals[secondPlace.id]}</Text>
                  <Text className="text-[9px] text-[#5A605C]">2nd Place</Text>
                </View>
              )}

              {/* 1st Place */}
              {winner && (
                <View className="flex-1.2 items-center space-y-1 rounded-2xl border-2 border-[#E5A93C] bg-[#E5A93C]/15 p-4 shadow">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E5A93C]">
                    <Text className="text-sm font-black text-black">1</Text>
                  </View>
                  <Text className="text-sm font-black text-[#2C302E]" numberOfLines={1}>
                    {winner.name}
                  </Text>
                  <Text className="text-xl font-black text-[#2C302E]">{totals[winner.id]}</Text>
                  <Text className="text-[10px] font-black text-[#E5A93C] uppercase">🏆 Winner</Text>
                </View>
              )}

              {/* 3rd Place */}
              {thirdPlace && (
                <View className="flex-1 items-center space-y-1 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-[#D96B43]">
                    <Text className="text-xs font-black text-white">3</Text>
                  </View>
                  <Text className="text-xs font-bold text-[#2C302E]" numberOfLines={1}>
                    {thirdPlace.name}
                  </Text>
                  <Text className="text-base font-black text-[#2C302E]">{totals[thirdPlace.id]}</Text>
                  <Text className="text-[9px] text-[#5A605C]">3rd Place</Text>
                </View>
              )}
            </View>

            {/* Match Highlights */}
            {highlights.length > 0 && (
              <View className="space-y-2">
                <Text className="text-xs font-black text-[#5A605C] uppercase">⚡ Match Highlights:</Text>
                {highlights.map((h, idx) => (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-3"
                  >
                    <View>
                      <Text className="text-xs font-bold text-[#2C302E]">{h.title}</Text>
                      <Text className="text-[10px] text-[#5A605C]">{h.description}</Text>
                    </View>
                    <View className="rounded bg-[#E5A93C]/20 px-2 py-1">
                      <Text className="text-[10px] font-bold text-[#2C302E]">{h.badge}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={onRematch}
              className="flex-1 items-center justify-center rounded-2xl bg-[#2C302E] py-4 shadow"
            >
              <Text className="text-sm font-black text-white">🔄 Rematch</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              className="items-center justify-center rounded-2xl border border-[#E5E0D8] bg-white px-5 py-4"
            >
              <Text className="text-sm font-bold text-[#2C302E]">Home</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

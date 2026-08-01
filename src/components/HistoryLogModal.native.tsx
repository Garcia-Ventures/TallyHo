import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { GameSession } from '../types/game';
import { calculatePlayerTotals, getSortedPlayers } from '../utils/scoring';

interface HistoryLogModalNativeProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameSession[];
  onClearHistory: () => void;
}

export const HistoryLogModalNative: React.FC<HistoryLogModalNativeProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="max-h-[85%] space-y-4 rounded-t-3xl border-t border-[#E5E0D8] bg-[#FDFBF7] p-5 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-[#E5E0D8] pb-3">
            <Text className="text-xl font-black text-[#2C302E]">📜 Match History ({history.length})</Text>
            <Pressable onPress={onClose}>
              <Text className="text-base font-bold text-[#5A605C]">✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
            {history.length === 0 ? (
              <View className="items-center justify-center space-y-2 p-8">
                <Text className="text-3xl">🎲</Text>
                <Text className="text-sm font-bold text-[#5A605C]">No completed matches archived yet.</Text>
              </View>
            ) : (
              history.map((game) => {
                const totals = calculatePlayerTotals(game);
                const sorted = getSortedPlayers(game, totals);
                const winner = sorted[0];

                return (
                  <View key={game.id} className="space-y-2 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-4">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-black text-[#2C302E]">{game.name}</Text>
                      <Text className="text-[10px] text-[#5A605C]">
                        {new Date(game.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    {winner && (
                      <View className="flex-row items-center gap-1.5 rounded-xl bg-[#E5A93C]/15 p-2">
                        <Text className="text-xs">👑</Text>
                        <Text className="text-xs font-bold text-[#2C302E]">
                          Winner: {winner.name} ({totals[winner.id]} pts)
                        </Text>
                      </View>
                    )}

                    <Text className="text-[10px] text-[#5A605C]">
                      {game.players.length} Players • {game.rounds.length} Rounds Logged
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          {history.length > 0 && (
            <Pressable
              onPress={onClearHistory}
              className="items-center rounded-2xl border border-red-200 bg-red-50 py-3"
            >
              <Text className="text-xs font-bold text-red-600">Clear All History</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

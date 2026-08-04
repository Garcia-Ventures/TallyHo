import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { GameSession } from '../types/game';
import { calculatePlayerTotals, getSortedPlayers } from '../utils/scoring';

interface HistoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameSession[];
  onClearHistory: () => void;
  isRouteModal?: boolean;
}

export const HistoryLogModal: React.FC<HistoryLogModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  isRouteModal = false,
}) => {
  if (!isOpen) {
    return null;
  }

  const content = (
    <View className="flex-1 justify-between gap-4 bg-[#FDFBF7] p-5">
      {/* Header */}
      {!isRouteModal && (
        <View className="flex-row items-center justify-between border-b border-[#E5E0D8] pb-3">
          <Text className="text-xl font-black text-[#2C302E]">📜 Match History ({history.length})</Text>
          <Pressable onPress={onClose} className="p-1">
            <Text className="text-base font-bold text-[#5A605C]">✕</Text>
          </Pressable>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
        {history.length === 0 ? (
          <Card className="items-center justify-center border-[#E5E0D8] bg-[#F7F4EE] p-8">
            <CardContent className="items-center justify-center gap-2 p-0">
              <Text className="text-3xl">🎲</Text>
              <Text className="text-sm font-bold text-[#5A605C]">No completed matches archived yet.</Text>
            </CardContent>
          </Card>
        ) : (
          history.map((game) => {
            const totals = calculatePlayerTotals(game);
            const sorted = getSortedPlayers(game, totals);
            const winner = sorted[0];

            return (
              <Card key={game.id} className="border-[#E5E0D8] bg-[#F7F4EE] p-4">
                <CardContent className="gap-2 p-0">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-black text-[#2C302E]">{game.name}</Text>
                    <Text className="text-[10px] text-[#5A605C]">{new Date(game.createdAt).toLocaleDateString()}</Text>
                  </View>

                  {winner && (
                    <Badge variant="secondary" className="flex-row items-center gap-1.5 self-start bg-[#E5A93C]/15 p-2">
                      <Text className="text-xs">👑</Text>
                      <Text className="text-xs font-bold text-[#2C302E]">
                        Winner: {winner.name} ({totals[winner.id]} pts)
                      </Text>
                    </Badge>
                  )}

                  <Text className="text-[10px] text-[#5A605C]">
                    {game.players.length} Players • {game.rounds.length} Rounds Logged
                  </Text>
                </CardContent>
              </Card>
            );
          })
        )}
      </ScrollView>

      {history.length > 0 && (
        <Button
          onPress={onClearHistory}
          variant="destructive"
          className="mt-1 items-center rounded-2xl border border-red-200 bg-red-50 py-3.5"
        >
          <Text className="text-xs font-bold text-red-600">Clear All History</Text>
        </Button>
      )}
    </View>
  );

  if (isRouteModal) {
    return content;
  }

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="h-[85%] overflow-hidden rounded-t-3xl border-t border-[#E5E0D8] bg-[#FDFBF7] shadow-2xl">
          {content}
        </View>
      </View>
    </Modal>
  );
};

export const HistoryLogModalNative = HistoryLogModal;

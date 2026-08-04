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
    <View className="bg-background flex-1 justify-between gap-4 p-5">
      {/* Header */}
      {!isRouteModal && (
        <View className="border-border flex-row items-center justify-between border-b pb-3">
          <Text className="text-foreground text-xl font-black">📜 Match History ({history.length})</Text>
          <Pressable onPress={onClose} className="p-1">
            <Text className="text-muted-foreground text-base font-bold">✕</Text>
          </Pressable>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
        {history.length === 0 ? (
          <Card className="border-border bg-card items-center justify-center p-8">
            <CardContent className="items-center justify-center gap-2 p-0">
              <Text className="text-3xl">🎲</Text>
              <Text className="text-muted-foreground text-sm font-bold">No completed matches archived yet.</Text>
            </CardContent>
          </Card>
        ) : (
          history.map((game) => {
            const totals = calculatePlayerTotals(game);
            const sorted = getSortedPlayers(game, totals);
            const winner = sorted[0];

            return (
              <Card key={game.id} className="border-border bg-card p-4">
                <CardContent className="gap-2 p-0">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-foreground text-base font-black">{game.name}</Text>
                    <Text className="text-muted-foreground text-[10px]">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  {winner && (
                    <Badge variant="secondary" className="flex-row items-center gap-1.5 self-start bg-[#E5A93C]/15 p-2">
                      <Text className="text-xs">👑</Text>
                      <Text className="text-foreground text-xs font-bold">
                        Winner: {winner.name} ({totals[winner.id]} pts)
                      </Text>
                    </Badge>
                  )}

                  <Text className="text-muted-foreground text-[10px]">
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
          className="mt-1 items-center rounded-2xl border border-red-200 bg-red-50 py-3.5 dark:border-red-900/40 dark:bg-red-950/40"
        >
          <Text className="text-xs font-bold text-red-600 dark:text-red-400">Clear All History</Text>
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
        <View className="border-border bg-background h-[85%] overflow-hidden rounded-t-3xl border-t shadow-2xl">
          {content}
        </View>
      </View>
    </Modal>
  );
};

export const HistoryLogModalNative = HistoryLogModal;

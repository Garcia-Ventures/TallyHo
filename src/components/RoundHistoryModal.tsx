import { Button, Card, CardContent, Input, Text } from '@gv-tech/ui-native';
import React, { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { nativeSound } from '../services/audio';
import { GameSession, Round } from '../types/game';
import { ScreenContainer } from './ScreenContainer';

interface RoundHistoryModalProps {
  game: GameSession;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRounds: (updatedRounds: Round[]) => void;
  isRouteModal?: boolean;
}

export const RoundHistoryModal: React.FC<RoundHistoryModalProps> = ({
  game,
  isOpen,
  onClose,
  onUpdateRounds,
  isRouteModal = false,
}) => {
  if (!isOpen) {
    return null;
  }

  const [editingRoundIndex, setEditingRoundIndex] = useState<number | null>(null);
  const [editScoreMap, setEditScoreMap] = useState<Record<string, string>>({});

  const handleStartEdit = (index: number, round: Round) => {
    nativeSound.playKeypadTap();
    setEditingRoundIndex(index);
    const map: Record<string, string> = {};
    game.players.forEach((p) => {
      map[p.id] = String(round.scores[p.id]?.points ?? 0);
    });
    setEditScoreMap(map);
  };

  const handleSaveEdit = (index: number) => {
    nativeSound.playRoundSubmit();
    const updated = [...game.rounds];
    const targetRound = { ...updated[index] };

    const newScores = { ...targetRound.scores };
    Object.entries(editScoreMap).forEach(([playerId, ptsStr]) => {
      const pts = parseInt(ptsStr, 10) || 0;
      newScores[playerId] = {
        ...(newScores[playerId] || { playerId }),
        points: pts,
      };
    });

    targetRound.scores = newScores;
    updated[index] = targetRound;

    onUpdateRounds(updated);
    setEditingRoundIndex(null);
  };

  const handleDeleteRound = (index: number) => {
    nativeSound.playUndo();
    const updated = game.rounds.filter((_, idx) => idx !== index);
    const renumbered = updated.map((r, i) => ({ ...r, roundNumber: i + 1 }));
    onUpdateRounds(renumbered);
  };

  const content = (
    <ScreenContainer
      scrollable={false}
      className="w-full flex-1"
      header={
        !isRouteModal ? (
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-foreground text-xl font-black">Round History & Edit Log</Text>
              <Text className="text-muted-foreground text-xs font-semibold">
                Fix mistaken entries or adjust past scores
              </Text>
            </View>
            <Button
              onPress={() => {
                nativeSound.playKeypadTap();
                onClose();
              }}
              variant="ghost"
              size="sm"
              className="p-1"
            >
              <Text className="text-foreground text-base font-bold">✕</Text>
            </Button>
          </View>
        ) : undefined
      }
    >
      <View className="w-full flex-1 justify-between gap-4">
        {/* Content Sheet */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        >
          {game.rounds.length === 0 ? (
            <Card className="border-border bg-card items-center justify-center p-8">
              <CardContent className="items-center justify-center gap-2 p-0">
                <Text className="text-3xl">📋</Text>
                <Text className="text-muted-foreground text-sm font-bold">
                  No rounds recorded yet. Log your first round on the score pad!
                </Text>
              </CardContent>
            </Card>
          ) : (
            game.rounds.map((round, idx) => {
              const isEditing = editingRoundIndex === idx;

              return (
                <Card key={round.roundNumber} className="border-border bg-card p-4">
                  <CardContent className="space-y-3 p-0">
                    <View className="border-border flex-row items-center justify-between border-b pb-2">
                      <Text className="text-foreground text-xs font-black uppercase">Round {round.roundNumber}</Text>

                      <View className="flex-row items-center gap-2">
                        {isEditing ? (
                          <Button
                            onPress={() => handleSaveEdit(idx)}
                            className="bg-chip-sage h-8 min-h-8 flex-row items-center justify-center rounded-lg px-3 py-0"
                          >
                            <Text className="text-xs leading-none font-bold text-white">✓ Save</Text>
                          </Button>
                        ) : (
                          <Button
                            onPress={() => handleStartEdit(idx, round)}
                            variant="ghost"
                            className="h-8 min-h-8 flex-row items-center justify-center rounded-lg px-2.5 py-0"
                          >
                            <Text className="text-muted-foreground text-xs leading-none font-bold">✏️ Edit</Text>
                          </Button>
                        )}

                        <Button
                          onPress={() => handleDeleteRound(idx)}
                          variant="ghost"
                          className="h-8 min-h-8 flex-row items-center justify-center rounded-lg px-2 py-0"
                        >
                          <Text className="text-ink-stamp text-xs leading-none font-bold">🗑️</Text>
                        </Button>
                      </View>
                    </View>

                    {/* Player Scores Grid */}
                    <View className="flex-row flex-wrap gap-3">
                      {game.players.map((p) => {
                        const score = round.scores[p.id];
                        const pts = score?.points || 0;

                        return (
                          <View key={p.id} className="w-[calc(50%-6px)] space-y-1 sm:w-[calc(25%-9px)]">
                            <Text className="text-muted-foreground truncate text-[11px] font-extrabold">{p.name}</Text>

                            {isEditing ? (
                              <Input
                                keyboardType="numeric"
                                value={editScoreMap[p.id] ?? String(pts)}
                                onChangeText={(val) =>
                                  setEditScoreMap({
                                    ...editScoreMap,
                                    [p.id]: val,
                                  })
                                }
                                className="border-border bg-popover text-foreground h-9 rounded-lg px-2 py-1 text-sm font-black"
                              />
                            ) : (
                              <Text className="text-foreground text-base font-black">{pts}</Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </CardContent>
                </Card>
              );
            })
          )}
        </ScrollView>

        {/* Footer */}
        <View className="flex-row justify-end pt-2">
          <Button
            onPress={() => {
              nativeSound.playKeypadTap();
              onClose();
            }}
            className="bg-primary h-11 min-h-11 flex-row items-center justify-center rounded-xl px-6 py-0"
          >
            <Text className="text-primary-foreground text-xs leading-none font-extrabold">Done</Text>
          </Button>
        </View>
      </View>
    </ScreenContainer>
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

export const RoundHistoryModalNative = RoundHistoryModal;

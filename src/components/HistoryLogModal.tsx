import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import type { GameSession } from '../types/game';
import { calculatePlayerTotals, getSortedPlayers } from '../utils/scoring';
import { ScreenContainer } from './ScreenContainer';

interface HistoryLogModalProps {
  history: GameSession[];
  onClearHistory: () => void;
}

export const HistoryLogModal: React.FC<HistoryLogModalProps> = ({ history, onClearHistory }) => {
  const renderedHistory = useMemo(() => {
    return history.map((game) => {
      const totals = calculatePlayerTotals(game);
      const winner = game.winnerId
        ? game.players.find((p) => p.id === game.winnerId)
        : getSortedPlayers(game, totals)[0];

      return (
        <Card key={game.id} className="border-border bg-card p-4">
          <CardContent className="gap-2 p-0">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-base font-black">{game.name}</Text>
              <Text className="text-muted-foreground text-[10px]">{new Date(game.createdAt).toLocaleDateString()}</Text>
            </View>

            {winner && (
              <Badge variant="secondary" className="bg-chip-mustard/15 flex-row items-center gap-1.5 self-start p-2">
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
    });
  }, [history]);

  const content = (
    <ScreenContainer scrollable={false} className="w-full flex-1">
      <View className="w-full flex-1 justify-between gap-4">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        >
          {history.length === 0 ? (
            <Card className="border-border bg-card items-center justify-center p-8">
              <CardContent className="items-center justify-center gap-2 p-0">
                <Text className="text-3xl">🎲</Text>
                <Text className="text-muted-foreground text-sm font-bold">No completed matches archived yet.</Text>
              </CardContent>
            </Card>
          ) : (
            renderedHistory
          )}
        </ScrollView>

        {history.length > 0 && (
          <Button
            onPress={onClearHistory}
            variant="destructive"
            className="mt-1 h-13 min-h-[48px] flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-0 dark:border-red-900/40 dark:bg-red-950/40"
          >
            <Text className="text-xs leading-none font-bold text-red-600 dark:text-red-400">Clear All History</Text>
          </Button>
        )}
      </View>
    </ScreenContainer>
  );

  return content;
};

import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import React from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { GameSession } from '../types/game';
import { calculateGameHighlights, calculatePlayerTotals, getSortedPlayers } from '../utils/scoring';
import { ScreenContainer } from './ScreenContainer';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameSession;
  onRematch: () => void;
  isRouteModal?: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  game,
  onRematch,
  isRouteModal = false,
}) => {
  if (!isOpen) {
    return null;
  }

  const totals = calculatePlayerTotals(game);
  const sortedPlayers = getSortedPlayers(game, totals);
  const winner = sortedPlayers[0];
  const secondPlace = sortedPlayers[1];
  const thirdPlace = sortedPlayers[2];
  const { highlights } = calculateGameHighlights(game);

  const content = (
    <ScreenContainer scrollable={false} className="w-full flex-1">
      <View className="w-full flex-1 justify-between gap-4">
        {/* Header */}
        <View className="bg-card items-center gap-1 rounded-2xl p-4">
          <Text className="text-3xl">👑</Text>
          <Text className="text-xs font-black tracking-widest text-[#E5A93C] uppercase">Game Night Champion</Text>
          <Text className="text-foreground text-2xl font-black">
            {winner ? `${winner.name} Wins!` : 'Match Completed'}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {game.name} • {game.rounds.length} Rounds Logged
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 16 }}>
          {/* Podium Standings */}
          <View className="flex-row items-end justify-center gap-2 pt-2">
            {/* 2nd Place */}
            {secondPlace && (
              <Card className="border-border bg-card flex-1 items-center p-3">
                <CardContent className="items-center gap-1 p-0">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-[#3B5998]">
                    <Text className="text-xs font-black text-white">2</Text>
                  </View>
                  <Text className="text-foreground text-xs font-bold" numberOfLines={1}>
                    {secondPlace.name}
                  </Text>
                  <Text className="text-foreground text-base font-black">{totals[secondPlace.id]}</Text>
                  <Text className="text-muted-foreground text-[9px]">2nd Place</Text>
                </CardContent>
              </Card>
            )}

            {/* 1st Place */}
            {winner && (
              <Card className="flex-[1.2] items-center border-2 border-[#E5A93C] bg-[#E5A93C]/15 p-3.5 shadow-sm">
                <CardContent className="items-center gap-1 p-0">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E5A93C]">
                    <Text className="text-sm font-black text-black">1</Text>
                  </View>
                  <Text className="text-foreground text-sm font-black" numberOfLines={1}>
                    {winner.name}
                  </Text>
                  <Text className="text-foreground text-xl font-black">{totals[winner.id]}</Text>
                  <Badge className="bg-[#E5A93C] px-2 py-0.5">
                    <Text className="text-[10px] font-black text-black uppercase">🏆 Winner</Text>
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* 3rd Place */}
            {thirdPlace && (
              <Card className="border-border bg-card flex-1 items-center p-3">
                <CardContent className="items-center gap-1 p-0">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-[#D96B43]">
                    <Text className="text-xs font-black text-white">3</Text>
                  </View>
                  <Text className="text-foreground text-xs font-bold" numberOfLines={1}>
                    {thirdPlace.name}
                  </Text>
                  <Text className="text-foreground text-base font-black">{totals[thirdPlace.id]}</Text>
                  <Text className="text-muted-foreground text-[9px]">3rd Place</Text>
                </CardContent>
              </Card>
            )}
          </View>

          {/* Match Highlights */}
          {highlights.length > 0 && (
            <View className="gap-2">
              <Text className="text-muted-foreground text-xs font-black uppercase">⚡ Match Highlights:</Text>
              {highlights.map((h, idx) => (
                <Card key={idx} className="border-border bg-card p-3">
                  <CardContent className="flex-row items-center justify-between p-0">
                    <View className="flex-1 pr-2">
                      <Text className="text-foreground text-xs font-bold">{h.title}</Text>
                      <Text className="text-muted-foreground text-[10px]">{h.description}</Text>
                    </View>
                    <Badge variant="secondary" className="bg-[#E5A93C]/20 px-2 py-1">
                      <Text className="text-foreground text-[10px] font-bold">{h.badge}</Text>
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View className="flex-row gap-2.5">
          <Button onPress={onRematch} className="bg-primary flex-1 items-center justify-center rounded-2xl py-4 shadow">
            <Text className="text-primary-foreground text-sm font-black">🔄 Rematch</Text>
          </Button>

          <Button
            onPress={onClose}
            variant="outline"
            className="border-border bg-popover items-center justify-center rounded-2xl px-6 py-4"
          >
            <Text className="text-foreground text-sm font-bold">Home</Text>
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
      <View className="flex-1 justify-end bg-black/70">
        <View className="border-border bg-background h-[85%] overflow-hidden rounded-t-3xl border-t shadow-2xl">
          {content}
        </View>
      </View>
    </Modal>
  );
};

export const GameOverModalNative = GameOverModal;

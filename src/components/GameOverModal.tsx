import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import React, { useEffect } from 'react';
import { Modal, View } from 'react-native';
import { nativeSound } from '../services/audio';
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
  useEffect(() => {
    if (isOpen) {
      nativeSound.playVictoryFanfare();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const totals = game?.players ? calculatePlayerTotals(game) : {};
  const sortedPlayers = game?.players ? getSortedPlayers(game, totals) : [];
  const winner = sortedPlayers[0];
  const secondPlace = sortedPlayers[1];
  const thirdPlace = sortedPlayers[2];
  const remainingPlayers = sortedPlayers.slice(3);
  const { highlights } = game?.rounds ? calculateGameHighlights(game) : { highlights: [] };

  const content = (
    <ScreenContainer
      scrollable={true}
      className="w-full flex-1"
      padding="normal"
      header={
        !isRouteModal ? (
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-xl font-black">🏆 Game Night Champion</Text>
            <Button onPress={onClose} variant="ghost" size="sm" className="p-1">
              <Text className="text-foreground text-base font-bold">✕</Text>
            </Button>
          </View>
        ) : undefined
      }
    >
      <View className="w-full gap-5">
        {/* Banner Card */}
        <View className="border-border bg-card items-center gap-1 rounded-2xl border p-5 shadow-sm">
          <Text className="text-4xl">👑</Text>
          <Text className="text-xs font-black tracking-widest text-[#E5A93C] uppercase">Game Night Champion</Text>
          <Text className="text-foreground text-2xl font-black">
            {winner ? `${winner.name} Wins!` : 'Match Completed'}
          </Text>
          <Text className="text-muted-foreground text-xs font-semibold">
            {game.name || 'Match'} • {(game.rounds || []).length} Rounds Logged
          </Text>
        </View>

        {/* Podium Standings */}
        <View className="flex-row items-end justify-center gap-2 pt-1">
          {/* 2nd Place */}
          {secondPlace && (
            <Card className="border-border bg-card flex-1 items-center p-3.5">
              <CardContent className="items-center gap-1 p-0">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#3B5998]">
                  <Text className="text-xs font-black text-white">2</Text>
                </View>
                <Text className="text-foreground text-xs font-bold" numberOfLines={1}>
                  {secondPlace.name}
                </Text>
                <Text className="text-foreground text-base font-black">{totals[secondPlace.id] ?? 0}</Text>
                <Text className="text-muted-foreground text-[9px] font-semibold">2nd Place</Text>
              </CardContent>
            </Card>
          )}

          {/* 1st Place */}
          {winner && (
            <Card className="flex-[1.2] items-center border-2 border-[#E5A93C] bg-[#E5A93C]/15 p-4 shadow-sm">
              <CardContent className="items-center gap-1 p-0">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E5A93C]">
                  <Text className="text-sm font-black text-black">1</Text>
                </View>
                <Text className="text-foreground text-sm font-black" numberOfLines={1}>
                  {winner.name}
                </Text>
                <Text className="text-foreground text-xl font-black">{totals[winner.id] ?? 0}</Text>
                <Badge className="mt-0.5 bg-[#E5A93C] px-2 py-0.5">
                  <Text className="text-[10px] font-black text-black uppercase">🏆 Winner</Text>
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* 3rd Place */}
          {thirdPlace && (
            <Card className="border-border bg-card flex-1 items-center p-3.5">
              <CardContent className="items-center gap-1 p-0">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#D96B43]">
                  <Text className="text-xs font-black text-white">3</Text>
                </View>
                <Text className="text-foreground text-xs font-bold" numberOfLines={1}>
                  {thirdPlace.name}
                </Text>
                <Text className="text-foreground text-base font-black">{totals[thirdPlace.id] ?? 0}</Text>
                <Text className="text-muted-foreground text-[9px] font-semibold">3rd Place</Text>
              </CardContent>
            </Card>
          )}
        </View>

        {/* Remaining Players Standings (if 4+ players) */}
        {remainingPlayers.length > 0 && (
          <View className="gap-2">
            <Text className="text-muted-foreground text-xs font-black uppercase">📊 Final Standings:</Text>
            <Card className="border-border bg-card p-3.5">
              <CardContent className="gap-2 p-0">
                {remainingPlayers.map((player, idx) => (
                  <View
                    key={player.id}
                    className="border-border/40 flex-row items-center justify-between border-b py-1.5 last:border-b-0"
                  >
                    <View className="flex-row items-center gap-2">
                      <View className="bg-muted h-5 w-5 items-center justify-center rounded-full">
                        <Text className="text-muted-foreground text-[10px] font-black">{idx + 4}</Text>
                      </View>
                      <Text className="text-foreground text-xs font-bold">{player.name}</Text>
                    </View>
                    <Text className="text-foreground text-xs font-black">{totals[player.id] ?? 0}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          </View>
        )}

        {/* Match Highlights */}
        {highlights && highlights.length > 0 && (
          <View className="gap-2">
            <Text className="text-muted-foreground text-xs font-black uppercase">⚡ Match Highlights:</Text>
            {highlights.map((h, idx) => (
              <Card key={idx} className="border-border bg-card p-3.5">
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

        {/* Action Buttons */}
        <View className="flex-row gap-3 pt-2 pb-10">
          <Button
            onPress={onRematch}
            className="bg-primary min-h-[52px] flex-1 items-center justify-center rounded-2xl py-4 shadow"
          >
            <Text className="text-primary-foreground text-sm font-black">🔄 Rematch</Text>
          </Button>

          <Button
            onPress={onClose}
            variant="outline"
            className="border-border bg-popover min-h-[52px] items-center justify-center rounded-2xl px-6 py-4"
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

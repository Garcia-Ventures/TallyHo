import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import React from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { GameSession } from '../types/game';
import { calculateGameHighlights, calculatePlayerTotals, getSortedPlayers } from '../utils/scoring';

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
    <View className="flex-1 justify-between gap-4 bg-[#FDFBF7] p-5">
      {/* Header */}
      <View className="items-center gap-1 rounded-2xl bg-[#2C302E] p-4">
        <Text className="text-3xl">👑</Text>
        <Text className="text-xs font-black tracking-widest text-[#E5A93C] uppercase">Game Night Champion</Text>
        <Text className="text-2xl font-black text-white">{winner ? `${winner.name} Wins!` : 'Match Completed'}</Text>
        <Text className="text-xs text-gray-300">
          {game.name} • {game.rounds.length} Rounds Logged
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 16 }}>
        {/* Podium Standings */}
        <View className="flex-row items-end justify-center gap-2 pt-2">
          {/* 2nd Place */}
          {secondPlace && (
            <Card className="flex-1 items-center border-[#E5E0D8] bg-[#F7F4EE] p-3">
              <CardContent className="items-center gap-1 p-0">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#3B5998]">
                  <Text className="text-xs font-black text-white">2</Text>
                </View>
                <Text className="text-xs font-bold text-[#2C302E]" numberOfLines={1}>
                  {secondPlace.name}
                </Text>
                <Text className="text-base font-black text-[#2C302E]">{totals[secondPlace.id]}</Text>
                <Text className="text-[9px] text-[#5A605C]">2nd Place</Text>
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
                <Text className="text-sm font-black text-[#2C302E]" numberOfLines={1}>
                  {winner.name}
                </Text>
                <Text className="text-xl font-black text-[#2C302E]">{totals[winner.id]}</Text>
                <Badge className="bg-[#E5A93C] px-2 py-0.5">
                  <Text className="text-[10px] font-black text-black uppercase">🏆 Winner</Text>
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* 3rd Place */}
          {thirdPlace && (
            <Card className="flex-1 items-center border-[#E5E0D8] bg-[#F7F4EE] p-3">
              <CardContent className="items-center gap-1 p-0">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#D96B43]">
                  <Text className="text-xs font-black text-white">3</Text>
                </View>
                <Text className="text-xs font-bold text-[#2C302E]" numberOfLines={1}>
                  {thirdPlace.name}
                </Text>
                <Text className="text-base font-black text-[#2C302E]">{totals[thirdPlace.id]}</Text>
                <Text className="text-[9px] text-[#5A605C]">3rd Place</Text>
              </CardContent>
            </Card>
          )}
        </View>

        {/* Match Highlights */}
        {highlights.length > 0 && (
          <View className="gap-2">
            <Text className="text-xs font-black text-[#5A605C] uppercase">⚡ Match Highlights:</Text>
            {highlights.map((h, idx) => (
              <Card key={idx} className="border-[#E5E0D8] bg-[#F7F4EE] p-3">
                <CardContent className="flex-row items-center justify-between p-0">
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-bold text-[#2C302E]">{h.title}</Text>
                    <Text className="text-[10px] text-[#5A605C]">{h.description}</Text>
                  </View>
                  <Badge variant="secondary" className="bg-[#E5A93C]/20 px-2 py-1">
                    <Text className="text-[10px] font-bold text-[#2C302E]">{h.badge}</Text>
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View className="flex-row gap-2.5">
        <Button onPress={onRematch} className="flex-1 items-center justify-center rounded-2xl bg-[#2C302E] py-4 shadow">
          <Text className="text-sm font-black text-white">🔄 Rematch</Text>
        </Button>

        <Button
          onPress={onClose}
          variant="outline"
          className="items-center justify-center rounded-2xl border-[#E5E0D8] bg-white px-6 py-4"
        >
          <Text className="text-sm font-bold text-[#2C302E]">Home</Text>
        </Button>
      </View>
    </View>
  );

  if (isRouteModal) {
    return content;
  }

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/70">
        <View className="h-[85%] overflow-hidden rounded-t-3xl border-t border-[#E5E0D8] bg-[#FDFBF7] shadow-2xl">
          {content}
        </View>
      </View>
    </Modal>
  );
};

export const GameOverModalNative = GameOverModal;

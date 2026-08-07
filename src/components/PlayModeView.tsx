import { Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { GameSession, Player, RoundScore } from '../types/game';
import { calculatePlayerTotals } from '../utils/scoring';

interface PlayModeViewProps {
  game: GameSession;
  onScoreSubmitted: (score: RoundScore) => void;
  onFlipToDashboard: () => void;
  onEndMatch: () => void;
}

export const PlayModeView: React.FC<PlayModeViewProps> = ({
  game,
  onScoreSubmitted,
  onFlipToDashboard,
  onEndMatch,
}) => {
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);
  const [scoreInput, setScoreInput] = useState('');
  const [bonusInput, setBonusInput] = useState('');
  const [penaltyInput, setPenaltyInput] = useState('');

  const activePlayer: Player | undefined = game.players[selectedPlayerIndex];
  const totals = calculatePlayerTotals(game);
  const currentRoundNumber = game.rounds.length > 0 ? game.rounds.length : 1;

  const handleKeyTap = (key: string) => {
    if (key === 'DEL') {
      setScoreInput((prev) => prev.slice(0, -1));
    } else if (key === 'CLR') {
      setScoreInput('');
      setBonusInput('');
      setPenaltyInput('');
    } else {
      if (scoreInput.length < 5) {
        setScoreInput((prev) => prev + key);
      }
    }
  };

  const handleSubmit = () => {
    if (!activePlayer) {
      return;
    }
    const points = parseInt(scoreInput || '0', 10);
    const bonus = parseInt(bonusInput || '0', 10);
    const penalty = parseInt(penaltyInput || '0', 10);

    onScoreSubmitted({
      playerId: activePlayer.id,
      points,
      bonusPoints: bonus > 0 ? bonus : undefined,
      penaltyPoints: penalty > 0 ? penalty : undefined,
    });

    setScoreInput('');
    setBonusInput('');
    setPenaltyInput('');

    // Advance to next player in turn order
    if (selectedPlayerIndex < game.players.length - 1) {
      setSelectedPlayerIndex((prev) => prev + 1);
    } else {
      setSelectedPlayerIndex(0);
    }
  };

  return (
    <ScrollView
      className="bg-background flex-1 p-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
    >
      {/* Header Controls */}
      <Card className="border-border bg-card flex-row items-center justify-between rounded-2xl border p-4 shadow">
        <CardContent className="w-full flex-row items-center justify-between p-0">
          <View>
            <Text className="text-xs font-black tracking-widest text-[#E5A93C] uppercase">Turn-by-Turn Play Mode</Text>
            <Text className="text-foreground text-lg font-black">Round {currentRoundNumber}</Text>
          </View>

          <View className="flex-row gap-2">
            <Button onPress={onFlipToDashboard} variant="outline" size="sm" className="rounded-xl px-3 py-2">
              <Text className="text-foreground text-xs font-bold">📋 Dashboard</Text>
            </Button>
            <Button onPress={onEndMatch} size="sm" className="rounded-xl bg-[#C84B31] px-3 py-2">
              <Text className="text-xs font-bold text-white">🏆 End</Text>
            </Button>
          </View>
        </CardContent>
      </Card>

      {/* Player Turn Selector Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ gap: 10 }}
      >
        {game.players.map((player, idx) => {
          const isSelected = idx === selectedPlayerIndex;
          return (
            <Pressable
              key={player.id}
              onPress={() => setSelectedPlayerIndex(idx)}
              className={`will-change-variable min-w-[115px] items-center gap-1 rounded-2xl border p-3 ${
                isSelected ? 'border-2 border-[#E5A93C] bg-[#E5A93C]/15 shadow-sm' : 'border-border bg-card'
              }`}
            >
              <View
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: player.color }}
              >
                <Text className="text-xs font-black text-white">{player.initials}</Text>
              </View>
              <Text className="text-foreground text-xs font-bold" numberOfLines={1}>
                {player.name}
              </Text>
              <Text className="text-muted-foreground text-[10px] font-extrabold">
                Total: {totals[player.id] || 0} pts
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Score Input Card */}
      {activePlayer && (
        <Card className="border-border bg-card gap-4 rounded-2xl border p-4 shadow-sm">
          <CardContent className="gap-4 p-0">
            <View className="border-border flex-row items-center justify-between border-b pb-3">
              <View className="flex-row items-center gap-2.5">
                <View
                  className="h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: activePlayer.color }}
                >
                  <Text className="text-sm font-black text-white">{activePlayer.initials}</Text>
                </View>
                <View>
                  <Text className="text-muted-foreground text-xs">Logging score for:</Text>
                  <Text className="text-foreground text-base font-black">{activePlayer.name}</Text>
                </View>
              </View>

              <View className="border-border bg-popover items-end rounded-xl border px-3.5 py-1.5">
                <Text className="text-muted-foreground text-[10px]">Points Entry</Text>
                <Text className="text-foreground text-2xl font-black">{scoreInput || '0'}</Text>
              </View>
            </View>

            {/* Quick Keypad */}
            <View className="gap-2">
              <View className="flex-row gap-2">
                {['1', '2', '3', '4', '5'].map((digit) => (
                  <Button
                    key={digit}
                    onPress={() => handleKeyTap(digit)}
                    variant="outline"
                    className="flex-1 items-center rounded-xl py-3.5"
                  >
                    <Text className="text-foreground text-lg font-black">{digit}</Text>
                  </Button>
                ))}
              </View>
              <View className="flex-row gap-2">
                {['6', '7', '8', '9', '0'].map((digit) => (
                  <Button
                    key={digit}
                    onPress={() => handleKeyTap(digit)}
                    variant="outline"
                    className="flex-1 items-center rounded-xl py-3.5"
                  >
                    <Text className="text-foreground text-lg font-black">{digit}</Text>
                  </Button>
                ))}
              </View>
              <View className="flex-row gap-2">
                <Button
                  onPress={() => handleKeyTap('CLR')}
                  variant="destructive"
                  className="flex-1 items-center rounded-xl py-3.5"
                >
                  <Text className="text-xs font-bold text-white">CLR</Text>
                </Button>
                <Button
                  onPress={() => handleKeyTap('DEL')}
                  variant="secondary"
                  className="flex-1 items-center rounded-xl py-3.5"
                >
                  <Text className="text-muted-foreground text-xs font-bold">⌫</Text>
                </Button>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              onPress={handleSubmit}
              className="items-center justify-center rounded-xl bg-[#6A9C78] py-3.5 shadow"
            >
              <Text className="text-base font-black text-white">✓ Submit Round Score</Text>
            </Button>
          </CardContent>
        </Card>
      )}
    </ScrollView>
  );
};

export const PlayModeViewNative = PlayModeView;

import { Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { nativeSound } from '../services/audio';
import { GameSession, Player, RoundScore } from '../types/game';
import { calculatePlayerTotals } from '../utils/scoring';
import { ScreenContainer } from './ScreenContainer';

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
    if (key === 'DEL' || key === 'CLR') {
      nativeSound.playKeypadClear();
    } else {
      nativeSound.playKeypadTap();
    }

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
    nativeSound.playRoundSubmit();
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
    <ScreenContainer maxWidth="4xl">
      <View className="gap-4">
        {/* Header Controls */}
        <Card className="border-border bg-card flex-row items-center justify-between rounded-2xl border p-4 shadow">
          <CardContent className="w-full flex-row items-center justify-between gap-2 p-0">
            <View className="min-w-0 flex-1 gap-0.5 pr-2">
              <Text className="text-chip-mustard text-[10px] font-black tracking-widest uppercase">
                Turn-by-Turn Play Mode
              </Text>
              <Text className="text-foreground text-lg font-black" numberOfLines={1}>
                Round {currentRoundNumber}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Button
                onPress={() => {
                  nativeSound.playNavigationTap();
                  onFlipToDashboard();
                }}
                variant="outline"
                className="border-border bg-popover h-10 min-h-[40px] shrink-0 flex-row items-center justify-center rounded-xl px-3 py-0"
              >
                <Text className="text-foreground text-xs leading-none font-bold">📋 Dashboard</Text>
              </Button>
              <Button
                onPress={() => {
                  nativeSound.playNavigationTap();
                  onEndMatch();
                }}
                className="bg-ink-stamp h-10 min-h-[40px] shrink-0 flex-row items-center justify-center rounded-xl px-3.5 py-0"
              >
                <Text className="text-xs leading-none font-bold text-white">🏆 End</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Player Turn Selector Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ gap: 10, paddingRight: 10 }}
        >
          {game.players.map((player, idx) => {
            const isSelected = idx === selectedPlayerIndex;
            return (
              <Pressable
                key={player.id}
                onPress={() => {
                  nativeSound.playPlayerSwitch();
                  setSelectedPlayerIndex(idx);
                }}
                className={`will-change-variable min-w-[115px] shrink-0 items-center gap-1 rounded-2xl border p-3 ${
                  isSelected ? 'border-chip-mustard bg-chip-mustard/15 border-2 shadow-sm' : 'border-border bg-card'
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

              {/* Traditional Phone Keypad (3-wide, 0 centered on bottom row) */}
              <View className="mx-auto w-full max-w-xs gap-2.5">
                {[
                  ['1', '2', '3'],
                  ['4', '5', '6'],
                  ['7', '8', '9'],
                  ['CLR', '0', 'DEL'],
                ].map((row, rIdx) => (
                  <View key={rIdx} className="flex-row gap-2.5">
                    {row.map((btn) => (
                      <Button
                        key={btn}
                        onPress={() => handleKeyTap(btn)}
                        variant={btn === 'CLR' ? 'destructive' : btn === 'DEL' ? 'secondary' : 'outline'}
                        className="h-14 flex-1 items-center justify-center rounded-2xl py-0"
                      >
                        <Text
                          className={`text-xl leading-none font-black ${
                            btn === 'CLR' ? 'text-white' : 'text-foreground'
                          }`}
                        >
                          {btn === 'DEL' ? '⌫' : btn}
                        </Text>
                      </Button>
                    ))}
                  </View>
                ))}
              </View>

              {/* Submit Button */}
              <Button
                onPress={handleSubmit}
                className="bg-chip-sage mx-auto h-14 w-full max-w-xs items-center justify-center rounded-2xl py-0 shadow"
              >
                <Text className="text-base leading-none font-black text-white">✓ Submit Round Score</Text>
              </Button>
            </CardContent>
          </Card>
        )}
      </View>
    </ScreenContainer>
  );
};

export const PlayModeViewNative = PlayModeView;

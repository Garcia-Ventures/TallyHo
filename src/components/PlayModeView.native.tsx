import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GameSession, Player, RoundScore } from '../types/game';
import { calculatePlayerTotals } from '../utils/scoring';

interface PlayModeViewNativeProps {
  game: GameSession;
  onScoreSubmitted: (score: RoundScore) => void;
  onFlipToDashboard: () => void;
  onEndMatch: () => void;
}

export const PlayModeViewNative: React.FC<PlayModeViewNativeProps> = ({
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
      className="flex-1 bg-[#FDFBF7] p-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
    >
      {/* Header Controls */}
      <View className="flex-row items-center justify-between rounded-2xl border border-[#E5E0D8] bg-[#2C302E] p-4 shadow">
        <View>
          <Text className="text-xs font-black tracking-widest text-[#E5A93C] uppercase">Turn-by-Turn Play Mode</Text>
          <Text className="text-lg font-black text-white">Round {currentRoundNumber}</Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={onFlipToDashboard}
            className="rounded-xl border border-[#E5E0D8]/20 bg-white/10 px-3 py-2"
          >
            <Text className="text-xs font-bold text-white">📋 Dashboard</Text>
          </Pressable>
          <Pressable onPress={onEndMatch} className="rounded-xl bg-[#C84B31] px-3 py-2">
            <Text className="text-xs font-bold text-white">🏆 End</Text>
          </Pressable>
        </View>
      </View>

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
                isSelected ? 'border-2 border-[#E5A93C] bg-[#E5A93C]/15 shadow-sm' : 'border-[#E5E0D8] bg-[#F7F4EE]'
              }`}
            >
              <View
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: player.color }}
              >
                <Text className="text-xs font-black text-white">{player.initials}</Text>
              </View>
              <Text className="text-xs font-bold text-[#2C302E]" numberOfLines={1}>
                {player.name}
              </Text>
              <Text className="text-[10px] font-extrabold text-[#5A605C]">Total: {totals[player.id] || 0} pts</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Score Input Card */}
      {activePlayer && (
        <View className="gap-4 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-4 shadow-sm">
          <View className="flex-row items-center justify-between border-b border-[#E5E0D8] pb-3">
            <View className="flex-row items-center gap-2.5">
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: activePlayer.color }}
              >
                <Text className="text-sm font-black text-white">{activePlayer.initials}</Text>
              </View>
              <View>
                <Text className="text-xs text-[#5A605C]">Logging score for:</Text>
                <Text className="text-base font-black text-[#2C302E]">{activePlayer.name}</Text>
              </View>
            </View>

            <View className="items-end rounded-xl border border-[#E5E0D8] bg-white px-3.5 py-1.5">
              <Text className="text-[10px] text-[#5A605C]">Points Entry</Text>
              <Text className="text-2xl font-black text-[#2C302E]">{scoreInput || '0'}</Text>
            </View>
          </View>

          {/* Quick Keypad */}
          <View className="gap-2">
            <View className="flex-row gap-2">
              {['1', '2', '3', '4', '5'].map((digit) => (
                <Pressable
                  key={digit}
                  onPress={() => handleKeyTap(digit)}
                  className="flex-1 items-center rounded-xl border border-[#E5E0D8] bg-white py-3.5"
                >
                  <Text className="text-lg font-black text-[#2C302E]">{digit}</Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row gap-2">
              {['6', '7', '8', '9', '0'].map((digit) => (
                <Pressable
                  key={digit}
                  onPress={() => handleKeyTap(digit)}
                  className="flex-1 items-center rounded-xl border border-[#E5E0D8] bg-white py-3.5"
                >
                  <Text className="text-lg font-black text-[#2C302E]">{digit}</Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleKeyTap('CLR')}
                className="flex-1 items-center rounded-xl border border-red-200 bg-red-50 py-3.5"
              >
                <Text className="text-xs font-bold text-red-600">CLR</Text>
              </Pressable>
              <Pressable
                onPress={() => handleKeyTap('DEL')}
                className="flex-1 items-center rounded-xl border border-gray-300 bg-gray-100 py-3.5"
              >
                <Text className="text-xs font-bold text-[#5A605C]">⌫</Text>
              </Pressable>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            className="items-center justify-center rounded-xl bg-[#6A9C78] py-3.5 shadow"
          >
            <Text className="text-base font-black text-white">✓ Submit Round Score</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { GAME_PRESETS, GamePreset, PLAYER_COLORS, Player, RoundScoringType, ScoringMode } from '../types/game';

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: GamePreset | null;
  onStartGame: (setup: {
    name: string;
    presetId?: string;
    scoringMode: ScoringMode;
    roundScoringType: RoundScoringType;
    targetScore?: number;
    targetRounds?: number;
    players: Player[];
  }) => void;
  isRouteModal?: boolean;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  isOpen,
  onClose,
  preset,
  onStartGame,
  isRouteModal = false,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(preset?.id);
  const [matchName, setMatchName] = useState(preset?.name || 'Friday Game Night');
  const [scoringMode, setScoringMode] = useState<ScoringMode>(preset?.scoringMode || 'RACE_HIGH');
  const [roundScoringType, setRoundScoringType] = useState<RoundScoringType>(
    preset?.roundScoringType || 'EVERY_PLAYER',
  );
  const [targetScoreStr, setTargetScoreStr] = useState(
    preset?.defaultTargetScore ? String(preset.defaultTargetScore) : '100',
  );
  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: 'Eric', initials: 'E', color: PLAYER_COLORS[0].hex },
    { id: 'p2', name: 'Noah', initials: 'N', color: PLAYER_COLORS[1].hex },
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      return;
    }
    const name = newPlayerName.trim();
    const initials = name.slice(0, 2).toUpperCase();
    const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length].hex;
    setPlayers((prev) => [...prev, { id: `p_${Date.now()}_${Math.random()}`, name, initials, color }]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSelectPreset = (p: GamePreset) => {
    setSelectedPresetId(p.id);
    setMatchName(p.name);
    setScoringMode(p.scoringMode);
    setRoundScoringType(p.roundScoringType);
    if (p.defaultTargetScore) {
      setTargetScoreStr(String(p.defaultTargetScore));
    }
  };

  const handleStart = () => {
    if (players.length < 1) {
      return;
    }
    const targetScore = parseInt(targetScoreStr, 10);
    onStartGame({
      name: matchName || 'Game Night',
      presetId: selectedPresetId,
      scoringMode,
      roundScoringType,
      targetScore: isNaN(targetScore) ? undefined : targetScore,
      players,
    });
  };

  const content = (
    <View className="flex-1 bg-[#FDFBF7] p-5">
      {/* Unified Screen Header */}
      <View className="mb-4 flex-row items-center justify-between border-b border-[#E5E0D8] pb-3">
        <Text className="text-xl font-black text-[#2C302E]">New Game Setup</Text>
        <Pressable onPress={onClose} className="p-1">
          <Text className="text-base font-bold text-[#5A605C]">✕</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, gap: 18 }}>
        {/* Preset Selector */}
        <View className="gap-1.5">
          <Text className="text-xs font-bold text-[#5A605C]">Select Preset Rulebook:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ gap: 10 }}
          >
            {GAME_PRESETS.map((p) => {
              const isSelected = selectedPresetId === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => handleSelectPreset(p)}
                  className={`will-change-variable min-w-[130px] rounded-2xl border p-3.5 ${
                    isSelected ? 'border-2 border-[#C84B31] bg-[#C84B31]/10 shadow-sm' : 'border-[#E5E0D8] bg-[#F7F4EE]'
                  }`}
                >
                  <View className="mb-1 flex-row items-center justify-between">
                    <Text className="text-2xl">{p.icon}</Text>
                    {isSelected && (
                      <View className="rounded-full bg-[#C84B31] px-1.5 py-0.5">
                        <Text className="text-[9px] font-black text-white">SELECTED</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs font-black text-[#2C302E]">{p.name}</Text>
                  <Text className="mt-0.5 text-[10px] font-medium text-[#5A605C]">{p.badgeText}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Match Name Input */}
        <View className="gap-1">
          <Text className="text-xs font-bold text-[#5A605C]">Match Name</Text>
          <TextInput
            value={matchName}
            onChangeText={setMatchName}
            className="rounded-xl border border-[#E5E0D8] bg-white p-3.5 text-sm font-bold text-[#2C302E]"
            placeholder="e.g. Scrabble Finals"
          />
        </View>

        {/* Target Score */}
        <View className="gap-1">
          <Text className="text-xs font-bold text-[#5A605C]">Target Winning Score</Text>
          <TextInput
            value={targetScoreStr}
            onChangeText={setTargetScoreStr}
            keyboardType="numeric"
            className="rounded-xl border border-[#E5E0D8] bg-white p-3.5 text-sm font-bold text-[#2C302E]"
            placeholder="100"
          />
        </View>

        {/* Player Roster */}
        <View className="gap-2">
          <Text className="text-xs font-bold text-[#5A605C]">Players ({players.length}):</Text>

          <View className="gap-2">
            {players.map((p) => (
              <View
                key={p.id}
                className="flex-row items-center justify-between rounded-xl border border-[#E5E0D8] bg-white p-3"
              >
                <View className="flex-row items-center gap-2.5">
                  <View
                    className="h-7 w-7 items-center justify-center rounded-full"
                    style={{ backgroundColor: p.color }}
                  >
                    <Text className="text-xs font-black text-white">{p.initials}</Text>
                  </View>
                  <Text className="text-xs font-bold text-[#2C302E]">{p.name}</Text>
                </View>
                <Pressable onPress={() => handleRemovePlayer(p.id)} className="p-1">
                  <Text className="text-xs font-bold text-red-500">Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View className="mt-1 flex-row gap-2">
            <TextInput
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              placeholder="Add player name..."
              className="flex-1 rounded-xl border border-[#E5E0D8] bg-white p-3 text-xs font-bold text-[#2C302E]"
            />
            <Pressable
              onPress={handleAddPlayer}
              className="items-center justify-center rounded-xl bg-[#2C302E] px-4 py-3"
            >
              <Text className="text-xs font-bold text-white">+ Add</Text>
            </Pressable>
          </View>
        </View>

        {/* Start Game Action */}
        <Pressable
          onPress={handleStart}
          className="mt-2 items-center justify-center rounded-2xl bg-[#C84B31] py-4 shadow"
        >
          <Text className="text-base font-black text-white">🚀 Start Match</Text>
        </Pressable>
      </ScrollView>
    </View>
  );

  if (isRouteModal) {
    return content;
  }

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="h-[90%] overflow-hidden rounded-t-3xl border-t border-[#E5E0D8] bg-[#FDFBF7] shadow-2xl">
          {content}
        </View>
      </View>
    </Modal>
  );
};

export const GameSetupModalNative = GameSetupModal;

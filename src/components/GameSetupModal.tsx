import { Button, Card, CardContent, Input, Text } from '@gv-tech/ui-native';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { PALETTE } from '../constants/colors';
import { nativeSound } from '../services/audio';
import { GAME_PRESETS, GamePreset, PLAYER_COLORS, Player, RoundScoringType, ScoringMode } from '../types/game';
import { ScreenContainer } from './ScreenContainer';

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
    nativeSound.playKeypadTap();
    const name = newPlayerName.trim();
    const initials = name.slice(0, 2).toUpperCase();
    const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length].hex;
    setPlayers((prev) => [...prev, { id: `p_${Date.now()}_${Math.random()}`, name, initials, color }]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    nativeSound.playUndo();
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSelectPreset = (p: GamePreset) => {
    nativeSound.playPresetSelect();
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
    <ScreenContainer scrollable={false} className="w-full flex-1">
      {!isRouteModal && (
        <View className="flex-row items-center justify-between pb-4">
          <Text className="text-foreground text-xl font-black">New Game Setup</Text>
          <Button onPress={onClose} variant="ghost" size="sm" className="p-1">
            <Text className="text-muted-foreground text-base font-bold">✕</Text>
          </Button>
        </View>
      )}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, gap: 18 }}
      >
        {/* Preset Selector */}
        <View className="gap-1.5">
          <Text className="text-muted-foreground text-xs font-bold">Select Preset Rulebook:</Text>
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
                  className={`will-change-variable min-w-[145px] rounded-2xl border p-3.5 ${
                    isSelected ? 'border-ink-stamp bg-ink-stamp/10 border-2 shadow-sm' : 'border-border bg-card'
                  }`}
                >
                  <View className="mb-1 flex-row items-center justify-between">
                    <Text className="text-2xl">{p.icon}</Text>
                    {isSelected && (
                      <View className="bg-ink-stamp rounded-full px-2 py-0.5">
                        <Text className="text-[9px] font-black text-white">SELECTED</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-foreground text-xs font-black">{p.name}</Text>
                  <Text className="text-muted-foreground mt-0.5 text-[10px] font-medium">{p.badgeText}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Match Name Input */}
        <View className="gap-1">
          <Text className="text-muted-foreground text-xs font-bold">Match Name</Text>
          <Input
            value={matchName}
            onChangeText={setMatchName}
            className="border-border bg-popover text-foreground h-12 rounded-xl border px-3.5 text-sm font-bold"
            placeholder="e.g. Scrabble Finals"
            placeholderTextColor={PALETTE.ink.light}
          />
        </View>

        {/* Target Score */}
        <View className="gap-1">
          <Text className="text-muted-foreground text-xs font-bold">Target Winning Score</Text>
          <Input
            value={targetScoreStr}
            onChangeText={setTargetScoreStr}
            keyboardType="numeric"
            className="border-border bg-popover text-foreground h-12 rounded-xl border px-3.5 text-sm font-bold"
            placeholder="100"
            placeholderTextColor={PALETTE.ink.light}
          />
        </View>

        {/* Player Roster */}
        <View className="gap-2">
          <Text className="text-muted-foreground text-xs font-bold">Players ({players.length}):</Text>

          <View className="gap-2">
            {players.map((p) => (
              <Card
                key={p.id}
                className="border-border bg-popover flex-row items-center justify-between rounded-xl border p-3"
              >
                <CardContent className="w-full flex-row items-center justify-between p-0">
                  <View className="flex-row items-center gap-2.5">
                    <View
                      className="h-7 w-7 items-center justify-center rounded-full"
                      style={{ backgroundColor: p.color }}
                    >
                      <Text className="text-xs font-black text-white">{p.initials}</Text>
                    </View>
                    <Text className="text-foreground text-xs font-bold">{p.name}</Text>
                  </View>
                  <Button onPress={() => handleRemovePlayer(p.id)} variant="ghost" size="sm" className="p-1">
                    <Text className="text-xs font-bold text-red-500">Remove</Text>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </View>

          <View className="mt-1 flex-row gap-2">
            <Input
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              placeholder="Add player name..."
              placeholderTextColor={PALETTE.ink.light}
              className="border-border bg-popover text-foreground h-11 flex-1 rounded-xl border px-3 text-xs font-bold"
            />
            <Button onPress={handleAddPlayer} className="bg-primary items-center justify-center rounded-xl px-4 py-3">
              <Text className="text-primary-foreground text-xs font-bold">+ Add</Text>
            </Button>
          </View>
        </View>

        {/* Start Game Action */}
        <Button
          onPress={handleStart}
          className="bg-ink-stamp mt-2 h-14 items-center justify-center rounded-2xl py-0 shadow"
        >
          <Text className="text-base leading-none font-black text-white">🚀 Start Match</Text>
        </Button>
      </ScrollView>
    </ScreenContainer>
  );

  if (isRouteModal) {
    return content;
  }

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="border-border bg-background h-[90%] overflow-hidden rounded-t-3xl border-t shadow-2xl">
          {content}
        </View>
      </View>
    </Modal>
  );
};

export const GameSetupModalNative = GameSetupModal;

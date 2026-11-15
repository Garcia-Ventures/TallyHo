import { Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import React, { useState } from 'react';
import { View } from 'react-native';

import { nativeSound } from '../services/audio';
import type { Player, RoundScore } from '../types/game';
import { applyKeypadDigit, ScoreKeypadGrid } from './ScoreKeypadGrid';

interface ScoreKeypadModalProps {
  onClose: () => void;
  player: Player;
  onSubmitScore: (score: RoundScore) => void;
}

export const ScoreKeypadModal: React.FC<ScoreKeypadModalProps> = ({ onClose, player, onSubmitScore }) => {
  const [pointsStr, setPointsStr] = useState('');
  const [bonusStr, setBonusStr] = useState('');
  const [penaltyStr, setPenaltyStr] = useState('');

  const handleKeyPress = (val: string) => {
    if (val === 'DEL' || val === 'CLR') {
      nativeSound.playKeypadClear();
    } else {
      nativeSound.playKeypadTap();
    }

    if (val === 'CLR') {
      setPointsStr('');
      setBonusStr('');
      setPenaltyStr('');
      return;
    }
    setPointsStr((prev) => applyKeypadDigit(prev, val));
  };

  const handleSubmit = () => {
    nativeSound.playRoundSubmit();
    const pts = parseInt(pointsStr || '0', 10);

    const bonus = parseInt(bonusStr || '0', 10);
    const penalty = parseInt(penaltyStr || '0', 10);

    onSubmitScore({
      playerId: player.id,
      points: pts,
      bonusPoints: bonus > 0 ? bonus : undefined,
      penaltyPoints: penalty > 0 ? penalty : undefined,
    });

    onClose();
  };

  const content = (
    <View className="bg-background flex-1 items-center justify-between p-5">
      <View className="w-full max-w-sm flex-1 justify-between gap-4">
        {/* Header */}
        <View className="border-border flex-row items-center justify-between border-b pb-3">
          <View className="flex-row items-center gap-2.5">
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: player.color }}
            >
              <Text className="text-sm font-black text-white">{player.initials}</Text>
            </View>
            <View>
              <Text className="text-muted-foreground text-xs">Entering score for</Text>
              <Text className="text-foreground text-base font-black">{player.name}</Text>
            </View>
          </View>
        </View>

        {/* Number Display */}
        <Card className="border-border bg-card items-center justify-center rounded-2xl border px-4 py-6 shadow-inner">
          <CardContent className="items-center justify-center p-0">
            <Text className="text-muted-foreground mb-1 text-xs font-bold">SCORE</Text>
            <Text className="text-foreground text-5xl font-black">{pointsStr || '0'}</Text>
          </CardContent>
        </Card>

        <ScoreKeypadGrid onKey={handleKeyPress} />

        {/* Submit Action */}
        <Button
          onPress={handleSubmit}
          className="bg-ink-stamp mt-2 h-14 items-center justify-center rounded-2xl py-0 shadow"
        >
          <Text className="text-base leading-none font-black text-white">Save Round Score</Text>
        </Button>
      </View>
    </View>
  );

  return content;
};

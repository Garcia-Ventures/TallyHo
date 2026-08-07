import { Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import React, { useState } from 'react';
import { Modal, View } from 'react-native';
import { nativeSound } from '../services/audio';
import { Player, RoundScore } from '../types/game';

interface ScoreKeypadModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onSubmitScore: (score: RoundScore) => void;
  isRouteModal?: boolean;
}

export const ScoreKeypadModal: React.FC<ScoreKeypadModalProps> = ({
  isOpen,
  onClose,
  player,
  onSubmitScore,
  isRouteModal = false,
}) => {
  const [pointsStr, setPointsStr] = useState('');
  const [bonusStr, setBonusStr] = useState('');
  const [penaltyStr, setPenaltyStr] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleKeyPress = (val: string) => {
    if (val === 'DEL' || val === 'CLR') {
      nativeSound.playKeypadClear();
    } else {
      nativeSound.playKeypadTap();
    }

    if (val === 'DEL') {
      setPointsStr((prev) => prev.slice(0, -1));
    } else if (val === 'CLR') {
      setPointsStr('');
      setBonusStr('');
      setPenaltyStr('');
    } else {
      if (pointsStr.length < 5) {
        setPointsStr((prev) => prev + val);
      }
    }
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

          {!isRouteModal && (
            <Button onPress={onClose} variant="ghost" size="sm" className="p-1">
              <Text className="text-muted-foreground text-base font-bold">✕</Text>
            </Button>
          )}
        </View>

        {/* Number Display */}
        <Card className="border-border bg-card items-center justify-center rounded-2xl border px-4 py-6 shadow-inner">
          <CardContent className="items-center justify-center p-0">
            <Text className="text-muted-foreground mb-1 text-xs font-bold">SCORE</Text>
            <Text className="text-foreground text-5xl font-black">{pointsStr || '0'}</Text>
          </CardContent>
        </Card>

        {/* Keypad Grid */}
        <View className="gap-2.5">
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
                  onPress={() => handleKeyPress(btn)}
                  variant={btn === 'CLR' ? 'destructive' : btn === 'DEL' ? 'secondary' : 'outline'}
                  className="h-14 flex-1 items-center justify-center rounded-2xl py-0"
                >
                  <Text
                    className={`text-xl leading-none font-black ${btn === 'CLR' ? 'text-white' : 'text-foreground'}`}
                  >
                    {btn === 'DEL' ? '⌫' : btn}
                  </Text>
                </Button>
              ))}
            </View>
          ))}
        </View>

        {/* Submit Action */}
        <Button
          onPress={handleSubmit}
          className="mt-2 h-14 items-center justify-center rounded-2xl bg-[#C84B31] py-0 shadow"
        >
          <Text className="text-base leading-none font-black text-white">Save Round Score</Text>
        </Button>
      </View>
    </View>
  );

  if (isRouteModal) {
    return content;
  }

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="border-border bg-background h-[85%] overflow-hidden rounded-t-3xl border-t shadow-2xl">
          {content}
        </View>
      </View>
    </Modal>
  );
};

export const ScoreKeypadModalNative = ScoreKeypadModal;

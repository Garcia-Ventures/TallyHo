import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Player, RoundScore } from '../types/game';

interface ScoreKeypadModalNativeProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onSubmitScore: (score: RoundScore) => void;
}

export const ScoreKeypadModalNative: React.FC<ScoreKeypadModalNativeProps> = ({
  isOpen,
  onClose,
  player,
  onSubmitScore,
}) => {
  const [pointsStr, setPointsStr] = useState('');
  const [bonusStr, setBonusStr] = useState('');
  const [penaltyStr, setPenaltyStr] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleKeyPress = (val: string) => {
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

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="space-y-4 rounded-t-3xl border-t border-[#E5E0D8] bg-[#FDFBF7] p-5 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-[#E5E0D8] pb-3">
            <View className="flex-row items-center gap-2">
              <View
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: player.color }}
              >
                <Text className="text-xs font-black text-white">{player.initials}</Text>
              </View>
              <Text className="text-base font-black text-[#2C302E]">{player.name}'s Score</Text>
            </View>

            <Pressable onPress={onClose} className="p-1">
              <Text className="text-base font-bold text-[#5A605C]">✕</Text>
            </Pressable>
          </View>

          {/* Number Display */}
          <View className="items-center justify-center rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-4">
            <Text className="text-4xl font-black text-[#2C302E]">{pointsStr || '0'}</Text>
          </View>

          {/* Keypad Grid */}
          <View className="space-y-2">
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['CLR', '0', 'DEL'],
            ].map((row, rIdx) => (
              <View key={rIdx} className="flex-row gap-2">
                {row.map((btn) => (
                  <Pressable
                    key={btn}
                    onPress={() => handleKeyPress(btn)}
                    className={`flex-1 items-center justify-center rounded-2xl border py-4 ${
                      btn === 'CLR'
                        ? 'border-red-200 bg-red-50'
                        : btn === 'DEL'
                          ? 'border-gray-300 bg-gray-100'
                          : 'border-[#E5E0D8] bg-white'
                    }`}
                  >
                    <Text className={`text-xl font-black ${btn === 'CLR' ? 'text-red-600' : 'text-[#2C302E]'}`}>
                      {btn}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>

          {/* Submit Action */}
          <Pressable
            onPress={handleSubmit}
            className="items-center justify-center rounded-2xl bg-[#C84B31] py-4 shadow"
          >
            <Text className="text-base font-black text-white">Save Round Score</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

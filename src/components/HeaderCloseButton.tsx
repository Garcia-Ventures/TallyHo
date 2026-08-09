import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import { Pressable } from 'react-native';
import { PALETTE } from '../constants/colors';
import { nativeSound } from '../services/audio';

interface HeaderCloseButtonProps {
  onPress?: () => void;
  tintColor?: string;
}

export const HeaderCloseButton: React.FC<HeaderCloseButtonProps> = ({ onPress, tintColor }) => {
  const router = useRouter();

  const handlePress = () => {
    nativeSound.playNavigationTap();
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      className="items-center justify-center rounded-full p-2 active:bg-black/10 dark:active:bg-white/10"
      accessibilityLabel="Close modal"
      accessibilityRole="button"
    >
      <X size={20} color={tintColor || PALETTE.ink.muted} />
    </Pressable>
  );
};

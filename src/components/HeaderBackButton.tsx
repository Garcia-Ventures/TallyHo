import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { nativeSound } from '../services/audio';

interface HeaderBackButtonProps {
  onPress?: () => void;
  label?: string;
  tintColor?: string;
}

export const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({ onPress, label, tintColor }) => {
  const router = useRouter();

  const handlePress = () => {
    nativeSound.playNavigationTap();
    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      className="flex-row items-center gap-1.5 rounded-full px-2 py-1.5 active:bg-black/10 dark:active:bg-white/10"
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <ArrowLeft size={20} color={tintColor || '#5A605C'} />
      {label ? <Text className="text-foreground text-xs font-bold">{label}</Text> : null}
    </Pressable>
  );
};

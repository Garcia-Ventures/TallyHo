import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { PALETTE } from '../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  PALETTE.chip.mustard,
  PALETTE.chip.sage,
  PALETTE.chip.terracotta,
  PALETTE.chip.navy,
  PALETTE.ink.stamp,
  PALETTE.chip.purple,
];
const PARTICLE_COUNT = 50;

interface ConfettiParticleProps {
  index: number;
}

const Particle: React.FC<ConfettiParticleProps> = ({ index }) => {
  const startX = Math.random() * SCREEN_WIDTH;
  const startY = -30;

  const driftX = (Math.random() - 0.5) * 160;
  const targetY = SCREEN_HEIGHT + 60;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const sizeWidth = Math.random() * 8 + 6;
  const sizeHeight = Math.random() * 12 + 8;

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const delay = Math.random() * 600;
    const duration = 2500 + Math.random() * 1200;

    translateX.value = withDelay(delay, withTiming(startX + driftX, { duration }));
    translateY.value = withDelay(delay, withTiming(targetY, { duration }));
    rotate.value = withDelay(delay, withTiming(Math.random() > 0.5 ? 720 : -720, { duration }));
    opacity.value = withDelay(delay + duration - 800, withTiming(0, { duration: 800 }));
  }, [startX, startY, driftX, targetY, translateX, translateY, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className="absolute rounded-xs"
      style={[
        animatedStyle,
        {
          width: sizeWidth,
          height: sizeHeight,
          backgroundColor: color,
        },
      ]}
    />
  );
};

export const ConfettiCelebration: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('canvas-confetti')
        .then((confettiModule) => {
          const confetti = confettiModule.default || confettiModule;
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
          });
        })
        .catch(() => {});
    }
  }, []);

  return (
    <View className="absolute inset-0 z-50 overflow-hidden" style={{ pointerEvents: 'none' }}>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </View>
  );
};

export const ConfettiCelebrationNative = ConfettiCelebration;

import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = ['#E5A93C', '#6A9C78', '#D96B43', '#3B5998', '#C84B31', '#8B6B9C'];
const PARTICLE_COUNT = 40;

interface ConfettiParticleProps {
  index: number;
}

const Particle: React.FC<ConfettiParticleProps> = ({ index }) => {
  const startX = SCREEN_WIDTH / 2;
  const startY = SCREEN_HEIGHT * 0.5;

  const targetX = Math.random() * SCREEN_WIDTH;
  const targetY = Math.random() * (SCREEN_HEIGHT * 0.8);
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = Math.random() * 8 + 6;

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const delay = Math.random() * 200;
    translateX.value = withDelay(delay, withTiming(targetX, { duration: 1200 }));
    translateY.value = withDelay(delay, withTiming(targetY + 200, { duration: 1500 }));
    rotate.value = withDelay(delay, withTiming(720, { duration: 1500 }));
    opacity.value = withDelay(delay + 800, withTiming(0, { duration: 700 }));
  }, [translateX, translateY, rotate, opacity, targetX, targetY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className="absolute rounded-sm"
      style={[
        animatedStyle,
        {
          width: size,
          height: size,
          backgroundColor: color,
        },
      ]}
    />
  );
};

export const ConfettiCelebrationNative: React.FC = () => {
  return (
    <View className="pointer-events-none absolute inset-0 z-50">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </View>
  );
};

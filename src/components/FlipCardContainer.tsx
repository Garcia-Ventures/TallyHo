import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface FlipCardContainerProps {
  isFlipped: boolean;
  frontComponent: React.ReactNode;
  backComponent: React.ReactNode;
  duration?: number;
}

export const FlipCardContainer: React.FC<FlipCardContainerProps> = ({
  isFlipped,
  frontComponent,
  backComponent,
  duration = 500,
}) => {
  const flipProgress = useSharedValue(isFlipped ? 1 : 0);

  useEffect(() => {
    flipProgress.value = withTiming(isFlipped ? 1 : 0, {
      duration,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [isFlipped, duration, flipProgress]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg`;
    return {
      transform: [{ perspective: 1200 }, { rotateY }],
      backfaceVisibility: 'hidden',
      zIndex: flipProgress.value >= 0.5 ? 0 : 10,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg`;
    return {
      transform: [{ perspective: 1200 }, { rotateY }],
      backfaceVisibility: 'hidden',
      zIndex: flipProgress.value >= 0.5 ? 10 : 0,
    };
  });

  return (
    <View className="bg-background relative w-full flex-1">
      {/* Front Face (Scoreboard Dashboard) */}
      <Animated.View
        className="bg-background absolute top-0 right-0 bottom-0 left-0 flex-1"
        style={[frontAnimatedStyle]}
        pointerEvents={isFlipped ? 'none' : 'auto'}
      >
        {frontComponent}
      </Animated.View>

      {/* Back Face (Play Mode Sheet) */}
      <Animated.View
        className="bg-background absolute top-0 right-0 bottom-0 left-0 flex-1"
        style={[backAnimatedStyle]}
        pointerEvents={!isFlipped ? 'none' : 'auto'}
      >
        {backComponent}
      </Animated.View>
    </View>
  );
};

export const FlipCardContainerNative = FlipCardContainer;

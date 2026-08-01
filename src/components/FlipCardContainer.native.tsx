import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface FlipCardContainerProps {
  isFlipped: boolean;
  frontComponent: React.ReactNode;
  backComponent: React.ReactNode;
  duration?: number;
}

export const FlipCardContainerNative: React.FC<FlipCardContainerProps> = ({
  isFlipped,
  frontComponent,
  backComponent,
  duration = 600,
}) => {
  const flipRotation = useSharedValue(isFlipped ? 180 : 0);

  useEffect(() => {
    flipRotation.value = withTiming(isFlipped ? 180 : 0, { duration });
  }, [isFlipped, duration, flipRotation]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${flipRotation.value}deg`;
    return {
      transform: [{ perspective: 1000 }, { rotateY }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${flipRotation.value + 180}deg`;
    return {
      transform: [{ perspective: 1000 }, { rotateY }],
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <View className="relative min-h-[500px] w-full">
      {/* Front Face (Scoreboard Dashboard) */}
      <Animated.View className="h-full w-full" style={frontAnimatedStyle} pointerEvents={isFlipped ? 'none' : 'auto'}>
        {frontComponent}
      </Animated.View>

      {/* Back Face (Play Mode Sheet) */}
      <Animated.View
        className="absolute top-0 left-0 h-full w-full"
        style={backAnimatedStyle}
        pointerEvents={!isFlipped ? 'none' : 'auto'}
      >
        {backComponent}
      </Animated.View>
    </View>
  );
};

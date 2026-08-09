import React from 'react';
import { ColorValue, Platform, StyleProp, Text, View, ViewStyle } from 'react-native';

export interface CustomHeaderProps {
  options: {
    title?: string;
    maxWidthClass?: string;
    headerStyle?: StyleProp<ViewStyle>;
    headerTintColor?: ColorValue;
    headerLeft?: (props: { canGoBack: boolean }) => React.ReactNode;
    headerRight?: (props: { canGoBack: boolean }) => React.ReactNode;
  };
  route: {
    name: string;
  };
  back?: {
    title?: string;
  };
}

export function CustomHeader({ options, route, back }: CustomHeaderProps) {
  if (Platform.OS !== 'web') {
    return null;
  }

  const title = options.title || route.name;
  const maxWidthClass = options.maxWidthClass || 'max-w-4xl';
  const headerStyleObj = (options.headerStyle || {}) as { backgroundColor?: string };
  const backgroundColor = headerStyleObj.backgroundColor || '#F7F4EE';

  return (
    <View className="border-border w-full border-b" style={{ backgroundColor }}>
      <View className={`mx-auto h-14 w-full flex-row items-center justify-between px-5 sm:px-8 ${maxWidthClass}`}>
        <View className="min-w-[40px] items-start justify-center">
          {options.headerLeft ? options.headerLeft({ canGoBack: !!back }) : null}
        </View>

        <Text className="text-foreground text-center text-base font-black" style={{ color: options.headerTintColor }}>
          {title}
        </Text>

        <View className="min-w-[40px] items-end justify-center">
          {options.headerRight ? options.headerRight({ canGoBack: !!back }) : null}
        </View>
      </View>
    </View>
  );
}

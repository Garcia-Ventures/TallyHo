import React from 'react';
import {
  ColorValue,
  Image,
  ImageSourcePropType,
  Platform,
  StyleProp,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';

import logoHorizontalDark from '../../assets/logo-horizontal-dark.png';
import logoHorizontal from '../../assets/logo-horizontal.png';
import { PALETTE } from '../constants/colors';
import { useSettingsStore } from '../stores/useSettingsStore';

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

  const themeMode = useSettingsStore((state) => state.settings.themeMode);
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const logoSource = isDark ? logoHorizontalDark : logoHorizontal;

  const isHome = route.name === 'index';
  const title = options.title || route.name;
  const maxWidthClass = options.maxWidthClass || 'max-w-4xl';
  const headerStyleObj = (options.headerStyle || {}) as { backgroundColor?: string };
  const backgroundColor = headerStyleObj.backgroundColor || (isDark ? PALETTE.dark.card : PALETTE.paper[100]);

  return (
    <View className="border-border w-full border-b" style={{ backgroundColor }}>
      <View className={`mx-auto h-20 w-full flex-row items-center justify-between px-5 sm:px-8 ${maxWidthClass}`}>
        <View className="min-w-[40px] items-start justify-center">
          {options.headerLeft ? options.headerLeft({ canGoBack: !!back }) : null}
        </View>

        {isHome ? (
          <View className="items-center justify-center">
            <Image
              source={logoSource as ImageSourcePropType}
              style={{ width: 165, height: 48 }}
              resizeMode="contain"
              accessibilityLabel="TallyHo Logo"
            />
          </View>
        ) : (
          <Text className="text-foreground text-center text-base font-black" style={{ color: options.headerTintColor }}>
            {title}
          </Text>
        )}

        <View className="min-w-[40px] items-end justify-center">
          {options.headerRight ? options.headerRight({ canGoBack: !!back }) : null}
        </View>
      </View>
    </View>
  );
}

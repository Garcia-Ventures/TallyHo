import '../src/global.css';
import '../src/shim-require';
import { ThemeProvider } from '@gv-tech/ui-native';
import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, Platform, useColorScheme } from 'react-native';

import logoHorizontalDark from '../assets/logo-horizontal-dark.png';
import logoHorizontal from '../assets/logo-horizontal.png';
import { CustomHeader, type CustomHeaderProps } from '../src/components/CustomHeader';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { HeaderBackButton } from '../src/components/HeaderBackButton';
import { HeaderCloseButton } from '../src/components/HeaderCloseButton';
import { PALETTE } from '../src/constants/colors';
import { initAnalytics } from '../src/services/analytics';
import { setProGrantListener } from '../src/services/purchases';
import { hydrateStorage } from '../src/services/storage';
import { useGameStore } from '../src/stores/useGameStore';
import { usePlayerLibraryStore } from '../src/stores/usePlayerLibraryStore';
import { useSettingsStore } from '../src/stores/useSettingsStore';
import { initAppSentry } from '../src/utils/initSentry';
import { AppToaster } from '../src/utils/toast';

initAppSentry();
setProGrantListener(() => {
  useSettingsStore.getState().purchaseRemoveAds();
});

function useIsDark(): boolean {
  const themeMode = useSettingsStore((state) => state.settings.themeMode);
  const systemScheme = useColorScheme();
  return themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
}

function useHeaderTintColor(): string {
  const isDark = useIsDark();
  return isDark ? PALETTE.dark.foreground : PALETTE.ink.primary;
}

// Stable module-scope header components (avoids redefining components during render).
function WebHeader(props: CustomHeaderProps) {
  return <CustomHeader {...props} />;
}

function AppLogoTitle() {
  const isDark = useIsDark();
  return (
    <Image
      source={(isDark ? logoHorizontalDark : logoHorizontal) as ImageSourcePropType}
      style={{ width: 140, height: 40 }}
      resizeMode="contain"
      accessibilityLabel="TallyHo Logo"
    />
  );
}

function ThemedHeaderCloseButton() {
  const tintColor = useHeaderTintColor();
  return <HeaderCloseButton tintColor={tintColor} />;
}

function GameOverHeaderCloseButton() {
  const tintColor = useHeaderTintColor();
  return (
    <HeaderCloseButton
      tintColor={tintColor}
      onPress={() => {
        useGameStore.getState().clearActiveGame();
      }}
    />
  );
}

function PrivacyHeaderBackButton() {
  const tintColor = useHeaderTintColor();
  return <HeaderBackButton tintColor={tintColor} />;
}

export default Sentry.wrap(function RootLayout() {
  const loadInitialData = useGameStore((state) => state.loadInitialData);
  const loadPlayers = usePlayerLibraryStore((state) => state.loadPlayers);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const themeMode = useSettingsStore((state) => state.settings.themeMode);
  const isDark = useIsDark();
  const tintColor = useHeaderTintColor();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      initAnalytics();
      await hydrateStorage();
      if (cancelled) {
        return;
      }
      loadInitialData();
      loadPlayers();
      loadSettings();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadInitialData, loadPlayers, loadSettings]);

  return (
    <ErrorBoundary>
      <ThemeProvider value={themeMode}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: isDark ? PALETTE.dark.card : PALETTE.paper[100],
            },
            headerTintColor: tintColor,
            headerTitleStyle: { fontWeight: '900' },
            headerTitleAlign: 'center',
            contentStyle: {
              backgroundColor: isDark ? PALETTE.dark.background : PALETTE.paper[50],
            },
            header: Platform.OS === 'web' ? WebHeader : undefined,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerTitle: AppLogoTitle,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="match/[id]"
            options={{
              title: 'Active Match',
              headerBackTitle: 'Home',
            }}
          />
          <Stack.Screen
            name="modal/setup"
            options={{
              presentation: 'modal',
              title: 'New Game Setup',
              headerShown: true,
              headerBackVisible: false,
              headerLeft: () => null,
              headerRight: ThemedHeaderCloseButton,
            }}
          />
          <Stack.Screen
            name="modal/keypad"
            options={{
              presentation: 'modal',
              title: 'Enter Score',
              headerShown: true,
              headerBackVisible: false,
              headerLeft: () => null,
              headerRight: ThemedHeaderCloseButton,
            }}
          />
          <Stack.Screen
            name="modal/game-over"
            options={{
              presentation: 'modal',
              title: '🏆 Game Night Champion',
              headerShown: true,
              headerBackVisible: false,
              headerLeft: () => null,
              headerRight: GameOverHeaderCloseButton,
            }}
          />
          <Stack.Screen
            name="modal/history-log"
            options={{
              presentation: 'modal',
              title: 'Match History',
              headerShown: true,
              headerBackVisible: false,
              headerLeft: () => null,
              headerRight: ThemedHeaderCloseButton,
            }}
          />
          <Stack.Screen
            name="modal/round-history"
            options={{
              presentation: 'modal',
              title: 'Round History',
              headerShown: true,
              headerBackVisible: false,
              headerLeft: () => null,
              headerRight: ThemedHeaderCloseButton,
            }}
          />
          <Stack.Screen
            name="modal/settings"
            options={{
              presentation: 'modal',
              title: 'App Settings',
              headerShown: true,
              headerBackVisible: false,
              headerLeft: () => null,
              headerRight: ThemedHeaderCloseButton,
            }}
          />
          <Stack.Screen
            name="privacy"
            options={{
              title: 'Privacy Policy',
              headerShown: true,
              headerLeft: PrivacyHeaderBackButton,
            }}
          />
        </Stack>
        <AppToaster />
      </ThemeProvider>
    </ErrorBoundary>
  );
});

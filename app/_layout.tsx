import '../src/global.css';

import { ThemeProvider } from '@gv-tech/ui-native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';

import * as Sentry from '@sentry/react-native';
import { CustomHeader } from '../src/components/CustomHeader';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { HeaderBackButton } from '../src/components/HeaderBackButton';
import { HeaderCloseButton } from '../src/components/HeaderCloseButton';
import { PALETTE } from '../src/constants/colors';
import { initAnalytics } from '../src/services/analytics';
import { useGameStore } from '../src/stores/useGameStore';
import { usePlayerLibraryStore } from '../src/stores/usePlayerLibraryStore';
import { useSettingsStore } from '../src/stores/useSettingsStore';

Sentry.init({
  dsn: 'https://ba35c9ea2c45d64b131f6b854cd5c3ea@o4511873601306624.ingest.us.sentry.io/4511873607991296',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function RootLayout() {
  const loadInitialData = useGameStore((state) => state.loadInitialData);
  const loadPlayers = usePlayerLibraryStore((state) => state.loadPlayers);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const themeMode = useSettingsStore((state) => state.settings.themeMode);
  const systemScheme = useColorScheme();

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const tintColor = isDark ? PALETTE.dark.foreground : PALETTE.ink.primary;

  useEffect(() => {
    initAnalytics();
    loadInitialData();
    loadPlayers();
    loadSettings();
  }, [loadInitialData, loadPlayers, loadSettings]);

  return (
    <ErrorBoundary>
      <ThemeProvider value={themeMode}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: isDark ? PALETTE.dark.card : PALETTE.paper[100] },
            headerTintColor: tintColor,
            headerTitleStyle: { fontWeight: '900' },
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: isDark ? PALETTE.dark.background : PALETTE.paper[50] },
            header: Platform.OS === 'web' ? (props) => <CustomHeader {...props} /> : undefined,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Tally Ho',
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
              headerRight: () => <HeaderCloseButton tintColor={tintColor} />,
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
              headerRight: () => <HeaderCloseButton tintColor={tintColor} />,
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
              headerRight: () => (
                <HeaderCloseButton
                  tintColor={tintColor}
                  onPress={() => {
                    useGameStore.getState().clearActiveGame();
                  }}
                />
              ),
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
              headerRight: () => <HeaderCloseButton tintColor={tintColor} />,
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
              headerRight: () => <HeaderCloseButton tintColor={tintColor} />,
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
              headerRight: () => <HeaderCloseButton tintColor={tintColor} />,
            }}
          />
          <Stack.Screen
            name="privacy"
            options={{
              title: 'Privacy Policy',
              headerShown: true,
              headerLeft: () => <HeaderBackButton tintColor={tintColor} />,
            }}
          />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
});

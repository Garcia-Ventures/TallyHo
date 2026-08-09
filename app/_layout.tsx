import '../src/global.css';

import { ThemeProvider } from '@gv-tech/ui-native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import * as Sentry from '@sentry/react-native';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
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

  useEffect(() => {
    loadInitialData();
    loadPlayers();
    loadSettings();
  }, [loadInitialData, loadPlayers, loadSettings]);

  return (
    <ErrorBoundary>
      <ThemeProvider value={themeMode}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: isDark ? '#232624' : '#F7F4EE' },
            headerTintColor: isDark ? '#F0ECE1' : '#2C302E',
            headerTitleStyle: { fontWeight: '900' },
            contentStyle: { backgroundColor: isDark ? '#181A19' : '#FDFBF7' },
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
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modal/keypad"
            options={{
              presentation: 'modal',
              title: 'Enter Score',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modal/game-over"
            options={{
              presentation: 'modal',
              title: 'Game Over',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modal/history-log"
            options={{
              presentation: 'modal',
              title: 'Match History',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modal/round-history"
            options={{
              presentation: 'modal',
              title: 'Round History',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modal/settings"
            options={{
              presentation: 'modal',
              title: 'Settings',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="privacy"
            options={{
              title: 'Privacy Policy',
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
});

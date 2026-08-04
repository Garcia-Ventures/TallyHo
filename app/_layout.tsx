import '../src/global.css';

import { ThemeProvider } from '@gv-tech/ui-native';
import { Stack } from 'expo-router';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { useGameStore } from '../src/stores/useGameStore';
import { usePlayerLibraryStore } from '../src/stores/usePlayerLibraryStore';
import { useSettingsStore } from '../src/stores/useSettingsStore';

export default function RootLayout() {
  const loadInitialData = useGameStore((state) => state.loadInitialData);
  const loadPlayers = usePlayerLibraryStore((state) => state.loadPlayers);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const themeMode = useSettingsStore((state) => state.settings.themeMode);
  const systemScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark);
        if (document.body) {
          document.body.classList.toggle('dark', isDark);
        }
      }
    } else {
      try {
        setColorScheme(isDark ? 'dark' : 'light');
      } catch {
        // Fallback for platform limitations
      }
    }
  }, [isDark, setColorScheme]);

  useEffect(() => {
    loadInitialData();
    loadPlayers();
    loadSettings();
  }, [loadInitialData, loadPlayers, loadSettings]);

  return (
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
      </Stack>
    </ThemeProvider>
  );
}

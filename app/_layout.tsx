import '../src/global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useGameStore } from '../src/stores/useGameStore';
import { usePlayerLibraryStore } from '../src/stores/usePlayerLibraryStore';
import { useSettingsStore } from '../src/stores/useSettingsStore';

export default function RootLayout() {
  const loadInitialData = useGameStore((state) => state.loadInitialData);
  const loadPlayers = usePlayerLibraryStore((state) => state.loadPlayers);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    loadInitialData();
    loadPlayers();
    loadSettings();
  }, [loadInitialData, loadPlayers, loadSettings]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#F7F4EE' },
        headerTintColor: '#2C302E',
        headerTitleStyle: { fontWeight: '900' },
        contentStyle: { backgroundColor: '#FDFBF7' },
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
        }}
      />
      <Stack.Screen
        name="modal/keypad"
        options={{
          presentation: 'modal',
          title: 'Enter Score',
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
        }}
      />
    </Stack>
  );
}

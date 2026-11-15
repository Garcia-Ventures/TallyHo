import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Text } from '@gv-tech/ui-native';
import { ExternalLink, HelpCircle, ShieldCheck, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, View } from 'react-native';

import { PALETTE } from '../../constants/colors';
import { useSafeRouter } from '../../hooks/useSafeRouter';
import { nativeSound } from '../../services/audio';
import { useGameStore } from '../../stores/useGameStore';
import { usePlayerLibraryStore } from '../../stores/usePlayerLibraryStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { showToast } from '../../utils/toast';

export function SettingsDataSection() {
  const router = useSafeRouter();
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const handleResetData = () => {
    Alert.alert(
      'Reset All Match Data?',
      'This will erase all active matches, history logs, and player profiles. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Everything',
          style: 'destructive',
          onPress: () => {
            useGameStore.getState().clearSession();
            usePlayerLibraryStore.getState().loadPlayers();
            resetSettings();
            nativeSound.playPresetSelect();
            showToast('Data Cleared', 'All local app data and match logs have been erased.');
          },
        },
      ],
    );
  };

  return (
    <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <CardHeader className="mb-4 gap-1 p-0">
        <View className="flex-row items-center gap-2">
          <View className="bg-chip-purple/15 h-8 w-8 items-center justify-center rounded-full">
            <ShieldCheck size={18} color={PALETTE.chip.purple} />
          </View>
          <CardTitle className="text-foreground text-lg font-black">Privacy & Legal</CardTitle>
        </View>
        <CardDescription className="text-muted-foreground text-xs font-medium">
          Review store privacy statements and manage local device data.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-3 p-0">
        <Pressable
          onPress={() => {
            nativeSound.playNavigationTap();
            router.push('/privacy');
          }}
          className="border-border bg-popover flex-row items-center justify-between rounded-xl border p-3.5"
        >
          <View className="flex-row items-center gap-2.5">
            <HelpCircle size={16} color={PALETTE.chip.purple} />
            <Text className="text-foreground text-xs font-bold">View Store Privacy Policy Page</Text>
          </View>
          <ExternalLink size={14} color={PALETTE.ink.muted} />
        </Pressable>

        <Button
          onPress={handleResetData}
          variant="destructive"
          className="h-auto min-h-[48px] flex-row items-center justify-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40"
        >
          <Trash2 size={16} color={PALETTE.status.errorText} className="shrink-0" />
          <Text className="text-xs font-bold text-red-600 dark:text-red-400">Reset Local Storage & Settings</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

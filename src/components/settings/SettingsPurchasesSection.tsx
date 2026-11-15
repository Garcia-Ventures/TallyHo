import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Switch, Text } from '@gv-tech/ui-native';
import { RotateCcw, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, View } from 'react-native';

import { PALETTE } from '../../constants/colors';
import { nativeSound } from '../../services/audio';
import { restoreAdFreePurchases } from '../../services/purchases';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { showToast } from '../../utils/toast';

interface SettingsPurchasesSectionProps {
  onUpgrade: () => void;
  onNeedsEmail: () => void;
}

export function SettingsPurchasesSection({ onUpgrade, onNeedsEmail }: SettingsPurchasesSectionProps) {
  const settings = useSettingsStore((state) => state.settings);
  const purchaseRemoveAds = useSettingsStore((state) => state.purchaseRemoveAds);
  const resetAdFreeStatus = useSettingsStore((state) => state.resetAdFreeStatus);
  const setAdBlockedState = useSettingsStore((state) => state.setAdBlockedState);
  const [isRestoring, setIsRestoring] = useState(false);

  return (
    <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <CardHeader className="mb-4 gap-1 p-0">
        <View className="flex-row items-center gap-2">
          <Sparkles size={18} color={PALETTE.chip.mustard} />
          <CardTitle className="text-foreground text-lg font-black">TallyHo Pro & Ad-Free</CardTitle>
        </View>
        <CardDescription className="text-muted-foreground text-xs font-medium">
          Enjoy zero advertisements and unlock unlimited offline scoring tools.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-3 p-0">
        {!settings.isAdFree ? (
          <View className="gap-3">
            <View className="border-border bg-popover flex-row items-center justify-between gap-3 rounded-xl border p-3.5">
              <View className="min-w-0 flex-1 pr-2">
                <Text className="text-foreground text-xs font-bold">Ad-Free Upgrade</Text>
                <Text className="text-muted-foreground text-[11px] leading-tight font-medium">
                  Removes all banners and sponsor cards
                </Text>
              </View>
              <Button onPress={onUpgrade} className="bg-chip-mustard h-9 shrink-0 rounded-xl px-4 shadow-sm">
                <Text className="text-xs font-black text-black">Upgrade</Text>
              </Button>
            </View>

            <Pressable
              onPress={async () => {
                setIsRestoring(true);
                try {
                  const result = await restoreAdFreePurchases();
                  if (result.success && result.isPro) {
                    purchaseRemoveAds();
                    nativeSound.playVictoryFanfare();
                    showToast('Purchases Restored! 🎉', 'Your TallyHo Pro entitlement is active.');
                  } else if (result.needsEmail) {
                    onNeedsEmail();
                  } else {
                    showToast(
                      'No Prior Purchase Found',
                      'We could not find an active TallyHo Pro purchase on this device.',
                      'destructive',
                    );
                  }
                } catch {
                  showToast('Restore Failed', 'Unable to restore purchases at this time.', 'destructive');
                } finally {
                  setIsRestoring(false);
                }
              }}
              disabled={isRestoring}
              className="border-border bg-popover flex-row items-center justify-between rounded-xl border p-3.5"
            >
              <Text className="text-foreground text-xs font-bold">
                {isRestoring ? 'Restoring Purchases...' : 'Restore Purchases'}
              </Text>
              {isRestoring ? (
                <ActivityIndicator size="small" color={PALETTE.chip.mustard} />
              ) : (
                <Text className="text-chip-mustard text-xs font-bold">→</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View className="gap-2">
            <Text className="text-foreground text-xs font-bold">Thank you for supporting TallyHo! 🎉</Text>
            <Text className="text-muted-foreground text-[11px] leading-relaxed">
              All sponsored ad cards are hidden across all screens.
            </Text>

            {__DEV__ && (
              <Button
                onPress={() => {
                  resetAdFreeStatus();
                  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
                    localStorage.removeItem('tallyho_web_app_user_id');
                  }
                  Alert.alert(
                    'Reset for Testing',
                    'Ad-Free status and cached Web session have been reset to simulate a fresh device.',
                  );
                }}
                variant="outline"
                className="border-border bg-popover mt-2 h-auto min-h-[44px] flex-row items-center justify-center gap-2 rounded-xl border-dashed px-3 py-2.5"
              >
                <RotateCcw size={14} color={PALETTE.ink.muted} />
                <Text className="text-foreground text-xs font-bold">[Dev Test] Reset Purchase & Web Session</Text>
              </Button>
            )}
          </View>
        )}

        {__DEV__ && (
          <View className="border-border/60 flex-row items-center justify-between gap-3 border-t pt-3">
            <View className="min-w-0 flex-1 pr-2">
              <Text className="text-foreground text-xs font-bold">Simulate Ad-Blocker Fallback</Text>
              <Text className="text-muted-foreground text-[10px] font-medium">
                Forces House Ad fallback banner for testing.
              </Text>
            </View>
            <Switch
              className="shrink-0"
              checked={settings.isAdBlocked ?? false}
              onCheckedChange={(val: boolean) => setAdBlockedState(val)}
            />
          </View>
        )}
      </CardContent>
    </Card>
  );
}

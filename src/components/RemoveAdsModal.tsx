import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import { CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native';
import { PALETTE } from '../constants/colors';
import { trackEvent } from '../services/analytics';
import { nativeSound } from '../services/audio';
import { purchaseAdFreePackage, restoreAdFreePurchases } from '../services/purchases';
import { useSettingsStore } from '../stores/useSettingsStore';

interface RemoveAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RemoveAdsModal({ isOpen, onClose }: RemoveAdsModalProps) {
  const { settings, purchaseRemoveAds, restorePurchases, resetAdFreeStatus } = useSettingsStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    trackEvent('purchase_attempt', { product: 'ad_free' });

    const result = await purchaseAdFreePackage();
    setIsProcessing(false);

    if (result.success && result.isAdFree) {
      purchaseRemoveAds();
      nativeSound.playVictoryFanfare();
      trackEvent('purchase_success', { product: 'ad_free' });
      Alert.alert('Upgrade Successful! 🎉', 'TallyHo is now 100% ad-free forever. Thank you for your support!', [
        { text: 'Awesome', onPress: onClose },
      ]);
    } else if (result.redirected) {
      // Stripe Web redirect opened
      onClose();
    } else {
      Alert.alert('Purchase Not Completed', 'The purchase process was not completed.');
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    const result = await restoreAdFreePurchases();
    setIsProcessing(false);

    if (result.success && result.isAdFree) {
      restorePurchases();
      nativeSound.playPresetSelect();
      trackEvent('purchases_restored');
      Alert.alert('Purchases Restored! 🎉', 'Your Ad-Free status has been restored successfully.');
      onClose();
    } else {
      Alert.alert(
        'No Prior Purchase Found',
        'We could not find an active Ad-Free purchase associated with this account or device.',
      );
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="border-border bg-card max-h-[85%] rounded-t-3xl border-t p-6 shadow-2xl">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-chip-mustard/20 h-10 w-10 items-center justify-center rounded-2xl">
                <Sparkles size={22} color={PALETTE.chip.mustard} />
              </View>
              <View>
                <Text className="text-foreground text-xl font-black">TallyHo Pro</Text>
                <Text className="text-muted-foreground text-xs font-semibold">Ad-Free Upgrade</Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              className="border-border bg-popover h-9 w-9 items-center justify-center rounded-full border"
            >
              <X size={18} color={PALETTE.ink.muted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {/* Status Badge */}
            {settings.isAdFree ? (
              <Card className="border-status-success-border bg-status-success-bg p-4">
                <CardContent className="flex-row items-center gap-3 p-0">
                  <CheckCircle2 size={20} color={PALETTE.status.successText} />
                  <View className="flex-1">
                    <Text className="text-status-success-text text-sm font-black">Ad-Free Active</Text>
                    <Text className="text-status-success-text text-xs">
                      You own the lifetime ad-free version. Thank you!
                    </Text>
                  </View>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-chip-mustard/40 bg-chip-mustard/10 p-5">
                <CardContent className="gap-2 p-0">
                  <Badge className="bg-chip-mustard self-start px-2.5 py-1">
                    <Text className="text-[10px] font-black text-black">ONE-TIME UNLOCK</Text>
                  </Badge>
                  <Text className="text-foreground text-2xl font-black">$1.99 Lifetime</Text>
                  <Text className="text-muted-foreground text-xs leading-relaxed font-medium">
                    Remove all banner & sponsored card placements forever across all devices. No recurring subscription.
                  </Text>
                </CardContent>
              </Card>
            )}

            {/* Feature Highlights */}
            <View className="gap-3">
              <View className="border-border bg-popover flex-row items-start gap-3 rounded-xl border p-4">
                <ShieldCheck size={20} color={PALETTE.chip.sage} className="mt-0.5" />
                <View className="flex-1">
                  <Text className="text-foreground text-xs font-black">100% Non-Intrusive & Private</Text>
                  <Text className="text-muted-foreground text-xs font-medium">
                    Eliminates all sponsored cards from home and post-game screens. Zero tracking scripts.
                  </Text>
                </View>
              </View>

              <View className="border-border bg-popover flex-row items-start gap-3 rounded-xl border p-4">
                <Sparkles size={20} color={PALETTE.chip.purple} className="mt-0.5" />
                <View className="flex-1">
                  <Text className="text-foreground text-xs font-black">Support Independent Devs</Text>
                  <Text className="text-muted-foreground text-xs font-medium">
                    Your contribution helps us keep TallyHo clean, fast, and constantly updated with new game rulebooks.
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            {!settings.isAdFree ? (
              <View className="gap-3 pt-2">
                <Button
                  onPress={handlePurchase}
                  disabled={isProcessing}
                  className="bg-chip-mustard h-13 flex-row items-center justify-center rounded-xl shadow"
                >
                  <Text className="text-base font-black text-black">
                    {isProcessing ? 'Processing...' : 'Unlock Ad-Free ($1.99)'}
                  </Text>
                </Button>

                <Button
                  onPress={handleRestore}
                  disabled={isProcessing}
                  variant="outline"
                  className="border-border h-11 items-center justify-center rounded-xl bg-transparent"
                >
                  <Text className="text-muted-foreground text-xs font-bold">
                    {isProcessing ? 'Restoring...' : 'Restore Previous Purchase'}
                  </Text>
                </Button>
              </View>
            ) : (
              <View className="gap-3 pt-2">
                <Button
                  onPress={onClose}
                  className="bg-primary h-12 flex-row items-center justify-center rounded-xl shadow"
                >
                  <Text className="text-primary-foreground text-sm font-black">Done</Text>
                </Button>

                {/* Dev Testing Reset Button */}
                {process.env.EXPO_PUBLIC_SHOW_TEST_ADS !== 'false' && (
                  <Button
                    onPress={() => {
                      resetAdFreeStatus();
                      Alert.alert('Dev Mode Reset', 'Ad-Free status has been reset for testing.');
                    }}
                    variant="outline"
                    className="border-border h-10 items-center justify-center rounded-xl border-dashed bg-transparent"
                  >
                    <Text className="text-muted-foreground text-[11px] font-semibold">
                      [Dev Test] Reset Purchase Status
                    </Text>
                  </Button>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

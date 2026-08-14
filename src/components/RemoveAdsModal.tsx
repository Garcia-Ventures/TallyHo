import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import { Check, CheckCircle2, Crown, Headphones, ShieldCheck, Sparkles, X, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native';
import { PALETTE } from '../constants/colors';
import { trackEvent } from '../services/analytics';
import { nativeSound } from '../services/audio';
import { presentCustomerCenter, purchasePackageByIdentifier, restoreAdFreePurchases } from '../services/purchases';
import { useSettingsStore } from '../stores/useSettingsStore';

interface RemoveAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PlanTier = 'lifetime' | 'yearly' | 'monthly';

interface PlanOption {
  id: PlanTier;
  title: string;
  price: string;
  subtext: string;
  badge: string;
  badgeColor: string;
  highlighted?: boolean;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'lifetime',
    title: 'Lifetime Access',
    price: '$1.99',
    subtext: 'Pay once, keep forever',
    badge: 'BEST VALUE',
    badgeColor: 'bg-chip-mustard text-black',
    highlighted: true,
  },
  {
    id: 'yearly',
    title: 'Yearly Pro',
    price: '$4.99 / year',
    subtext: '$0.41/mo • Billed annually',
    badge: 'SAVE 58%',
    badgeColor: 'bg-chip-sage/20 text-chip-sage',
  },
  {
    id: 'monthly',
    title: 'Monthly Pro',
    price: '$0.99 / month',
    subtext: 'Flexible • Cancel anytime',
    badge: 'FLEXIBLE',
    badgeColor: 'bg-chip-navy/20 text-chip-navy',
  },
];

export function RemoveAdsModal({ isOpen, onClose }: RemoveAdsModalProps) {
  const { settings, purchaseRemoveAds, restorePurchases, resetAdFreeStatus } = useSettingsStore();
  const [selectedTier, setSelectedTier] = useState<PlanTier>('lifetime');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    trackEvent('purchase_attempt', { product: `tallyho_pro_${selectedTier}` });

    const result = await purchasePackageByIdentifier(selectedTier);
    setIsProcessing(false);

    if (result.success && result.isPro) {
      purchaseRemoveAds();
      nativeSound.playVictoryFanfare();
      trackEvent('purchase_success', { product: `tallyho_pro_${selectedTier}` });
      Alert.alert(
        'Welcome to TallyHo Pro! 🎉',
        'Your Ad-Free & Pro upgrade is now active. Thank you for your support!',
        [{ text: 'Awesome', onPress: onClose }],
      );
    } else if (result.redirected) {
      onClose();
    } else if (!result.userCancelled) {
      Alert.alert('Purchase Error', result.error || 'The purchase process could not be completed.');
    }
  };

  const handlePresentCustomerCenter = async () => {
    await presentCustomerCenter();
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    const result = await restoreAdFreePurchases();
    setIsProcessing(false);

    if (result.success && result.isPro) {
      restorePurchases();
      nativeSound.playPresetSelect();
      trackEvent('purchases_restored');
      Alert.alert('Purchases Restored! 🎉', 'Your TallyHo Pro entitlement has been restored successfully.');
      onClose();
    } else if (!result.userCancelled) {
      Alert.alert(
        'No Prior Purchase Found',
        'We could not find an active TallyHo Pro purchase associated with this account or device.',
      );
    }
  };

  const selectedPlan = PLAN_OPTIONS.find((p) => p.id === selectedTier) || PLAN_OPTIONS[0];

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 items-center justify-end bg-black/65 sm:justify-center sm:p-4">
        <View className="border-border bg-card max-h-[90%] w-full max-w-lg rounded-t-3xl border-t p-6 shadow-2xl sm:rounded-3xl sm:border">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="bg-chip-mustard/20 h-11 w-11 items-center justify-center rounded-2xl">
                <Crown size={24} color={PALETTE.chip.mustard} />
              </View>
              <View>
                <Text className="text-foreground text-xl font-black">TallyHo Pro</Text>
                <Text className="text-muted-foreground text-xs font-semibold">Ad-Free & Unlimited Game Tools</Text>
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
                  <CheckCircle2 size={22} color={PALETTE.status.successText} />
                  <View className="flex-1">
                    <Text className="text-status-success-text text-sm font-black">TallyHo Pro Active</Text>
                    <Text className="text-status-success-text text-xs font-medium">
                      You own the ad-free Pro version across all devices. Thank you for your support!
                    </Text>
                  </View>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Plan Options Selector */}
                <View className="gap-2.5">
                  <Text className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Select Your Plan
                  </Text>

                  {PLAN_OPTIONS.map((plan) => {
                    const isSelected = selectedTier === plan.id;
                    return (
                      <Pressable key={plan.id} onPress={() => setSelectedTier(plan.id)}>
                        <Card
                          className={`rounded-2xl border p-4 transition-all ${
                            isSelected ? 'border-chip-mustard bg-chip-mustard/15 shadow-sm' : 'border-border bg-popover'
                          }`}
                        >
                          <CardContent className="flex-row items-center justify-between p-0">
                            <View className="flex-1 gap-1">
                              <View className="flex-row items-center gap-2">
                                <Text className="text-foreground text-base font-black">{plan.title}</Text>
                                <Badge className={`px-2 py-0.5 ${plan.badgeColor}`}>
                                  <Text className="text-[9px] font-black">{plan.badge}</Text>
                                </Badge>
                              </View>
                              <Text className="text-muted-foreground text-xs font-medium">{plan.subtext}</Text>
                            </View>

                            <View className="items-end gap-1 pl-2">
                              <Text className="text-foreground text-base font-black">{plan.price}</Text>
                              <View
                                className={`h-5 w-5 items-center justify-center rounded-full border ${
                                  isSelected ? 'border-chip-mustard bg-chip-mustard' : 'border-border bg-transparent'
                                }`}
                              >
                                {isSelected && <Check size={12} color="#000" strokeWidth={3} />}
                              </View>
                            </View>
                          </CardContent>
                        </Card>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Feature Highlights */}
                <View className="gap-2.5 pt-1">
                  <View className="border-border bg-popover flex-row items-start gap-3 rounded-xl border p-3.5">
                    <ShieldCheck size={20} color={PALETTE.chip.sage} className="mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-foreground text-xs font-black">100% Ad-Free & Private</Text>
                      <Text className="text-muted-foreground text-xs font-medium">
                        Removes all sponsored banners and cards forever. Zero ad tracking scripts.
                      </Text>
                    </View>
                  </View>

                  <View className="border-border bg-popover flex-row items-start gap-3 rounded-xl border p-3.5">
                    <Zap size={20} color={PALETTE.chip.mustard} className="mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-foreground text-xs font-black">Priority Rulebooks & Presets</Text>
                      <Text className="text-muted-foreground text-xs font-medium">
                        Early access to upcoming scorekeeper rulebooks and custom preset creations.
                      </Text>
                    </View>
                  </View>

                  <View className="border-border bg-popover flex-row items-start gap-3 rounded-xl border p-3.5">
                    <Sparkles size={20} color={PALETTE.chip.purple} className="mt-0.5" />
                    <View className="flex-1">
                      <Text className="text-foreground text-xs font-black">Support Independent Devs</Text>
                      <Text className="text-muted-foreground text-xs font-medium">
                        Directly supports fast, privacy-respecting indie app development.
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Action Buttons */}
            {!settings.isAdFree ? (
              <View className="gap-3 pt-2">
                <Button
                  onPress={handlePurchase}
                  disabled={isProcessing}
                  className="bg-chip-mustard h-13 flex-row items-center justify-center rounded-xl shadow"
                >
                  <Text className="text-base font-black text-black">
                    {isProcessing ? 'Processing...' : `Unlock TallyHo Pro (${selectedPlan.price})`}
                  </Text>
                </Button>

                <Button
                  onPress={handleRestore}
                  disabled={isProcessing}
                  variant="outline"
                  className="border-border h-11 items-center justify-center rounded-xl bg-transparent"
                >
                  <Text className="text-muted-foreground text-xs font-bold">
                    {isProcessing ? 'Restoring...' : 'Restore Previous Purchases'}
                  </Text>
                </Button>
              </View>
            ) : (
              <View className="gap-3 pt-2">
                <Button
                  onPress={handlePresentCustomerCenter}
                  variant="outline"
                  className="border-border h-12 flex-row items-center justify-center gap-2 rounded-xl bg-transparent"
                >
                  <Headphones size={18} color={PALETTE.chip.sage} />
                  <Text className="text-foreground text-xs font-black">Manage Subscription & Billing</Text>
                </Button>

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

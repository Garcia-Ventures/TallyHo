import { Badge, Button, Card, CardContent, Input, Text } from '@gv-tech/ui-native';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Crown,
  Headphones,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { PALETTE } from '../constants/colors';
import { trackEvent } from '../services/analytics';
import { nativeSound } from '../services/audio';
import {
  getOfferings,
  presentCustomerCenter,
  purchasePackageByIdentifier,
  restoreAdFreePurchases,
} from '../services/purchases';
import { useSettingsStore } from '../stores/useSettingsStore';
import { showToast } from '../utils/toast';
import { RestorePurchaseModal } from './RestorePurchaseModal';

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

const DEFAULT_PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'lifetime',
    title: 'Lifetime Access',
    price: '$4.99',
    subtext: 'Pay once, keep forever',
    badge: 'BEST VALUE',
    badgeColor: 'bg-chip-mustard text-black',
    highlighted: true,
  },
  {
    id: 'yearly',
    title: 'Yearly Pro',
    price: '$2.99 / year',
    subtext: '$0.25/mo • Billed annually',
    badge: 'SAVE 75%',
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
  const { settings, purchaseRemoveAds, resetAdFreeStatus } = useSettingsStore();
  const [selectedTier, setSelectedTier] = useState<PlanTier>('lifetime');
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [plans, setPlans] = useState<PlanOption[]>(DEFAULT_PLAN_OPTIONS);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDynamicOfferings() {
      try {
        const offerings = await getOfferings();
        if (!offerings?.current || !isMounted) {
          return;
        }

        const currentOffering = offerings.current;
        const updatedPlans = DEFAULT_PLAN_OPTIONS.map((plan) => {
          let pkg = null;
          if (plan.id === 'lifetime') {
            pkg = currentOffering.lifetime;
          }
          if (plan.id === 'yearly') {
            pkg = currentOffering.annual;
          }
          if (plan.id === 'monthly') {
            pkg = currentOffering.monthly;
          }

          if (pkg && pkg.product.priceString) {
            const formattedPrice =
              plan.id === 'yearly'
                ? `${pkg.product.priceString} / year`
                : plan.id === 'monthly'
                  ? `${pkg.product.priceString} / month`
                  : pkg.product.priceString;

            return {
              ...plan,
              price: formattedPrice,
            };
          }
          return plan;
        });

        if (isMounted) {
          setPlans(updatedPlans);
        }
      } catch (err) {
        console.warn('[RemoveAdsModal] Failed to load dynamic offerings from RevenueCat:', err);
      }
    }

    if (isOpen) {
      setErrorMessage('');
      loadDynamicOfferings();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleSelectTier = (tier: PlanTier) => {
    setSelectedTier(tier);
    setErrorMessage('');
    const plan = plans.find((p) => p.id === tier);
    trackEvent('paywall_tier_selected', {
      tier,
      title: plan?.title,
      price: plan?.price,
    });
  };

  const handlePurchase = async () => {
    const selectedPlan = plans.find((p) => p.id === selectedTier) || plans[0];
    const cleanEmail = email.trim().toLowerCase();

    if (Platform.OS === 'web') {
      if (!cleanEmail) {
        setErrorMessage('Please enter your email to proceed to checkout and enable cross-device restore.');
        return;
      }
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
        return;
      }
    }

    setErrorMessage('');
    setIsProcessing(true);
    trackEvent('checkout_initiated', {
      tier: selectedTier,
      price: selectedPlan.price,
      product: `tallyho_pro_${selectedTier}`,
      email: cleanEmail || undefined,
    });

    const result = await purchasePackageByIdentifier(selectedTier, cleanEmail || undefined);
    setIsProcessing(false);

    if (result.success && result.isPro) {
      purchaseRemoveAds();
      nativeSound.playVictoryFanfare();
      trackEvent('purchase_success', {
        tier: selectedTier,
        price: selectedPlan.price,
        product: `tallyho_pro_${selectedTier}`,
      });
      showToast('Welcome to TallyHo Pro! 🎉', 'Your Ad-Free & Pro upgrade is now active. Thank you for your support!');
      onClose();
    } else if (result.redirected) {
      trackEvent('checkout_redirected', { tier: selectedTier });
      onClose();
    } else if (!result.userCancelled) {
      trackEvent('purchase_error', { tier: selectedTier, error: result.error });
      setErrorMessage(result.error || 'The purchase process could not be completed.');
    } else {
      trackEvent('purchase_cancelled', { tier: selectedTier });
    }
  };

  const handlePresentCustomerCenter = async () => {
    trackEvent('customer_center_opened');
    await presentCustomerCenter();
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    trackEvent('restore_attempt');
    const result = await restoreAdFreePurchases();
    setIsProcessing(false);

    if (result.success && result.isPro) {
      purchaseRemoveAds();
      nativeSound.playVictoryFanfare();
      trackEvent('purchases_restored', { success: true });
      showToast('Purchases Restored! 🎉', 'Your TallyHo Pro entitlement has been restored successfully.');
      onClose();
    } else if (result.needsEmail) {
      setIsRestoreModalOpen(true);
    } else if (!result.userCancelled) {
      trackEvent('purchases_restored', { success: false });
      showToast(
        'No Prior Purchase Found',
        'We could not find an active TallyHo Pro purchase associated with this account or device.',
        'destructive',
      );
    }
  };

  const selectedPlan = plans.find((p) => p.id === selectedTier) || plans[0];

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
              onPress={() => {
                trackEvent('paywall_dismissed', { isPro: settings.isAdFree });
                onClose();
              }}
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

                  {plans.map((plan) => {
                    const isSelected = selectedTier === plan.id;
                    return (
                      <Pressable key={plan.id} onPress={() => handleSelectTier(plan.id)}>
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
                {Platform.OS === 'web' && (
                  <View className="border-border bg-popover/40 gap-1.5 rounded-2xl border p-3">
                    <View className="flex-row items-center gap-1.5">
                      <Mail size={13} color={PALETTE.chip.mustard} />
                      <Text className="text-foreground text-xs font-bold">Billing & Receipt Email *</Text>
                    </View>
                    <Input
                      placeholder="your.email@example.com"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errorMessage) {
                          setErrorMessage('');
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="bg-background border-border text-foreground h-10 text-xs"
                    />
                    <Text className="text-muted-foreground text-[10px] leading-tight font-medium">
                      Required for Stripe receipt and cross-device restore across any browser or device.
                    </Text>
                  </View>
                )}

                {errorMessage ? (
                  <View className="border-status-error-border bg-status-error-bg flex-row items-center gap-2.5 rounded-xl border p-3">
                    <AlertCircle size={16} color={PALETTE.status.errorText} />
                    <Text className="text-status-error-text flex-1 text-xs font-semibold">{errorMessage}</Text>
                  </View>
                ) : null}

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
                {__DEV__ && (
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

      <RestorePurchaseModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onSuccess={onClose}
      />
    </Modal>
  );
}

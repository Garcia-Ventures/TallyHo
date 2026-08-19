import { Button, Input, Text } from '@gv-tech/ui-native';
import { ExternalLink, KeyRound, Mail, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { PALETTE } from '../constants/colors';
import { trackEvent } from '../services/analytics';
import { nativeSound } from '../services/audio';
import { presentCustomerCenter, restoreAdFreePurchases } from '../services/purchases';
import { useSettingsStore } from '../stores/useSettingsStore';
import { showToast } from '../utils/toast';

interface RestorePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RestorePurchaseModal({ isOpen, onClose, onSuccess }: RestorePurchaseModalProps) {
  const { purchaseRemoveAds } = useSettingsStore();
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenStripePortal = async () => {
    trackEvent('stripe_portal_restore_opened');
    onClose();
    showToast(
      'Stripe Verification Portal 🔗',
      'Enter your email in the Stripe tab to receive a 1-time secure login link.',
    );
    await presentCustomerCenter();
  };

  const handleDirectEmailRestore = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      showToast('Email Required', 'Please enter your billing email address.', 'destructive');
      return;
    }

    setIsProcessing(true);
    trackEvent('restore_email_attempt', { email: cleanEmail });

    try {
      const result = await restoreAdFreePurchases(cleanEmail);
      setIsProcessing(false);
      onClose();

      if (result.success && result.isPro) {
        purchaseRemoveAds();
        nativeSound.playVictoryFanfare();
        trackEvent('purchases_restored', { success: true, method: 'email' });
        showToast('Purchases Restored! 🎉', 'TallyHo Pro is now active on this browser.');
        setEmail('');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        trackEvent('purchases_restored', { success: false, method: 'email' });
        showToast(
          'No Active Subscription',
          `We could not find an active TallyHo Pro purchase for ${cleanEmail}. Use the Stripe Portal to verify.`,
          'destructive',
        );
      }
    } catch {
      setIsProcessing(false);
      onClose();
      showToast('Restore Failed', 'Unable to verify subscription at this time.', 'destructive');
    }
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/75 p-4">
        <View className="border-border bg-card w-full max-w-md gap-4 rounded-3xl border p-6 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="bg-chip-mustard/20 h-10 w-10 items-center justify-center rounded-2xl">
                <ShieldCheck size={22} color={PALETTE.chip.mustard} />
              </View>
              <View>
                <Text className="text-foreground text-base font-black">Restore Pro Access</Text>
                <Text className="text-muted-foreground text-xs font-semibold">Secure Subscription Verification</Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="border-border bg-popover h-8 w-8 items-center justify-center rounded-full border"
            >
              <X size={16} color={PALETTE.ink.muted} />
            </Pressable>
          </View>

          {/* Primary Recommended: Stripe Customer Portal */}
          <View className="border-chip-sage/40 bg-chip-sage/10 gap-2.5 rounded-2xl border p-4">
            <View className="flex-row items-center gap-2">
              <KeyRound size={16} color={PALETTE.chip.sage} />
              <Text className="text-foreground text-xs font-black">Secure Stripe Login (Recommended)</Text>
            </View>
            <Text className="text-muted-foreground text-[11px] leading-relaxed">
              Stripe will email you a secure 1-time magic login link to verify ownership of your subscription.
            </Text>
            <Button
              onPress={handleOpenStripePortal}
              className="bg-chip-sage h-10 flex-row items-center justify-center gap-2 rounded-xl"
            >
              <Text className="text-xs font-black text-black">Open Stripe Verification Portal</Text>
              <ExternalLink size={14} color="#000" />
            </Button>
          </View>

          {/* Alternative: Direct Email Lookup */}
          <View className="gap-2 pt-1">
            <View className="flex-row items-center gap-1.5">
              <Mail size={14} color={PALETTE.ink.muted} />
              <Text className="text-muted-foreground text-xs font-bold">Or enter billing email directly:</Text>
            </View>
            <Input
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleDirectEmailRestore}
              className="bg-background border-border text-foreground h-11 text-xs"
            />
            <Button
              onPress={handleDirectEmailRestore}
              disabled={isProcessing}
              variant="outline"
              className="border-border bg-popover h-10 flex-row items-center justify-center rounded-xl"
            >
              {isProcessing ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color={PALETTE.chip.mustard} />
                  <Text className="text-foreground text-xs font-bold">Searching Subscriptions...</Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-1.5">
                  <Sparkles size={14} color={PALETTE.chip.mustard} />
                  <Text className="text-foreground text-xs font-bold">Check Direct Email Subscription</Text>
                </View>
              )}
            </Button>
          </View>

          {/* Cancel */}
          <Button
            onPress={onClose}
            disabled={isProcessing}
            variant="ghost"
            className="h-9 items-center justify-center rounded-xl"
          >
            <Text className="text-muted-foreground text-xs font-bold">Cancel</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}

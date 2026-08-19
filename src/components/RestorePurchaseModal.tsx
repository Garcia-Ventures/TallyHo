import { Button, Input, Text } from '@gv-tech/ui-native';
import { AlertCircle, Mail, Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { PALETTE } from '../constants/colors';
import { trackEvent } from '../services/analytics';
import { nativeSound } from '../services/audio';
import { restoreAdFreePurchases } from '../services/purchases';
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
  const [errorMessage, setErrorMessage] = useState('');

  const handleDirectEmailRestore = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your billing email address.');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);
    trackEvent('restore_email_attempt', { email: cleanEmail });

    try {
      const result = await restoreAdFreePurchases(cleanEmail);
      setIsProcessing(false);

      if (result.success && result.isPro) {
        purchaseRemoveAds();
        nativeSound.playVictoryFanfare();
        trackEvent('purchases_restored', { success: true, method: 'email' });
        showToast('Purchases Restored! 🎉', 'TallyHo Pro is now active on this browser.');
        setEmail('');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        trackEvent('purchases_restored', { success: false, method: 'email' });
        setErrorMessage(`No active TallyHo Pro subscription found for "${cleanEmail}".`);
      }
    } catch {
      setIsProcessing(false);
      setErrorMessage('Unable to verify subscription at this time. Please check your connection.');
    }
  };

  const handleModalClose = () => {
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent onRequestClose={handleModalClose}>
      <View className="flex-1 items-center justify-center bg-black/75 p-4">
        <View className="border-border bg-card w-full max-w-md gap-4 rounded-3xl border p-6 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="bg-chip-mustard/20 h-10 w-10 items-center justify-center rounded-2xl">
                <Mail size={20} color={PALETTE.chip.mustard} />
              </View>
              <View>
                <Text className="text-foreground text-base font-black">Restore Pro Access</Text>
                <Text className="text-muted-foreground text-xs font-semibold">Enter Billing Email</Text>
              </View>
            </View>

            <Pressable
              onPress={handleModalClose}
              hitSlop={8}
              className="border-border bg-popover h-8 w-8 items-center justify-center rounded-full border"
            >
              <X size={16} color={PALETTE.ink.muted} />
            </Pressable>
          </View>

          {/* Description */}
          <Text className="text-muted-foreground text-xs leading-relaxed font-medium">
            Enter the email address you used at checkout. We will connect your purchase and activate your Ad-Free Pro
            entitlement.
          </Text>

          {/* Inline Error Box */}
          {errorMessage ? (
            <View className="border-status-error-border bg-status-error-bg flex-row items-center gap-2.5 rounded-xl border p-3">
              <AlertCircle size={16} color={PALETTE.status.errorText} />
              <Text className="text-status-error-text flex-1 text-xs font-semibold">{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View className="gap-1.5">
            <Text className="text-foreground text-xs font-bold">Billing Email</Text>
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
              returnKeyType="done"
              onSubmitEditing={handleDirectEmailRestore}
              className="bg-background border-border text-foreground h-11 text-xs"
            />
          </View>

          {/* Action Buttons */}
          <View className="gap-2 pt-1">
            <Button
              onPress={handleDirectEmailRestore}
              disabled={isProcessing}
              className="bg-chip-mustard h-11 flex-row items-center justify-center rounded-xl shadow-sm"
            >
              {isProcessing ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#000" />
                  <Text className="text-xs font-black text-black">Verifying Subscription...</Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-1.5">
                  <Sparkles size={16} color="#000" />
                  <Text className="text-xs font-black text-black">Restore TallyHo Pro</Text>
                </View>
              )}
            </Button>

            <Button
              onPress={handleModalClose}
              disabled={isProcessing}
              variant="ghost"
              className="h-10 items-center justify-center rounded-xl"
            >
              <Text className="text-muted-foreground text-xs font-bold">Cancel</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

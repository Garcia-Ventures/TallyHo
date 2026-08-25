import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Switch,
  Text,
} from '@gv-tech/ui-native';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Moon,
  RotateCcw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Vibrate,
  Volume2,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  useColorScheme,
  View,
} from 'react-native';
import logoHorizontalDark from '../../assets/logo-horizontal-dark.png';
import logoHorizontal from '../../assets/logo-horizontal.png';
import { RemoveAdsModal } from '../../src/components/RemoveAdsModal';
import { RestorePurchaseModal } from '../../src/components/RestorePurchaseModal';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { PALETTE } from '../../src/constants/colors';
import { nativeSound } from '../../src/services/audio';
import { restoreAdFreePurchases } from '../../src/services/purchases';
import { storage } from '../../src/services/storage';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { showToast } from '../../src/utils/toast';

export default function SettingsModal() {
  const router = useRouter();
  const { settings, updateSettings, resetSettings, purchaseRemoveAds, resetAdFreeStatus, setAdBlockedState } =
    useSettingsStore();

  const themeMode = settings.themeMode;
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const [category, setCategory] = useState<'General' | 'Bug' | 'Feature'>('General');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRemoveAdsModalOpen, setIsRemoveAdsModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleThemeChange = (mode: 'system' | 'light' | 'dark') => {
    nativeSound.playPresetSelect();
    updateSettings({ themeMode: mode });
  };

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
            storage.clearAll();
            resetSettings();
            nativeSound.playPresetSelect();
            showToast('Data Cleared', 'All local app data and match logs have been erased.');
          },
        },
      ],
    );
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);
    setFeedbackStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('https://formspree.io/f/mqaejddq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          category,
          email: email.trim() || 'Anonymous User',
          message: feedback.trim(),
          timestamp: new Date().toISOString(),
          settings: {
            theme: settings.themeMode,
            sound: settings.soundEnabled,
            haptics: settings.hapticsEnabled,
            isAdFree: settings.isAdFree,
          },
        }),
      });

      if (response.ok) {
        setFeedbackStatus('success');
        setFeedback('');
        setEmail('');
        nativeSound.playPresetSelect();
        showToast('Feedback Sent! 📬', 'Thank you for helping us improve TallyHo.');
      } else {
        setFeedbackStatus('error');
        setErrorMessage('Failed to send feedback. Please try again later.');
      }
    } catch {
      setFeedbackStatus('error');
      setErrorMessage('Network error occurred. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
        {/* Support & Pro Upgrade Card */}
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
                  <Button
                    onPress={() => setIsRemoveAdsModalOpen(true)}
                    className="bg-chip-mustard h-9 shrink-0 rounded-xl px-4 shadow-sm"
                  >
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
                        setIsRestoreModalOpen(true);
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

            {/* Dev Mode Ad-Blocker Simulation Switch */}
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

        {/* SECTION 1: APPEARANCE & THEME */}
        <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2">
              <View className="bg-chip-sage/15 h-8 w-8 items-center justify-center rounded-full">
                <Sun size={18} color={PALETTE.chip.sage} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">Appearance</CardTitle>
            </View>
            <CardDescription className="text-muted-foreground text-xs font-medium">
              Choose your visual presentation theme.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleThemeChange('system')}
                className={`border-border bg-popover flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${
                  settings.themeMode === 'system' ? 'border-chip-sage bg-chip-sage/15' : ''
                }`}
              >
                <Smartphone size={16} color={settings.themeMode === 'system' ? PALETTE.chip.sage : PALETTE.ink.muted} />
                <Text
                  className={`text-xs font-bold ${
                    settings.themeMode === 'system' ? 'text-chip-sage' : 'text-foreground'
                  }`}
                >
                  System
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleThemeChange('light')}
                className={`border-border bg-popover flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${
                  settings.themeMode === 'light' ? 'border-chip-sage bg-chip-sage/15' : ''
                }`}
              >
                <Sun size={16} color={settings.themeMode === 'light' ? PALETTE.chip.sage : PALETTE.ink.muted} />
                <Text
                  className={`text-xs font-bold ${
                    settings.themeMode === 'light' ? 'text-chip-sage' : 'text-foreground'
                  }`}
                >
                  Light
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleThemeChange('dark')}
                className={`border-border bg-popover flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${
                  settings.themeMode === 'dark' ? 'border-chip-sage bg-chip-sage/15' : ''
                }`}
              >
                <Moon size={16} color={settings.themeMode === 'dark' ? PALETTE.chip.sage : PALETTE.ink.muted} />
                <Text
                  className={`text-xs font-bold ${
                    settings.themeMode === 'dark' ? 'text-chip-sage' : 'text-foreground'
                  }`}
                >
                  Dark
                </Text>
              </Pressable>
            </View>
          </CardContent>
        </Card>

        {/* SECTION 2: AUDIO & HAPTIC FEEDBACK */}
        <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2">
              <View className="bg-chip-mustard/15 h-8 w-8 items-center justify-center rounded-full">
                <Volume2 size={18} color={PALETTE.chip.mustard} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">Sensory Feedback</CardTitle>
            </View>
            <CardDescription className="text-muted-foreground text-xs font-medium">
              Configure app sound effects and tactile vibrations.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 p-0">
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2.5 pr-2">
                <Volume2 size={16} color={PALETTE.ink.muted} className="shrink-0" />
                <View className="min-w-0 flex-1">
                  <Text className="text-foreground text-xs font-bold">Sound Effects</Text>
                  <Text className="text-muted-foreground text-[10px] leading-tight font-medium">
                    Play audio feedback during gameplay and taps
                  </Text>
                </View>
              </View>
              <Switch
                className="shrink-0"
                checked={settings.soundEnabled}
                onCheckedChange={(val: boolean) => {
                  updateSettings({ soundEnabled: val });
                  if (val) {
                    nativeSound.playPresetSelect();
                  }
                }}
              />
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2.5 pr-2">
                <Vibrate size={16} color={PALETTE.ink.muted} className="shrink-0" />
                <View className="min-w-0 flex-1">
                  <Text className="text-foreground text-xs font-bold">Haptic Feedback</Text>
                  <Text className="text-muted-foreground text-[10px] leading-tight font-medium">
                    Tactile vibrations for keypad and score taps
                  </Text>
                </View>
              </View>
              <Switch
                className="shrink-0"
                checked={settings.hapticsEnabled}
                onCheckedChange={(val: boolean) => updateSettings({ hapticsEnabled: val })}
              />
            </View>
          </CardContent>
        </Card>

        {/* SECTION 3: FEEDBACK & SUPPORT */}
        <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2">
              <View className="bg-chip-sage/15 h-8 w-8 items-center justify-center rounded-full">
                <Send size={18} color={PALETTE.chip.sage} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">Submit Feedback & Support</CardTitle>
            </View>
            <CardDescription className="text-muted-foreground text-xs font-medium">
              Send suggestions or bug reports directly to the developer via Formspree.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 p-0">
            <View className="gap-1.5">
              <Text className="text-foreground text-xs font-bold">Feedback Category</Text>
              <View className="flex-row gap-2">
                {(['General', 'Bug', 'Feature'] as const).map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`border-border bg-popover min-h-[42px] flex-1 items-center justify-center rounded-xl border py-2.5 ${
                      category === cat ? 'border-chip-sage bg-chip-sage/15' : ''
                    }`}
                  >
                    <Text className={`text-xs font-bold ${category === cat ? 'text-chip-sage' : 'text-foreground'}`}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-1.5">
              <Text className="text-foreground text-xs font-bold">Your Email (Optional)</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={PALETTE.ink.light}
                keyboardType="email-address"
                autoCapitalize="none"
                className="border-border bg-popover text-foreground h-11 px-3.5"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-foreground text-xs font-bold">Feedback Message</Text>
              <Input
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Describe your issue or suggestion..."
                placeholderTextColor={PALETTE.ink.light}
                multiline
                numberOfLines={4}
                className="border-border bg-popover text-foreground min-h-[100px] p-3.5"
              />
            </View>

            {feedbackStatus === 'success' && (
              <View className="bg-status-success-bg flex-row items-center gap-2 rounded-xl p-3.5">
                <CheckCircle2 size={16} color={PALETTE.status.successText} />
                <Text className="text-status-success-text flex-1 text-xs font-bold">Thank you! Feedback received.</Text>
              </View>
            )}

            {feedbackStatus === 'error' && (
              <View className="bg-status-error-bg flex-row items-center gap-2 rounded-xl p-3.5">
                <AlertCircle size={16} color={PALETTE.status.errorText} />
                <Text className="text-status-error-text flex-1 text-xs font-bold">{errorMessage}</Text>
              </View>
            )}

            <Button
              onPress={handleFeedbackSubmit}
              disabled={isSubmitting || !feedback.trim()}
              className={`h-12 min-h-[48px] flex-row items-center justify-center gap-2 rounded-xl ${
                isSubmitting || !feedback.trim() ? 'bg-chip-sage/50' : 'bg-chip-sage'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color={PALETTE.white} size="small" />
              ) : (
                <Text className="text-sm font-bold text-white">Send Feedback</Text>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* SECTION 4: PRIVACY & LEGAL DISCLOSURES */}
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

        <View className="items-center justify-center gap-2 pt-2 pb-6">
          <Image
            source={(isDark ? logoHorizontalDark : logoHorizontal) as ImageSourcePropType}
            style={{ width: 140, height: 40 }}
            resizeMode="contain"
            accessibilityLabel="TallyHo Logo"
          />
          <Text className="text-muted-foreground text-center text-xs font-semibold">
            TallyHo v1.0.0 (Build 42) • Crafted by Garcia Ventures
          </Text>
        </View>
      </ScrollView>

      <RemoveAdsModal isOpen={isRemoveAdsModalOpen} onClose={() => setIsRemoveAdsModalOpen(false)} />
      <RestorePurchaseModal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)} />
    </ScreenContainer>
  );
}

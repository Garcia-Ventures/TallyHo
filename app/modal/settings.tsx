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
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Moon,
  Send,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  Vibrate,
  Volume2,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { nativeSound } from '../../src/services/audio';
import { useSettingsStore } from '../../src/stores/useSettingsStore';

// Formspree Endpoint from User
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xgawwval';

export default function SettingsModal() {
  const router = RouterHook();
  const { settings, updateSettings } = useSettingsStore();

  // Feedback State
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'General' | 'Bug' | 'Feature'>('General');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Privacy Policy Modal State
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  function triggerHaptic() {
    if (settings.hapticsEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  const handleThemeChange = (mode: 'system' | 'light' | 'dark') => {
    triggerHaptic();
    updateSettings({ themeMode: mode });
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert('Missing Message', 'Please enter a feedback message before submitting.');
      return;
    }

    triggerHaptic();
    setIsSubmitting(true);
    setFeedbackStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim() || 'Anonymous User',
          category,
          message: feedback.trim(),
          themeMode: settings.themeMode,
          platform: Platform.OS,
          appVersion: '1.0.0',
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setFeedbackStatus('success');
        setFeedback('');
        setEmail('');
      } else {
        const data = await response.json().catch(() => ({}));
        setFeedbackStatus('error');
        setErrorMessage(data.error || 'Failed to submit feedback. Please try again later.');
      }
    } catch (err: unknown) {
      setFeedbackStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetData = () => {
    triggerHaptic();
    Alert.alert('Reset Local Data', 'This will reset your theme, sound, and host preferences to defaults. Proceed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          updateSettings({
            themeMode: 'system',
            soundEnabled: true,
            hapticsEnabled: true,
            paperGridTexture: true,
            customServerUrl: 'https://api.tallyho.app/v1',
          });
          Alert.alert('Reset Complete', 'Local settings have been restored to defaults.');
        },
      },
    ]);
  };

  // Safe Router Hook fallback
  function RouterHook() {
    try {
      return useRouter();
    } catch {
      return { back: () => {} };
    }
  }

  return (
    <ScreenContainer
      header={
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-foreground text-xl font-black">Settings</Text>
            <Text className="text-muted-foreground text-xs">GV Tech UI Native • Preferences & Compliance</Text>
          </View>
          <Button onPress={() => router.back()} variant="ghost" size="icon" className="rounded-full">
            <X size={20} color="#5A605C" />
          </Button>
        </View>
      }
    >
      {/* SECTION 1: APPEARANCE & THEME */}
      <Card className="border-border bg-card mb-6">
        <CardHeader className="pb-2">
          <View className="flex-row items-center gap-2">
            <Sun size={18} color="#D96B43" />
            <CardTitle className="text-foreground text-base font-bold">Appearance & Theme</CardTitle>
          </View>
          <CardDescription className="text-muted-foreground text-xs">
            Customize color theme preferences or auto-sync with system settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme Selector Pills */}
          <View className="bg-muted flex-row rounded-xl p-1">
            {(
              [
                { mode: 'system', label: 'System', icon: Smartphone },
                { mode: 'light', label: 'Light', icon: Sun },
                { mode: 'dark', label: 'Dark', icon: Moon },
              ] as const
            ).map((item) => {
              const IconComp = item.icon;
              const isActive = settings.themeMode === item.mode;
              return (
                <Pressable
                  key={item.mode}
                  onPress={() => handleThemeChange(item.mode)}
                  className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 ${
                    isActive ? 'bg-popover shadow-xs' : ''
                  }`}
                >
                  <IconComp size={16} color={isActive ? '#D96B43' : '#5A605C'} />
                  <Text className={`text-xs font-bold ${isActive ? 'text-[#D96B43]' : 'text-muted-foreground'}`}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Toggles using GV Tech UI Native Switch */}
          <View className="border-border space-y-3 border-t pt-3">
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center gap-2">
                <Volume2 size={16} color="#5A605C" />
                <View>
                  <Text className="text-foreground text-sm font-semibold">Sound Effects</Text>
                  <Text className="text-muted-foreground text-xs">Audio feedback on score actions</Text>
                </View>
              </View>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(val) => {
                  triggerHaptic();
                  updateSettings({ soundEnabled: val });
                  if (val) {
                    setTimeout(() => {
                      nativeSound.playKeypadTap();
                    }, 50);
                  }
                }}
              />
            </View>

            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center gap-2">
                <Vibrate size={16} color="#5A605C" />
                <View>
                  <Text className="text-foreground text-sm font-semibold">Haptic Feedback</Text>
                  <Text className="text-muted-foreground text-xs">Tactile vibration cues on buttons</Text>
                </View>
              </View>
              <Switch
                checked={settings.hapticsEnabled}
                onCheckedChange={(val) => {
                  updateSettings({ hapticsEnabled: val });
                  if (val) {
                    triggerHaptic();
                  }
                }}
              />
            </View>
          </View>
        </CardContent>
      </Card>

      {/* SECTION 2: SUBMIT FEEDBACK (FORMSPREE INTEGRATION) */}
      <Card className="border-border bg-card mb-6">
        <CardHeader className="pb-2">
          <View className="flex-row items-center gap-2">
            <Send size={18} color="#6A9C78" />
            <CardTitle className="text-foreground text-base font-bold">Submit Feedback</CardTitle>
          </View>
          <CardDescription className="text-muted-foreground text-xs">
            Send bug reports or feature requests directly via Formspree.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Category Pills */}
          <View className="flex-row gap-2">
            {(['General', 'Bug', 'Feature'] as const).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className={`flex-1 items-center rounded-lg border py-2 ${
                  category === cat ? 'border-[#6A9C78] bg-[#6A9C78]/15' : 'border-border bg-popover'
                }`}
              >
                <Text className={`text-xs font-bold ${category === cat ? 'text-[#6A9C78]' : 'text-muted-foreground'}`}>
                  {cat === 'Bug' ? '🐛 Bug' : cat === 'Feature' ? '💡 Feature' : '💬 General'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Email Input */}
          <View className="gap-1">
            <Text className="text-foreground text-xs font-semibold">
              Contact Email <Text className="text-muted-foreground">(Optional)</Text>
            </Text>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#8A8F8C"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border-border bg-popover text-foreground h-10"
            />
          </View>

          {/* Feedback Message Input */}
          <View className="gap-1">
            <Text className="text-foreground text-xs font-semibold">Feedback Message</Text>
            <Input
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Describe your issue or suggestion..."
              placeholderTextColor="#8A8F8C"
              multiline
              numberOfLines={4}
              className="border-border bg-popover text-foreground h-24 p-3"
            />
          </View>

          {/* Status Feedback Banners */}
          {feedbackStatus === 'success' && (
            <View className="flex-row items-center gap-2 rounded-xl bg-[#E6F4EA] p-3">
              <CheckCircle2 size={16} color="#137333" />
              <Text className="flex-1 text-xs font-bold text-[#137333]">
                Thank you! Feedback transmitted successfully via Formspree.
              </Text>
            </View>
          )}

          {feedbackStatus === 'error' && (
            <View className="flex-row items-center gap-2 rounded-xl bg-[#FCE8E6] p-3">
              <AlertCircle size={16} color="#C5221F" />
              <Text className="flex-1 text-xs font-bold text-[#C5221F]">{errorMessage}</Text>
            </View>
          )}

          {/* Submit Button */}
          <Button
            onPress={handleFeedbackSubmit}
            disabled={isSubmitting || !feedback.trim()}
            className={`flex-row items-center justify-center gap-2 rounded-xl py-3 ${
              isSubmitting || !feedback.trim() ? 'bg-[#6A9C78]/50' : 'bg-[#6A9C78]'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Send size={16} color="#FFFFFF" />
                <Text className="text-sm font-bold text-white">Submit Feedback</Text>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* SECTION 4: PRIVACY & LEGAL DISCLOSURES */}
      <Card className="border-border bg-card mb-8">
        <CardHeader className="pb-2">
          <View className="flex-row items-center gap-2">
            <ShieldCheck size={18} color="#8B6B9C" />
            <CardTitle className="text-foreground text-base font-bold">Privacy & Legal Disclosures</CardTitle>
          </View>
          <CardDescription className="text-muted-foreground text-xs">
            Review store privacy statements and manage local device data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Pressable
            onPress={() => setShowPrivacyModal(true)}
            className="border-border bg-popover flex-row items-center justify-between rounded-xl border p-3"
          >
            <View className="flex-row items-center gap-2">
              <HelpCircle size={16} color="#8B6B9C" />
              <Text className="text-foreground text-xs font-bold">View Store Privacy Statement</Text>
            </View>
            <ExternalLink size={14} color="#5A605C" />
          </Pressable>

          <Button
            onPress={handleResetData}
            variant="destructive"
            className="flex-row items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/40"
          >
            <View className="flex-row items-center gap-2">
              <Trash2 size={16} color="#C5221F" />
              <Text className="text-xs font-bold text-red-600 dark:text-red-400">Reset Local Storage & Settings</Text>
            </View>
          </Button>
        </CardContent>
      </Card>

      <Text className="text-muted-foreground mb-8 text-center text-xs font-medium">
        Formspree Active • TallyHo v1.0.0 (Build 42) • GV Tech UI Native
      </Text>

      {/* PRIVACY STATEMENT MODAL */}

      <Modal visible={showPrivacyModal} animationType="slide" transparent={false}>
        <View className="bg-background flex-1 pt-12">
          <View className="border-border bg-card flex-row items-center justify-between border-b px-6 py-4">
            <Text className="text-foreground text-lg font-black">Privacy & Data Policy</Text>
            <Button onPress={() => setShowPrivacyModal(false)} variant="ghost" size="icon" className="rounded-full">
              <X size={20} color="#5A605C" />
            </Button>
          </View>
          <ScrollView className="flex-1 p-6">
            <Text className="text-foreground mb-2 text-base font-bold">1. Data Collection & Transparency</Text>
            <Text className="text-muted-foreground mb-4 text-xs leading-5">
              User settings (theme mode, sound effects) are stored locally on your device using encrypted storage
              primitives. No personal data is collected without explicit user submission.
            </Text>

            <Text className="text-foreground mb-2 text-base font-bold">2. Formspree Feedback Processing</Text>
            <Text className="text-muted-foreground mb-4 text-xs leading-5">
              Submissions sent via the feedback form are securely transmitted over HTTPS to Formspree
              (https://formspree.io/f/xgawwval) for developer response handling.
            </Text>

            <Text className="text-foreground mb-2 text-base font-bold">3. ATT & Analytics Compliance</Text>
            <Text className="text-muted-foreground mb-4 text-xs leading-5">
              We do NOT perform cross-app tracking or sell user data to third-party brokers (App Tracking Transparency
              compliant).
            </Text>

            <Text className="text-foreground mb-2 text-base font-bold">4. Data Reset & Deletion Rights</Text>
            <Text className="text-muted-foreground mb-6 text-xs leading-5">
              Use the "Reset Local Storage & Settings" button to purge device caches instantly. For feedback deletion
              requests, email privacy@tallyho.app.
            </Text>

            <Button
              onPress={() => setShowPrivacyModal(false)}
              className="bg-primary mb-10 items-center rounded-xl py-3"
            >
              <Text className="text-primary-foreground text-xs font-bold">Close Statement</Text>
            </Button>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

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
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { nativeSound } from '../../src/services/audio';
import { storage } from '../../src/services/storage';
import { useSettingsStore } from '../../src/stores/useSettingsStore';

export default function SettingsModal() {
  const router = useSafeRouter();
  const { settings, updateSettings, resetSettings } = useSettingsStore();

  const [category, setCategory] = useState<'General' | 'Bug' | 'Feature'>('General');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  function useSafeRouter() {
    try {
      return useRouter();
    } catch {
      return { back: () => {} };
    }
  }

  const handleThemeChange = (mode: 'system' | 'light' | 'dark') => {
    nativeSound.playPresetSelect();
    updateSettings({ themeMode: mode });
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      return;
    }
    nativeSound.playRoundSubmit();
    setIsSubmitting(true);
    setFeedbackStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('https://formspree.io/f/xbjnedpn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          category,
          email: email.trim() || 'Anonymous',
          message: feedback.trim(),
          timestamp: new Date().toISOString(),
          app: 'TallyHo Mobile / Web',
          version: '1.0.0',
        }),
      });

      if (response.ok) {
        setFeedbackStatus('success');
        setFeedback('');
        setEmail('');
      } else {
        const data = await response.json().catch(() => ({}));
        setFeedbackStatus('error');
        setErrorMessage(data.error || 'Failed to submit feedback. Please try again.');
      }
    } catch {
      setFeedbackStatus('error');
      setErrorMessage('Network error. Check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetData = () => {
    nativeSound.playUndo();
    const executeReset = () => {
      storage.clearAll();
      resetSettings();
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    };

    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Reset all local storage and settings? This will delete all saved games.')) {
        executeReset();
      }
    } else {
      Alert.alert('Reset Storage', 'Reset all local storage and settings? This will delete all saved games.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: executeReset },
      ]);
    }
  };

  return (
    <ScreenContainer
      header={
        <View className="flex-row items-center justify-between">
          <View className="gap-0.5">
            <Text className="text-foreground text-xl font-black">Settings</Text>
            <Text className="text-muted-foreground text-xs font-semibold">
              GV Tech UI Native • Preferences & Compliance
            </Text>
          </View>
          <Button onPress={() => router.back()} variant="ghost" size="icon" className="rounded-full">
            <X size={20} color="#5A605C" />
          </Button>
        </View>
      }
    >
      <View className="gap-6 pb-8">
        {/* SECTION 1: APPEARANCE & THEME */}
        <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#D96B43]/15">
                <Sun size={18} color="#D96B43" />
              </View>
              <CardTitle className="text-foreground text-lg font-black">Appearance & Theme</CardTitle>
            </View>
            <CardDescription className="text-muted-foreground text-xs font-medium">
              Customize color theme preferences or auto-sync with system settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 p-0">
            {/* Theme Selector Pills */}
            <View className="bg-muted flex-row rounded-2xl p-1.5">
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
                    className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 ${
                      isActive ? 'bg-popover shadow-sm' : ''
                    }`}
                  >
                    <IconComp size={16} color={isActive ? '#D96B43' : '#5A605C'} />
                    <Text className={`text-xs font-extrabold ${isActive ? 'text-[#D96B43]' : 'text-muted-foreground'}`}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </CardContent>
        </Card>

        {/* SECTION 2: AUDIO & TACTILE FEEDBACK */}
        <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#3B5998]/15">
                <Volume2 size={18} color="#3B5998" />
              </View>
              <CardTitle className="text-foreground text-lg font-black">Audio & Tactile Feedback</CardTitle>
            </View>
            <CardDescription className="text-muted-foreground text-xs font-medium">
              Control sound effects synthesizer and vibration cues across key actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 p-0">
            <View className="gap-3">
              {/* Sound Effects Toggle */}
              <View className="border-border/60 flex-row items-center justify-between border-b pb-3.5">
                <View className="flex-row items-center gap-3">
                  <View className="bg-popover h-9 w-9 items-center justify-center rounded-xl">
                    <Volume2 size={18} color="#3B5998" />
                  </View>
                  <View className="gap-0.5">
                    <Text className="text-foreground text-sm font-bold">Sound Effects</Text>
                    <Text className="text-muted-foreground text-xs">Audio feedback on score entries & actions</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(val) => {
                    nativeSound.playToggle(val);
                    updateSettings({ soundEnabled: val });
                  }}
                />
              </View>

              {/* Haptic Feedback Toggle */}
              <View className="flex-row items-center justify-between pt-1">
                <View className="flex-row items-center gap-3">
                  <View className="bg-popover h-9 w-9 items-center justify-center rounded-xl">
                    <Vibrate size={18} color="#E5A93C" />
                  </View>
                  <View className="gap-0.5">
                    <Text className="text-foreground text-sm font-bold">Haptic Feedback</Text>
                    <Text className="text-muted-foreground text-xs">Tactile vibration cues on buttons & logs</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.hapticsEnabled}
                  onCheckedChange={(val) => {
                    nativeSound.playToggle(val);
                    updateSettings({ hapticsEnabled: val });
                  }}
                />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* SECTION 3: SUBMIT FEEDBACK (FORMSPREE INTEGRATION) */}
        <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#6A9C78]/15">
                <Send size={18} color="#6A9C78" />
              </View>
              <CardTitle className="text-foreground text-lg font-black">Submit Feedback</CardTitle>
            </View>
            <CardDescription className="text-muted-foreground text-xs font-medium">
              Send bug reports or feature requests directly via Formspree.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 p-0">
            {/* Category Pills */}
            <View className="flex-row gap-2">
              {(['General', 'Bug', 'Feature'] as const).map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    nativeSound.playPresetSelect();
                    setCategory(cat);
                  }}
                  className={`flex-1 items-center justify-center rounded-xl border py-2.5 ${
                    category === cat ? 'border-[#6A9C78] bg-[#6A9C78]/15' : 'border-border bg-popover'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${category === cat ? 'text-[#6A9C78]' : 'text-muted-foreground'}`}
                  >
                    {cat === 'Bug' ? '🐛 Bug' : cat === 'Feature' ? '💡 Feature' : '💬 General'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Email Input */}
            <View className="gap-1.5">
              <Text className="text-foreground text-xs font-bold">
                Contact Email <Text className="text-muted-foreground font-normal">(Optional)</Text>
              </Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#8A8F8C"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border-border bg-popover text-foreground h-11 px-3.5"
              />
            </View>

            {/* Feedback Message Input */}
            <View className="gap-1.5">
              <Text className="text-foreground text-xs font-bold">Feedback Message</Text>
              <Input
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Describe your issue or suggestion..."
                placeholderTextColor="#8A8F8C"
                multiline
                numberOfLines={4}
                className="border-border bg-popover text-foreground min-h-[100px] p-3.5"
              />
            </View>

            {/* Status Feedback Banners */}
            {feedbackStatus === 'success' && (
              <View className="flex-row items-center gap-2 rounded-xl bg-[#E6F4EA] p-3.5">
                <CheckCircle2 size={16} color="#137333" />
                <Text className="flex-1 text-xs font-bold text-[#137333]">
                  Thank you! Feedback transmitted successfully via Formspree.
                </Text>
              </View>
            )}

            {feedbackStatus === 'error' && (
              <View className="flex-row items-center gap-2 rounded-xl bg-[#FCE8E6] p-3.5">
                <AlertCircle size={16} color="#C5221F" />
                <Text className="flex-1 text-xs font-bold text-[#C5221F]">{errorMessage}</Text>
              </View>
            )}

            {/* Submit Button */}
            <Button
              onPress={handleFeedbackSubmit}
              disabled={isSubmitting || !feedback.trim()}
              className={`h-12 flex-row items-center justify-center gap-2 rounded-2xl py-0 shadow ${
                isSubmitting || !feedback.trim() ? 'bg-[#6A9C78]/50' : 'bg-[#6A9C78]'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Send size={16} color="#FFFFFF" />
                  <Text className="text-sm leading-none font-bold text-white">Submit Feedback</Text>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* SECTION 4: PRIVACY & LEGAL DISCLOSURES */}
        <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#8B6B9C]/15">
                <ShieldCheck size={18} color="#8B6B9C" />
              </View>
              <CardTitle className="text-foreground text-lg font-black">Privacy & Legal Disclosures</CardTitle>
            </View>
            <CardDescription className="text-muted-foreground text-xs font-medium">
              Review store privacy statements and manage local device data.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <Pressable
              onPress={() => {
                nativeSound.playNavigationTap();
                setShowPrivacyModal(true);
              }}
              className="border-border bg-popover flex-row items-center justify-between rounded-xl border p-3.5"
            >
              <View className="flex-row items-center gap-2.5">
                <HelpCircle size={16} color="#8B6B9C" />
                <Text className="text-foreground text-xs font-bold">View Store Privacy Statement</Text>
              </View>
              <ExternalLink size={14} color="#5A605C" />
            </Pressable>

            <Button
              onPress={handleResetData}
              variant="destructive"
              className="flex-row items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900/40 dark:bg-red-950/40"
            >
              <View className="flex-row items-center gap-2.5">
                <Trash2 size={16} color="#C5221F" />
                <Text className="text-xs font-bold text-red-600 dark:text-red-400">Reset Local Storage & Settings</Text>
              </View>
            </Button>
          </CardContent>
        </Card>

        <Text className="text-muted-foreground mb-4 text-center text-xs font-semibold">
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
                User settings (theme mode, sound effects, haptic preferences) are stored locally on your device using
                encrypted storage mechanisms. TallyHo does not transmit personal data to third parties without your
                express consent.
              </Text>
              <Text className="text-foreground mb-2 text-base font-bold">2. Feedback Submissions</Text>
              <Text className="text-muted-foreground mb-4 text-xs leading-5">
                When submitting feedback via the Formspree integration, optional email addresses and user messages are
                processed strictly for quality assurance and support purposes.
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
      </View>
    </ScreenContainer>
  );
}

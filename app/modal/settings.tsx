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
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
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

  function useSafeRouter() {
    try {
      return useRouter();
    } catch {
      return { back: () => {}, push: (_path: string) => {} };
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

    setIsSubmitting(true);
    setFeedbackStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('https://formspree.io/f/xgawwval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          category,
          email: email.trim() || undefined,
          message: feedback.trim(),
          platform: 'Expo React Native',
          appVersion: '1.0.0 (Build 42)',
        }),
      });

      if (response.ok) {
        setFeedbackStatus('success');
        setFeedback('');
        setEmail('');
        nativeSound.playVictoryFanfare();
      } else {
        const data = await response.json();
        setFeedbackStatus('error');
        setErrorMessage(data.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (err) {
      setFeedbackStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Network error submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Storage?',
      'This will erase all local settings, player records, and saved game progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Data',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            storage.clearAll();
            nativeSound.playNavigationTap();
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer
      maxWidth="2xl"
      padding="normal"
      header={
        <View className="flex-row items-center justify-between py-1">
          <Pressable
            onPress={() => router.back()}
            className="border-border bg-popover flex-row items-center gap-2 rounded-xl border px-3 py-2 shadow-xs"
          >
            <X size={16} color="#5A605C" />
            <Text className="text-foreground text-xs font-bold">Close</Text>
          </Pressable>
          <Text className="text-foreground text-base font-black">App Settings</Text>
          <View className="w-16" />
        </View>
      }
    >
      <View className="gap-6 py-2">
        {/* SECTION 1: APPEARANCE & THEME */}
        <Card className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#6A9C78]/15">
                <Sun size={18} color="#6A9C78" />
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
                  settings.themeMode === 'system' ? 'border-[#6A9C78] bg-[#6A9C78]/15' : ''
                }`}
              >
                <Smartphone size={16} color={settings.themeMode === 'system' ? '#6A9C78' : '#5A605C'} />
                <Text
                  className={`text-xs font-bold ${
                    settings.themeMode === 'system' ? 'text-[#6A9C78]' : 'text-foreground'
                  }`}
                >
                  System
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleThemeChange('light')}
                className={`border-border bg-popover flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${
                  settings.themeMode === 'light' ? 'border-[#6A9C78] bg-[#6A9C78]/15' : ''
                }`}
              >
                <Sun size={16} color={settings.themeMode === 'light' ? '#6A9C78' : '#5A605C'} />
                <Text
                  className={`text-xs font-bold ${
                    settings.themeMode === 'light' ? 'text-[#6A9C78]' : 'text-foreground'
                  }`}
                >
                  Light
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleThemeChange('dark')}
                className={`border-border bg-popover flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${
                  settings.themeMode === 'dark' ? 'border-[#6A9C78] bg-[#6A9C78]/15' : ''
                }`}
              >
                <Moon size={16} color={settings.themeMode === 'dark' ? '#6A9C78' : '#5A605C'} />
                <Text
                  className={`text-xs font-bold ${
                    settings.themeMode === 'dark' ? 'text-[#6A9C78]' : 'text-foreground'
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
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E5A93C]/15">
                <Volume2 size={18} color="#E5A93C" />
              </View>
              <CardTitle className="text-foreground text-lg font-black">Sensory Feedback</CardTitle>
            </View>
            <CardDescription className="text-muted-foreground text-xs font-medium">
              Configure app sound effects and tactile vibrations.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 p-0">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <Volume2 size={16} color="#5A605C" />
                <View>
                  <Text className="text-foreground text-xs font-bold">Sound Effects</Text>
                  <Text className="text-muted-foreground text-[10px] font-medium">
                    Play audio feedback during gameplay and taps
                  </Text>
                </View>
              </View>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(val: boolean) => {
                  updateSettings({ soundEnabled: val });
                  if (val) {
                    nativeSound.playPresetSelect();
                  }
                }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <Vibrate size={16} color="#5A605C" />
                <View>
                  <Text className="text-foreground text-xs font-bold">Haptic Feedback</Text>
                  <Text className="text-muted-foreground text-[10px] font-medium">
                    Tactile vibrations for keypad and score taps
                  </Text>
                </View>
              </View>
              <Switch
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
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#6A9C78]/15">
                <Send size={18} color="#6A9C78" />
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
                    className={`border-border bg-popover flex-1 items-center justify-center rounded-xl border py-2.5 ${
                      category === cat ? 'border-[#6A9C78] bg-[#6A9C78]/15' : ''
                    }`}
                  >
                    <Text className={`text-xs font-bold ${category === cat ? 'text-[#6A9C78]' : 'text-foreground'}`}>
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
                placeholderTextColor="#8A8F8C"
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
                placeholderTextColor="#8A8F8C"
                multiline
                numberOfLines={4}
                className="border-border bg-popover text-foreground min-h-[100px] p-3.5"
              />
            </View>

            {feedbackStatus === 'success' && (
              <View className="flex-row items-center gap-2 rounded-xl bg-[#E6F4EA] p-3.5">
                <CheckCircle2 size={16} color="#137333" />
                <Text className="flex-1 text-xs font-bold text-[#137333]">Thank you! Feedback received.</Text>
              </View>
            )}

            {feedbackStatus === 'error' && (
              <View className="flex-row items-center gap-2 rounded-xl bg-[#FCE8E6] p-3.5">
                <AlertCircle size={16} color="#C5221F" />
                <Text className="flex-1 text-xs font-bold text-[#C5221F]">{errorMessage}</Text>
              </View>
            )}

            <Button
              onPress={handleFeedbackSubmit}
              disabled={isSubmitting || !feedback.trim()}
              className={`h-12 flex-row items-center justify-center gap-2 rounded-xl ${
                isSubmitting || !feedback.trim() ? 'bg-[#6A9C78]/50' : 'bg-[#6A9C78]'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
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
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#8B6B9C]/15">
                <ShieldCheck size={18} color="#8B6B9C" />
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
                <HelpCircle size={16} color="#8B6B9C" />
                <Text className="text-foreground text-xs font-bold">View Store Privacy Policy Page</Text>
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
      </View>
    </ScreenContainer>
  );
}

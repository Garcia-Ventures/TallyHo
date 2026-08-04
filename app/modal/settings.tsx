import { Card, CardContent, CardDescription, CardHeader, CardTitle, Switch, Text } from '@gv-tech/ui-native';
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
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
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
    <View className="flex-1 bg-[#FDFBF7] dark:bg-[#181A1B]">
      {/* Top Bar Header */}
      <View className="flex-row items-center justify-between border-b border-[#E5E0D8] bg-[#F7F4EE] px-6 py-4 dark:border-gray-800 dark:bg-[#202324]">
        <View>
          <Text className="text-xl font-black text-[#2C302E] dark:text-white">Settings</Text>
          <Text className="text-xs text-[#6E7571] dark:text-gray-400">
            GV Tech UI Native • Preferences & Compliance
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-[#E8E3DA] p-2 dark:bg-gray-700"
          accessibilityLabel="Close Settings"
        >
          <X size={20} color={Platform.OS === 'ios' ? '#2C302E' : '#2C302E'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* SECTION 1: APPEARANCE & THEME */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <View className="flex-row items-center gap-2">
              <Sun size={18} color="#D96B43" />
              <CardTitle className="text-base font-bold text-[#2C302E] dark:text-white">Appearance & Theme</CardTitle>
            </View>
            <CardDescription className="text-xs text-[#6E7571] dark:text-gray-400">
              Customize color theme preferences or auto-sync with system settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme Selector Pills */}
            <View className="flex-row rounded-xl bg-[#F4F1EA] p-1 dark:bg-gray-800">
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
                  <TouchableOpacity
                    key={item.mode}
                    onPress={() => handleThemeChange(item.mode)}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 ${
                      isActive ? 'bg-white shadow-xs dark:bg-gray-700' : ''
                    }`}
                  >
                    <IconComp size={16} color={isActive ? '#D96B43' : '#6E7571'} />
                    <Text
                      className={`text-xs font-bold ${
                        isActive ? 'text-[#D96B43]' : 'text-[#6E7571] dark:text-gray-400'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Toggles using GV Tech UI Native Switch */}
            <View className="space-y-3 border-t border-[#F0EBE1] pt-3 dark:border-gray-800">
              <View className="flex-row items-center justify-between py-1">
                <View className="flex-row items-center gap-2">
                  <Volume2 size={16} color="#6E7571" />
                  <View>
                    <Text className="text-sm font-semibold text-[#2C302E] dark:text-white">Sound Effects</Text>
                    <Text className="text-xs text-[#6E7571] dark:text-gray-400">Audio feedback on score actions</Text>
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
                  <Vibrate size={16} color="#6E7571" />
                  <View>
                    <Text className="text-sm font-semibold text-[#2C302E] dark:text-white">Haptic Feedback</Text>
                    <Text className="text-xs text-[#6E7571] dark:text-gray-400">Tactile vibration cues on buttons</Text>
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
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <View className="flex-row items-center gap-2">
              <Send size={18} color="#6A9C78" />
              <CardTitle className="text-base font-bold text-[#2C302E] dark:text-white">Submit Feedback</CardTitle>
            </View>
            <CardDescription className="text-xs text-[#6E7571] dark:text-gray-400">
              Send bug reports or feature requests directly via Formspree.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Category Pills */}
            <View className="flex-row gap-2">
              {(['General', 'Bug', 'Feature'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`flex-1 items-center rounded-lg border py-2 ${
                    category === cat
                      ? 'border-[#6A9C78] bg-[#EAF2ED] dark:bg-green-950'
                      : 'border-[#E5E0D8] bg-[#FDFBF7] dark:border-gray-800 dark:bg-gray-900'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      category === cat ? 'text-[#6A9C78]' : 'text-[#6E7571] dark:text-gray-400'
                    }`}
                  >
                    {cat === 'Bug' ? '🐛 Bug' : cat === 'Feature' ? '💡 Feature' : '💬 General'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Email Input */}
            <View>
              <Text className="mb-1 text-xs font-semibold text-[#2C302E] dark:text-white">
                Contact Email <Text className="text-[#A0A5A2]">(Optional)</Text>
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#A0A5A2"
                keyboardType="email-address"
                autoCapitalize="none"
                className="rounded-xl border border-[#E5E0D8] bg-[#FDFBF7] px-3 py-2 text-xs font-medium text-[#2C302E] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </View>

            {/* Feedback Message Input */}
            <View>
              <Text className="mb-1 text-xs font-semibold text-[#2C302E] dark:text-white">Feedback Message</Text>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Describe your issue or suggestion..."
                placeholderTextColor="#A0A5A2"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="h-24 rounded-xl border border-[#E5E0D8] bg-[#FDFBF7] p-3 text-xs font-medium text-[#2C302E] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
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
            <TouchableOpacity
              onPress={handleFeedbackSubmit}
              disabled={isSubmitting || !feedback.trim()}
              className={`flex-row items-center justify-center gap-2 rounded-xl py-3 ${
                isSubmitting || !feedback.trim() ? 'bg-[#A8C3B1]' : 'bg-[#6A9C78]'
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
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* SECTION 4: PRIVACY & LEGAL DISCLOSURES */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <View className="flex-row items-center gap-2">
              <ShieldCheck size={18} color="#8B6B9C" />
              <CardTitle className="text-base font-bold text-[#2C302E] dark:text-white">
                Privacy & Legal Disclosures
              </CardTitle>
            </View>
            <CardDescription className="text-xs text-[#6E7571] dark:text-gray-400">
              Review store privacy statements and manage local device data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <TouchableOpacity
              onPress={() => setShowPrivacyModal(true)}
              className="flex-row items-center justify-between rounded-xl border border-[#E5E0D8] bg-[#FDFBF7] p-3 dark:border-gray-800 dark:bg-gray-900"
            >
              <View className="flex-row items-center gap-2">
                <HelpCircle size={16} color="#8B6B9C" />
                <Text className="text-xs font-bold text-[#2C302E] dark:text-white">View Store Privacy Statement</Text>
              </View>
              <ExternalLink size={14} color="#6E7571" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResetData}
              className="flex-row items-center justify-between rounded-xl border border-[#FCE8E6] bg-[#FFF5F5] p-3 dark:bg-red-950/40"
            >
              <View className="flex-row items-center gap-2">
                <Trash2 size={16} color="#C5221F" />
                <Text className="text-xs font-bold text-[#C5221F]">Reset Local Storage & Settings</Text>
              </View>
            </TouchableOpacity>
          </CardContent>
        </Card>

        <Text className="mb-8 text-center text-xs font-medium text-[#A0A5A2]">
          Formspree Active • TallyHo v1.0.0 (Build 42) • GV Tech UI Native
        </Text>
      </ScrollView>

      {/* PRIVACY STATEMENT MODAL */}
      <Modal visible={showPrivacyModal} animationType="slide" transparent={false}>
        <View className="flex-1 bg-[#FDFBF7] pt-12 dark:bg-[#181A1B]">
          <View className="flex-row items-center justify-between border-b border-[#E5E0D8] bg-[#F7F4EE] px-6 py-4 dark:border-gray-800 dark:bg-[#202324]">
            <Text className="text-lg font-black text-[#2C302E] dark:text-white">Privacy & Data Policy</Text>
            <TouchableOpacity
              onPress={() => setShowPrivacyModal(false)}
              className="rounded-full bg-[#E8E3DA] p-2 dark:bg-gray-700"
            >
              <X size={20} color="#2C302E" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 p-6">
            <Text className="mb-2 text-base font-bold text-[#2C302E] dark:text-white">
              1. Data Collection & Transparency
            </Text>
            <Text className="mb-4 text-xs leading-5 text-[#4A4F4C] dark:text-gray-300">
              User settings (theme mode, sound effects) are stored locally on your device using encrypted storage
              primitives. No personal data is collected without explicit user submission.
            </Text>

            <Text className="mb-2 text-base font-bold text-[#2C302E] dark:text-white">
              2. Formspree Feedback Processing
            </Text>
            <Text className="mb-4 text-xs leading-5 text-[#4A4F4C] dark:text-gray-300">
              Submissions sent via the feedback form are securely transmitted over HTTPS to Formspree
              (https://formspree.io/f/xgawwval) for developer response handling.
            </Text>

            <Text className="mb-2 text-base font-bold text-[#2C302E] dark:text-white">
              3. ATT & Analytics Compliance
            </Text>
            <Text className="mb-4 text-xs leading-5 text-[#4A4F4C] dark:text-gray-300">
              We do NOT perform cross-app tracking or sell user data to third-party brokers (App Tracking Transparency
              compliant).
            </Text>

            <Text className="mb-2 text-base font-bold text-[#2C302E] dark:text-white">
              4. Data Reset & Deletion Rights
            </Text>
            <Text className="mb-6 text-xs leading-5 text-[#4A4F4C] dark:text-gray-300">
              Use the "Reset Local Storage & Settings" button to purge device caches instantly. For feedback deletion
              requests, email privacy@tallyho.app.
            </Text>

            <TouchableOpacity
              onPress={() => setShowPrivacyModal(false)}
              className="mb-10 items-center rounded-xl bg-[#2C302E] py-3 dark:bg-gray-700"
            >
              <Text className="text-xs font-bold text-white">Close Statement</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

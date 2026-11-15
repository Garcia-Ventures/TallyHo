import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Text } from '@gv-tech/ui-native';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { PALETTE } from '../../constants/colors';
import { FEEDBACK_ENDPOINT } from '../../constants/config';
import { nativeSound } from '../../services/audio';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { showToast } from '../../utils/toast';

export function SettingsFeedbackSection() {
  const [category, setCategory] = useState<'General' | 'Bug' | 'Feature'>('General');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);
    setFeedbackStatus('idle');
    setErrorMessage('');

    try {
      const settings = useSettingsStore.getState().settings;
      const response = await fetch(FEEDBACK_ENDPOINT, {
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
  );
}

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { PALETTE } from '../constants/colors';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

type ToastListener = (toasts: ToastMessage[]) => void;

let activeToasts: ToastMessage[] = [];
const listeners = new Set<ToastListener>();
let nextToastId = 0;

function notify() {
  listeners.forEach((fn) => fn([...activeToasts]));
}

export function showToast(
  title: string,
  description?: string,
  variant: 'default' | 'destructive' | 'success' = 'default',
  duration = 4000,
) {
  const id = `toast_${Date.now()}_${++nextToastId}`;
  const newToast: ToastMessage = { id, title, description, variant, duration };
  activeToasts = [...activeToasts.slice(-2), newToast];
  notify();

  setTimeout(() => {
    dismissToast(id);
  }, duration);
}

export function dismissToast(id: string) {
  activeToasts = activeToasts.filter((t) => t.id !== id);
  notify();
}

export function AppToaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} onDismiss={() => dismissToast(item.id)} />
      ))}
    </View>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-16));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const isDestructive = toast.variant === 'destructive';
  const isSuccess = toast.variant === 'success' || toast.title.includes('🎉') || toast.title.includes('Restored');

  const borderColor = isDestructive ? PALETTE.status.errorText : isSuccess ? PALETTE.chip.sage : PALETTE.paper[300];

  const icon = isDestructive ? (
    <AlertCircle size={18} color={PALETTE.status.errorText} />
  ) : isSuccess ? (
    <CheckCircle2 size={18} color={PALETTE.chip.sage} />
  ) : (
    <Info size={18} color={PALETTE.chip.mustard} />
  );

  return (
    <Animated.View
      style={[
        styles.toastCard,
        {
          borderColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{toast.title}</Text>
          {toast.description ? <Text style={styles.descText}>{toast.description}</Text> : null}
        </View>
        <Pressable onPress={onDismiss} hitSlop={8} style={styles.closeButton}>
          <X size={14} color={PALETTE.ink.muted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 52,
    left: 16,
    right: 16,
    zIndex: 99999999,
    elevation: 99999,
    alignItems: 'center',
    gap: 8,
  },
  toastCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: PALETTE.paper[100],
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconContainer: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.ink.primary,
  },
  descText: {
    fontSize: 11,
    fontWeight: '500',
    color: PALETTE.ink.muted,
    lineHeight: 15,
  },
  closeButton: {
    padding: 2,
  },
});

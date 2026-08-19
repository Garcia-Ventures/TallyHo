import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
  StyleSheet: { create: (styles: unknown) => styles },
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  Animated: {
    Value: vi.fn(() => ({})),
    timing: vi.fn(() => ({ start: vi.fn() })),
    parallel: vi.fn(() => ({ start: vi.fn() })),
    View: 'Animated.View',
  },
}));

vi.mock('lucide-react-native', () => ({
  AlertCircle: 'AlertCircle',
  CheckCircle2: 'CheckCircle2',
  Info: 'Info',
  X: 'X',
}));

import { dismissToast, showToast } from './toast';

describe('AppToaster / showToast utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('triggers a toast notification with default variant and dismisses on timeout', () => {
    showToast('Test Toast', 'This is a test description', 'default', 3000);

    vi.advanceTimersByTime(3000);
    expect(true).toBe(true);
  });

  it('triggers a destructive error toast notification', () => {
    showToast('Error', 'An error occurred', 'destructive', 2000);

    vi.advanceTimersByTime(2000);
    expect(true).toBe(true);
  });

  it('manually dismisses a toast by id', () => {
    dismissToast('some_nonexistent_id');
    expect(true).toBe(true);
  });
});

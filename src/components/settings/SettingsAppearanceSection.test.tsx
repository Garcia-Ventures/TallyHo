import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@gv-tech/ui-native', () => ({
  Card: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children?: React.ReactNode }) => <p>{children}</p>,
  CardHeader: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  Switch: ({ checked, onCheckedChange }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void }) => (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onCheckedChange?.(!checked)}>
      toggle
    </button>
  ),
}));

vi.mock('lucide-react-native', () => ({
  Moon: () => null,
  Smartphone: () => null,
  Sun: () => null,
  Vibrate: () => null,
  Volume2: () => null,
}));

vi.mock('react-native', () => ({
  View: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Pressable: ({ children, onPress }: { children?: React.ReactNode; onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
}));

const playPresetSelect = vi.fn();

vi.mock('../../services/audio', () => ({
  nativeSound: {
    playPresetSelect: () => playPresetSelect(),
  },
}));

import { storage } from '../../services/storage';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { SettingsAppearanceSection } from './SettingsAppearanceSection';

function sensorySwitches() {
  const found = screen.getAllByRole('switch');
  const sound = found[0];
  const haptics = found[1];
  if (!sound || !haptics) {
    throw new Error('Expected sound and haptics switches');
  }
  return { sound, haptics };
}

describe('sensory settings toggles', () => {
  beforeEach(() => {
    playPresetSelect.mockClear();
    storage.clearAll();
    useSettingsStore.getState().resetSettings();
  });

  it('turns sound and haptics off and back on through the design-system switch', () => {
    render(<SettingsAppearanceSection />);

    expect(sensorySwitches().sound.getAttribute('aria-checked')).toBe('true');
    expect(sensorySwitches().haptics.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(sensorySwitches().sound);
    expect(useSettingsStore.getState().settings.soundEnabled).toBe(false);
    expect(storage.getSettings().soundEnabled).toBe(false);
    expect(playPresetSelect).not.toHaveBeenCalled();

    fireEvent.click(sensorySwitches().sound);
    expect(useSettingsStore.getState().settings.soundEnabled).toBe(true);
    expect(storage.getSettings().soundEnabled).toBe(true);
    expect(playPresetSelect).toHaveBeenCalledTimes(1);

    fireEvent.click(sensorySwitches().haptics);
    expect(useSettingsStore.getState().settings.hapticsEnabled).toBe(false);
    expect(storage.getSettings().hapticsEnabled).toBe(false);
    expect(useSettingsStore.getState().settings.soundEnabled).toBe(true);

    fireEvent.click(sensorySwitches().haptics);
    expect(useSettingsStore.getState().settings.hapticsEnabled).toBe(true);
    expect(storage.getSettings().hapticsEnabled).toBe(true);
  });
});

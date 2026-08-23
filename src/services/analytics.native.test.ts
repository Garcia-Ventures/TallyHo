import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockTrack, mockOpenPanelNative } = vi.hoisted(() => {
  const trackFn = vi.fn();
  return {
    mockTrack: trackFn,
    mockOpenPanelNative: vi.fn(function () {
      return { track: trackFn };
    }),
  };
});

vi.mock('@openpanel/react-native', () => ({
  OpenPanel: mockOpenPanelNative,
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {},
}));

vi.mock('@react-native-community/netinfo', () => ({
  default: {},
}));

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: { version: '1.2.3' },
  },
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { initAnalytics, trackEvent } from './analytics.native';

describe('analytics.native service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes OpenPanel React Native SDK and tracks app_opened on native platforms', () => {
    initAnalytics();
    expect(mockOpenPanelNative).toHaveBeenCalled();
    expect(mockTrack).toHaveBeenCalledWith('app_opened', {
      platform: 'ios',
      appVersion: '1.2.3',
    });
  });

  it('tracks custom event on native platforms', () => {
    initAnalytics();
    trackEvent('match_started', { scoring_mode: 'RACE_HIGH' });
    expect(mockTrack).toHaveBeenCalledWith('match_started', { scoring_mode: 'RACE_HIGH' });
  });

  it('safely catches errors if native tracking throws', () => {
    initAnalytics();
    mockTrack.mockImplementationOnce(() => {
      throw new Error('Native OpenPanel error');
    });

    expect(() => trackEvent('errored_event')).not.toThrow();
  });
});

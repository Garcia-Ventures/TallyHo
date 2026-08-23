import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockTrack, mockOpenPanel } = vi.hoisted(() => {
  const trackFn = vi.fn();
  return {
    mockTrack: trackFn,
    mockOpenPanel: vi.fn(function () {
      return { track: trackFn };
    }),
  };
});

vi.mock('@openpanel/web', () => ({
  OpenPanel: mockOpenPanel,
}));

import { initAnalytics, trackEvent } from './analytics.web';

describe('analytics.web service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes OpenPanel Web SDK and tracks app_opened', () => {
    initAnalytics();
    expect(mockOpenPanel).toHaveBeenCalled();
    expect(mockTrack).toHaveBeenCalledWith('app_opened', { platform: 'web' });
  });

  it('tracks custom event when initialized', () => {
    initAnalytics();
    trackEvent('test_event', { key: 'value' });
    expect(mockTrack).toHaveBeenCalledWith('test_event', { key: 'value' });
  });

  it('handles trackEvent without crashing if track throws', () => {
    initAnalytics();
    mockTrack.mockImplementationOnce(() => {
      throw new Error('Analytics Error');
    });

    expect(() => trackEvent('failing_event')).not.toThrow();
  });
});

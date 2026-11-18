import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockTrack, mockOpenPanel, mockIsLocalWebHost } = vi.hoisted(() => {
  const trackFn = vi.fn();
  return {
    mockTrack: trackFn,
    mockOpenPanel: vi.fn(function () {
      return { track: trackFn };
    }),
    mockIsLocalWebHost: vi.fn(() => false),
  };
});

vi.mock('@openpanel/web', () => ({
  OpenPanel: mockOpenPanel,
}));

vi.mock('./analyticsHost', () => ({
  isLocalWebHost: mockIsLocalWebHost,
}));

import { initAnalytics, trackEvent } from './analytics';

describe('analytics service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLocalWebHost.mockReturnValue(false);
  });

  it('tracks events safely before or after initialization', () => {
    // Calling trackEvent before init should not crash
    expect(() => trackEvent('test_before_init')).not.toThrow();

    initAnalytics();
    expect(mockTrack).toHaveBeenCalledWith('app_opened', { platform: 'web' });

    trackEvent('match_started', { preset: 'uno', player_count: 3 });
    expect(mockTrack).toHaveBeenCalledWith('match_started', { preset: 'uno', player_count: 3 });
  });

  it('handles trackEvent without payload', () => {
    initAnalytics();
    trackEvent('button_clicked');
    expect(mockTrack).toHaveBeenCalledWith('button_clicked', undefined);
  });

  it('swallows errors if OpenPanel track throws', () => {
    initAnalytics();
    mockTrack.mockImplementationOnce(() => {
      throw new Error('Analytics Network Error');
    });

    expect(() => trackEvent('faulty_event')).not.toThrow();
  });

  it('swallows errors if OpenPanel constructor throws during initialization', async () => {
    const { OpenPanel } = await import('@openpanel/web');
    vi.mocked(OpenPanel).mockImplementationOnce(function () {
      throw new Error('Init Error');
    });

    expect(() => initAnalytics()).not.toThrow();
  });

  it('does not construct OpenPanel or send events on localhost', () => {
    initAnalytics();
    expect(mockOpenPanel).toHaveBeenCalled();

    mockIsLocalWebHost.mockReturnValue(true);
    mockOpenPanel.mockClear();
    mockTrack.mockClear();

    initAnalytics();
    trackEvent('match_started', { preset: 'uno' });

    expect(mockOpenPanel).not.toHaveBeenCalled();
    expect(mockTrack).not.toHaveBeenCalled();
  });
});

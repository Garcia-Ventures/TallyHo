import { describe, expect, it } from 'vitest';

import { isLocalAnalyticsHost, isLocalWebHost } from './analyticsHost';

describe('isLocalAnalyticsHost', () => {
  it('treats loopback names as local', () => {
    expect(isLocalAnalyticsHost('localhost')).toBe(true);
    expect(isLocalAnalyticsHost('LOCALHOST')).toBe(true);
    expect(isLocalAnalyticsHost('127.0.0.1')).toBe(true);
    expect(isLocalAnalyticsHost('::1')).toBe(true);
    expect(isLocalAnalyticsHost('[::1]')).toBe(true);
    expect(isLocalAnalyticsHost('0.0.0.0')).toBe(true);
    expect(isLocalAnalyticsHost('app.localhost')).toBe(true);
  });

  it('leaves deployed hosts enabled', () => {
    expect(isLocalAnalyticsHost('tallyho.example')).toBe(false);
    expect(isLocalAnalyticsHost('tallyho.pages.dev')).toBe(false);
    expect(isLocalAnalyticsHost('192.168.1.20')).toBe(false);
    expect(isLocalAnalyticsHost('')).toBe(false);
    expect(isLocalAnalyticsHost(undefined)).toBe(false);
    expect(isLocalAnalyticsHost(null)).toBe(false);
  });
});

describe('isLocalWebHost', () => {
  it('reads the jsdom page hostname', () => {
    expect(window.location.hostname).toBe('localhost');
    expect(isLocalWebHost()).toBe(true);
  });
});

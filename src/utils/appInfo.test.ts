import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
  expoConfig: { version: '1.4.2' } as { version?: string } | undefined,
  build: '42' as string | null,
  throwOnBuild: false,
}));

vi.mock('expo-constants', () => ({
  get default() {
    return { expoConfig: mockState.expoConfig };
  },
}));

vi.mock('expo-application', () => ({
  get nativeBuildVersion() {
    if (mockState.throwOnBuild) {
      throw new Error('native module unavailable');
    }
    return mockState.build;
  },
}));

import { getAppVersion, getAppVersionLabel, getBuildNumber } from './appInfo';

describe('appInfo utility', () => {
  beforeEach(() => {
    mockState.expoConfig = { version: '1.4.2' };
    mockState.build = '42';
    mockState.throwOnBuild = false;
  });

  it('reads version from the Expo config', () => {
    expect(getAppVersion()).toBe('1.4.2');
  });

  it('reads the native build number', () => {
    expect(getBuildNumber()).toBe('42');
  });

  it('formats the full version label with build number', () => {
    expect(getAppVersionLabel()).toBe('v1.4.2 (Build 42)');
  });

  it('omits the build segment when unavailable', () => {
    mockState.build = null;
    expect(getAppVersionLabel()).toBe('v1.4.2');
  });

  it('returns empty build string when the native module throws', () => {
    mockState.throwOnBuild = true;
    expect(getBuildNumber()).toBe('');
  });

  it('falls back to 1.0.0 when Expo config is missing', () => {
    mockState.expoConfig = undefined;
    mockState.build = null;
    expect(getAppVersion()).toBe('1.0.0');
    expect(getAppVersionLabel()).toBe('v1.0.0');
  });
});

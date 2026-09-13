import * as Application from 'expo-application';
import Constants from 'expo-constants';

/**
 * App version from the Expo config (e.g. "1.4.2"). Falls back to '1.0.0' when running outside the Expo runtime (unit
 * tests, SSR).
 */
export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

/** Native build number (Android versionCode / iOS CFBundleVersion). Empty string when unavailable (web, unit tests). */
export function getBuildNumber(): string {
  try {
    return Application.nativeBuildVersion ?? '';
  } catch {
    return '';
  }
}

/** Human-readable "v1.4.2 (Build 42)" label for settings footers and diagnostics. */
export function getAppVersionLabel(): string {
  const version = getAppVersion();
  const build = getBuildNumber();
  return build ? `v${version} (Build ${build})` : `v${version}`;
}

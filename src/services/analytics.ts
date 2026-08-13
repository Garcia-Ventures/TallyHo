const CLIENT_ID = process.env.EXPO_PUBLIC_OPENPANEL_CLIENT_ID || '';
const API_URL = process.env.EXPO_PUBLIC_OPENPANEL_API_URL || '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let opInstance: any = null;

/**
 * Initializes the OpenPanel SDK instance if EXPO_PUBLIC_OPENPANEL_CLIENT_ID is provided.
 * If credentials are missing, calls will safely no-op.
 */
export function initAnalytics(): void {
  if (!CLIENT_ID) {
    if (__DEV__) {
      console.log('[Analytics] No EXPO_PUBLIC_OPENPANEL_CLIENT_ID configured. OpenPanel disabled.');
    }
    return;
  }

  try {
    let platformOS = typeof window !== 'undefined' ? 'web' : 'node';
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Platform } = require('react-native');
      if (Platform?.OS) {
        platformOS = Platform.OS;
      }
    } catch {
      // Non-native environment
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let OpenPanel: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let AsyncStorage: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let NetInfo: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Constants: any = null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      OpenPanel = require('@openpanel/react-native').OpenPanel;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      AsyncStorage = require('@react-native-async-storage/async-storage').default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      NetInfo = require('@react-native-community/netinfo').default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Constants = require('expo-constants').default;
    } catch {
      // Native modules unavailable
    }

    if (!OpenPanel) {
      return;
    }

    opInstance = new OpenPanel({
      clientId: CLIENT_ID,
      apiUrl: API_URL || undefined,
      storage: AsyncStorage,
      networkInfo: NetInfo,
      sdkVersion: Constants?.expoConfig?.version || '1.0.0',
    });

    opInstance.track('app_opened', {
      platform: platformOS,
      appVersion: Constants?.expoConfig?.version || '1.0.0',
    });
  } catch (err) {
    if (__DEV__) {
      console.log('[Analytics] Failed to initialize OpenPanel:', err);
    }
  }
}

/**
 * Tracks a custom event in OpenPanel.
 * Safe to call anywhere in the app regardless of analytics enablement.
 */
export function trackEvent(name: string, payload?: Record<string, unknown>): void {
  if (!opInstance) {
    return;
  }
  try {
    opInstance.track(name, payload);
  } catch (err) {
    if (__DEV__) {
      console.log(`[Analytics] Error tracking event "${name}":`, err);
    }
  }
}

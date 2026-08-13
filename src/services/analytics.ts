const CLIENT_ID = process.env.EXPO_PUBLIC_OPENPANEL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_OPENPANEL_CLIENT_SECRET || '';
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
    // Dynamic requires prevent native module loading failures in unit tests and web environment
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require('expo-constants').default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Platform } = require('react-native');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { OpenPanel } = require('@openpanel/react-native');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NetInfo = require('@react-native-community/netinfo').default;

    opInstance = new OpenPanel({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      apiUrl: API_URL || undefined,
      storage: AsyncStorage,
      networkInfo: NetInfo,
      sdkVersion: Constants?.expoConfig?.version || '1.0.0',
    });

    opInstance.track('app_opened', {
      platform: Platform.OS,
      appVersion: Constants?.expoConfig?.version || '1.0.0',
    });
  } catch (err) {
    if (__DEV__) {
      console.log('[Analytics] Failed to initialize OpenPanel (native module unavailable):', err);
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

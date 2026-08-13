const CLIENT_ID = process.env.EXPO_PUBLIC_OPENPANEL_CLIENT_ID || '';
const API_URL = process.env.EXPO_PUBLIC_OPENPANEL_API_URL || '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let opInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeRequire(moduleName: string): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(moduleName);
  } catch {
    return null;
  }
}

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
    const reactNative = safeRequire('react-native');
    const platformOS = reactNative?.Platform?.OS || (typeof window !== 'undefined' ? 'web' : 'node');
    const openPanelModule = safeRequire('@openpanel/react-native');
    const asyncStorageModule = safeRequire('@react-native-async-storage/async-storage');
    const netInfoModule = safeRequire('@react-native-community/netinfo');
    const expoConstants = safeRequire('expo-constants');

    if (!openPanelModule?.OpenPanel) {
      return;
    }

    opInstance = new openPanelModule.OpenPanel({
      clientId: CLIENT_ID,
      apiUrl: API_URL || undefined,
      storage: asyncStorageModule?.default || asyncStorageModule,
      networkInfo: netInfoModule?.default || netInfoModule,
      sdkVersion: expoConstants?.default?.expoConfig?.version || '1.0.0',
    });

    opInstance.track('app_opened', {
      platform: platformOS,
      appVersion: expoConstants?.default?.expoConfig?.version || '1.0.0',
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

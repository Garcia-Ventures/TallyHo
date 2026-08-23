import { OpenPanel } from '@openpanel/web';

const DEFAULT_CLIENT_ID = 'f68ef1dc-81f3-4f14-b15f-218614e0913a';
const DEFAULT_API_URL = 'https://openpanel.gventureshq.com/api';

let opInstance: OpenPanel | null = null;

/**
 * Initializes OpenPanel Web SDK on Web Target.
 */
export function initAnalytics(): void {
  const clientId = process.env.EXPO_PUBLIC_OPENPANEL_CLIENT_ID || DEFAULT_CLIENT_ID;
  const apiUrl = process.env.EXPO_PUBLIC_OPENPANEL_API_URL || DEFAULT_API_URL;

  if (!clientId) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[Analytics] No EXPO_PUBLIC_OPENPANEL_CLIENT_ID configured. OpenPanel Web disabled.');
    }
    return;
  }

  try {
    opInstance = new OpenPanel({
      clientId,
      apiUrl: apiUrl || undefined,
      trackScreenViews: true,
      trackAttributes: true,
      trackOutgoingLinks: true,
    });

    opInstance.track('app_opened', {
      platform: 'web',
    });

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[Analytics] Initialized OpenPanel Web SDK successfully:', clientId);
    }
  } catch (err) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[Analytics] Failed to initialize OpenPanel Web SDK:', err);
    }
  }
}

/**
 * Tracks a custom event in OpenPanel Web SDK.
 */
export function trackEvent(name: string, payload?: Record<string, unknown>): void {
  if (!opInstance) {
    return;
  }
  try {
    opInstance.track(name, payload);
  } catch (err) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`[Analytics] Error tracking event "${name}":`, err);
    }
  }
}

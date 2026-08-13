import { OpenPanel } from '@openpanel/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_CLIENT_ID = 'f68ef1dc-81f3-4f14-b15f-218614e0913a';
const DEFAULT_API_URL = 'https://openpanel.gventureshq.com/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let opInstance: any = null;

/**
 * Initializes OpenPanel React Native SDK on Mobile Native Target (iOS & Android).
 */
export function initAnalytics(): void {
  const clientId = process.env.EXPO_PUBLIC_OPENPANEL_CLIENT_ID || DEFAULT_CLIENT_ID;
  const apiUrl = process.env.EXPO_PUBLIC_OPENPANEL_API_URL || DEFAULT_API_URL;

  if (!clientId) {
    if (__DEV__) {
      console.log('[Analytics] No EXPO_PUBLIC_OPENPANEL_CLIENT_ID configured. OpenPanel Native disabled.');
    }
    return;
  }

  try {
    opInstance = new OpenPanel({
      clientId,
      apiUrl: apiUrl || undefined,
      storage: AsyncStorage,
      networkInfo: NetInfo,
      sdkVersion: Constants?.expoConfig?.version || '1.0.0',
    });

    opInstance.track('app_opened', {
      platform: Platform.OS,
      appVersion: Constants?.expoConfig?.version || '1.0.0',
    });

    if (__DEV__) {
      console.log(`[Analytics] Initialized OpenPanel Native SDK (${Platform.OS}) successfully.`);
    }
  } catch (err) {
    if (__DEV__) {
      console.log('[Analytics] Failed to initialize OpenPanel Native SDK:', err);
    }
  }
}

/**
 * Tracks a custom event in OpenPanel React Native SDK.
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

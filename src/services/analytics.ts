import { OpenPanel } from '@openpanel/web';

const DEFAULT_CLIENT_ID = 'f68ef1dc-81f3-4f14-b15f-218614e0913a';
const DEFAULT_API_URL = 'https://openpanel.gventureshq.com/api';

let opInstance: OpenPanel | null = null;

/** Shared OpenPanel Analytics Service for Web and Node/Vitest environments. */
export function initAnalytics(): void {
  const clientId = process.env.EXPO_PUBLIC_OPENPANEL_CLIENT_ID || DEFAULT_CLIENT_ID;
  const apiUrl = process.env.EXPO_PUBLIC_OPENPANEL_API_URL || DEFAULT_API_URL;

  if (!clientId) {
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
  } catch {
    // Silent fallback
  }
}

export function trackEvent(name: string, payload?: Record<string, unknown>): void {
  if (!opInstance) {
    return;
  }
  try {
    opInstance.track(name, payload);
  } catch {
    // Silent fallback
  }
}

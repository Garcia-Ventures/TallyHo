import * as Sentry from '@sentry/react-native';

import { shouldDropSentryEvent } from './sentry';

/**
 * Starts Sentry once at app launch. Crash reports stay limited to stack traces and device diagnostics. IP addresses,
 * screen recordings, and the Sentry feedback widget are off so reports match the privacy policy.
 */
export function initAppSentry(): void {
  Sentry.init({
    dsn: 'https://ba35c9ea2c45d64b131f6b854cd5c3ea@o4511873601306624.ingest.us.sentry.io/4511873607991296',
    sendDefaultPii: false,
    enableLogs: true,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend(event) {
      if (shouldDropSentryEvent(event)) {
        return null;
      }
      delete event.user;
      return event;
    },
  });
}

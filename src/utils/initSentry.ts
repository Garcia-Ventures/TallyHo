import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

import { shouldDropSentryEvent } from './sentry';

/** Starts Sentry once at app launch. Kept beside the filter helpers so ignore rules live in one place. */
export function initAppSentry(): void {
  Sentry.init({
    dsn: 'https://ba35c9ea2c45d64b131f6b854cd5c3ea@o4511873601306624.ingest.us.sentry.io/4511873607991296',
    sendDefaultPii: true,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations:
      Platform.OS === 'web'
        ? [Sentry.feedbackIntegration()]
        : [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
    beforeSend(event) {
      if (shouldDropSentryEvent(event)) {
        return null;
      }
      return event;
    },
  });
}

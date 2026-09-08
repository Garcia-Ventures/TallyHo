/**
 * Centralized Sentry Telemetry & Observability Utility for Tally Ho.
 * Safely handles environments where native Sentry SDK is not initialized (e.g. Node unit tests).
 */

let SentryModule: typeof import('@sentry/react-native') | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SentryModule = require('@sentry/react-native');
} catch {
  // Sentry native module disabled in unit test / non-native environment
}

/**
 * Capture an exception in Sentry.
 */
export function captureException(error: unknown): void {
  if (!SentryModule) {
    return;
  }
  SentryModule.captureException(error);
}

/**
 * Record a structured breadcrumb in Sentry for tracing application flow.
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
): void {
  if (!SentryModule) {
    return;
  }
  SentryModule.addBreadcrumb({
    category,
    message,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Track key game lifecycle events in Sentry breadcrumbs.
 */
export function trackMatchEvent(
  event: 'match_created' | 'round_submitted' | 'round_edited' | 'match_completed' | 'storage_reset',
  details?: Record<string, unknown>,
): void {
  addBreadcrumb('game_lifecycle', `Match Event: ${event}`, details, 'info');
}

/**
 * Set user context info for Sentry events.
 */
export function setUserContext(userId: string, username?: string): void {
  if (!SentryModule) {
    return;
  }
  SentryModule.setUser({
    id: userId,
    username,
  });
}

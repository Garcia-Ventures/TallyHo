/**
 * Centralized Sentry Telemetry & Observability Utility for Tally Ho. Safely handles environments where native Sentry
 * SDK is not initialized (e.g. Node unit tests).
 */

import type * as SentryRN from '@sentry/react-native';

let SentryModule: typeof SentryRN | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SentryModule = require('@sentry/react-native');
} catch {
  // Sentry native module disabled in unit test / non-native environment
}

export interface TelemetryContext {
  [key: string]: unknown;
}

/**
 * Substrings (lowercased) identifying expected store / billing states that should not pollute Sentry. Covers TALLYHO-9
 * (Play Store referrer on emulators), TALLYHO-Q (purchase not allowed), TALLYHO-R (transient Offerings fetch failure),
 * TALLYHO-P (already-owned), and TALLYHO-T (RevenueCat unknown backend error while fetching offerings).
 */
const EXPECTED_BILLING_PATTERNS = [
  'install referrer',
  'installation referrer api',
  'play store may not be installed',
  'not allowed to make the purchase',
  'purchase not allowed',
  'purchase_not_allowed',
  'billing is unavailable',
  'billing_unavailable',
  'already active',
  'already owned',
  'already purchased',
  'product_already_purchased',
  'error performing request',
  'unknown backend error',
  'failed to fetch offerings',
  'purchase cancelled',
  'purchase_cancelled',
  'user cancelled',
  'usercancelled',
];

function messageOf(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return `${error.message} ${error.name}`;
  }
  if (error && typeof error === 'object') {
    const maybe = error as { message?: unknown; code?: unknown };
    return `${String(maybe.message ?? '')} ${String(maybe.code ?? '')}`;
  }
  return '';
}

/** Returns true when the error represents an expected store/billing state. */
export function isExpectedBillingError(error: unknown, context?: TelemetryContext): boolean {
  const haystack = `${messageOf(error)} ${typeof context?.message === 'string' ? context.message : ''}`.toLowerCase();
  if (!haystack.trim()) {
    return false;
  }
  return EXPECTED_BILLING_PATTERNS.some((pattern) => haystack.includes(pattern));
}

/** Capture an exception in Sentry with optional extra context data. */
export function captureException(error: unknown, context?: TelemetryContext): void {
  if (!SentryModule) {
    return;
  }
  if (isExpectedBillingError(error, context)) {
    return;
  }
  if (context) {
    SentryModule.withScope((scope) => {
      scope.setExtras(context);
      SentryModule?.captureException(error);
    });
  } else {
    SentryModule.captureException(error);
  }
}

/** Record a structured breadcrumb in Sentry for tracing application flow. */
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

/** Track key game lifecycle events in Sentry breadcrumbs. */
export function trackMatchEvent(
  event: 'match_created' | 'round_submitted' | 'round_edited' | 'match_completed' | 'storage_reset',
  details?: Record<string, unknown>,
): void {
  addBreadcrumb('game_lifecycle', `Match Event: ${event}`, details, 'info');
}

/** Set user context info for Sentry events. */
export function setUserContext(userId: string, username?: string): void {
  if (!SentryModule) {
    return;
  }
  SentryModule.setUser({
    id: userId,
    username,
  });
}

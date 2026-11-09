import { beforeEach, describe, expect, it } from 'vitest';

import { addBreadcrumb, captureException, isExpectedBillingError, setUserContext, trackMatchEvent } from './sentry';

describe('sentry utility', () => {
  beforeEach(() => {
    // Clean environment
  });

  it('safely handles exception capture without crashing', () => {
    expect(() => captureException(new Error('Test exception'))).not.toThrow();
    expect(() => captureException(new Error('With context'), { score: 100 })).not.toThrow();
  });

  it('safely adds breadcrumbs without crashing', () => {
    expect(() => addBreadcrumb('game', 'round_started', { round: 1 })).not.toThrow();
    expect(() => addBreadcrumb('auth', 'token_refresh', {}, 'warning')).not.toThrow();
  });

  it('safely tracks match lifecycle events', () => {
    expect(() => trackMatchEvent('match_created', { id: 'm1' })).not.toThrow();
    expect(() => trackMatchEvent('round_submitted', { round: 2 })).not.toThrow();
    expect(() => trackMatchEvent('match_completed', { winner: 'p1' })).not.toThrow();
    expect(() => trackMatchEvent('round_edited', { round: 1 })).not.toThrow();
    expect(() => trackMatchEvent('storage_reset')).not.toThrow();
  });

  it('safely sets user context', () => {
    expect(() => setUserContext('usr_123', 'Player One')).not.toThrow();
  });

  it('flags expected store/billing states (TALLYHO-9/Q/R/P)', () => {
    expect(
      isExpectedBillingError(
        new Error(
          "The current Play Store app doesn't provide the installation referrer API, or the Play Store may not be installed.",
        ),
      ),
    ).toBe(true);
    expect(isExpectedBillingError(new Error('The device or user is not allowed to make the purchase.'))).toBe(true);
    expect(
      isExpectedBillingError(new Error('Error performing request.'), {
        message: '[RevenueCat] Failed to fetch Offerings:',
      }),
    ).toBe(true);
    expect(isExpectedBillingError(new Error('This product is already active for the user.'))).toBe(true);
    expect(isExpectedBillingError(new Error('There was an unknown backend error.'))).toBe(true);
  });

  it('does not flag unexpected errors', () => {
    expect(isExpectedBillingError(new Error('Null is not an object (evaluating foo.bar)'))).toBe(false);
    expect(isExpectedBillingError(new Error('boom'), { message: '[RevenueCat] Initialization failed:' })).toBe(false);
  });
});

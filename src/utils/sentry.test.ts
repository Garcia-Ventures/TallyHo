import { beforeEach, describe, expect, it } from 'vitest';
import { addBreadcrumb, captureException, setUserContext, trackMatchEvent } from './sentry';

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
});

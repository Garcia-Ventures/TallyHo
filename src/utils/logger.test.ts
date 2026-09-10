import { describe, expect, it, vi } from 'vitest';

import { logError, logInfo, logWarn } from './logger';

describe('logger utility', () => {
  it('logs errors without crashing, with and without an error object', () => {
    expect(() => logError('Something failed', new Error('boom'))).not.toThrow();
    expect(() => logError('Something failed without cause')).not.toThrow();
  });

  it('logs warnings without crashing, with and without an error object', () => {
    expect(() => logWarn('Degraded path', new Error('warn cause'))).not.toThrow();
    expect(() => logWarn('Degraded path without cause')).not.toThrow();
  });

  it('logs info without crashing and forwards extra args', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal('__DEV__', true);
    try {
      expect(() => logInfo('Init done', { detail: 1 })).not.toThrow();
      expect(spy).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it('does not touch console in production mode', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal('__DEV__', false);
    try {
      logError('prod error', new Error('x'));
      logWarn('prod warn');
      logInfo('prod info');
      expect(errorSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
      logSpy.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});

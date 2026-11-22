import { renderHook } from '@testing-library/react';
import { useRouter, type ImperativeRouter } from 'expo-router';
import { describe, expect, it, vi } from 'vitest';

import { useSafeRouter } from './useSafeRouter';

vi.mock('expo-router', () => ({
  useRouter: vi.fn(),
}));

function isImperativeRouter(value: object): value is ImperativeRouter {
  return 'push' in value && 'back' in value;
}

describe('useSafeRouter', () => {
  it('returns the expo-router instance', () => {
    const mockRouter = { push: vi.fn(), back: vi.fn() };
    if (!isImperativeRouter(mockRouter)) {
      throw new Error('Expected router mock to expose push and back');
    }
    vi.mocked(useRouter).mockReturnValue(mockRouter);

    const { result } = renderHook(() => useSafeRouter());

    expect(result.current).toBe(mockRouter);
  });
});

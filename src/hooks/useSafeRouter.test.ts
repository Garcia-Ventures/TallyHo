import { renderHook } from '@testing-library/react';
import { useRouter } from 'expo-router';
import { describe, expect, it, vi } from 'vitest';

import { useSafeRouter } from './useSafeRouter';

vi.mock('expo-router', () => ({
  useRouter: vi.fn(),
}));

describe('useSafeRouter', () => {
  it('returns the expo-router instance', () => {
    const mockRouter = { push: vi.fn(), back: vi.fn() };
    vi.mocked(useRouter).mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>);

    const { result } = renderHook(() => useSafeRouter());

    expect(result.current).toBe(mockRouter);
  });
});

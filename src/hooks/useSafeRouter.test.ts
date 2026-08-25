import { renderHook } from '@testing-library/react';
import { useRouter } from 'expo-router';
import { describe, expect, it, vi } from 'vitest';
import { useSafeRouter } from './useSafeRouter';

vi.mock('expo-router', () => ({
  useRouter: vi.fn(),
}));

describe('useSafeRouter', () => {
  it('returns useRouter when it does not throw', () => {
    const mockRouter = { push: vi.fn(), back: vi.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);

    const { result } = renderHook(() => useSafeRouter());

    expect(result.current).toBe(mockRouter);
  });

  it('returns fallback router when useRouter throws', () => {
    vi.mocked(useRouter).mockImplementation(() => {
      throw new Error('No router');
    });

    // Suppress console.error if renderHook prints errors, but actually testing-library might catch it
    // Wait, the hook internally catches it! So it won't throw to the test runner.
    const { result } = renderHook(() => useSafeRouter());

    expect(result.current).toEqual({
      back: expect.any(Function),
      push: expect.any(Function),
    });

    // Test calling the fallback functions to ensure they don't crash
    expect(() => {
      result.current.back();
      result.current.push('/test');
    }).not.toThrow();
  });
});

import { useRouter } from 'expo-router';

/**
 * Returns the expo-router instance. Must be called inside an expo-router route tree (all production callers are).
 * Previously wrapped `useRouter()` in try/catch, which violates the Rules of Hooks (hooks may not be called
 * conditionally) — the fallback was unreachable dead code in practice.
 */
export function useSafeRouter() {
  return useRouter();
}

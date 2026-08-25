import { useRouter } from 'expo-router';

export function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return { back: () => {}, push: (_path: string) => {} };
  }
}

import type { NativeAdSlotProps } from './adBannerPlacement';

export type { NativeAdSlotProps };

/** IOS, web, and Vitest. Android replaces this file with NativeAdSlot.android.tsx. */
export const nativeAdsSupported = false;

export function NativeAdSlot(_props: NativeAdSlotProps) {
  return null;
}

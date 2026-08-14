/**
 * Shared fallback Purchases service for Vitest unit test environments.
 * Platform-specific implementations exist in purchases.web.ts and purchases.native.ts.
 */

export interface PurchaseResult {
  success: boolean;
  isAdFree: boolean;
  redirected?: boolean;
}

export async function initPurchases(): Promise<void> {
  // Test fallback
}

export async function purchaseAdFreePackage(): Promise<PurchaseResult> {
  return { success: true, isAdFree: true };
}

export async function restoreAdFreePurchases(): Promise<PurchaseResult> {
  return { success: true, isAdFree: true };
}

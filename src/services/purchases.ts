export interface PurchaseResult {
  success: boolean;
  isPro: boolean;
  userCancelled?: boolean;
  error?: string;
  redirected?: boolean;
}

export async function initPurchases(): Promise<void> {
  // Vitest test fallback
}

export async function getCustomerInfo(): Promise<null> {
  return null;
}

export async function getOfferings(): Promise<null> {
  return null;
}

export async function purchasePackage(): Promise<PurchaseResult> {
  return { success: true, isPro: true };
}

export async function purchasePackageByIdentifier(_tier: 'lifetime' | 'yearly' | 'monthly'): Promise<PurchaseResult> {
  return { success: true, isPro: true };
}

export async function purchaseAdFreePackage(): Promise<PurchaseResult> {
  return { success: true, isPro: true };
}

export async function restoreAdFreePurchases(): Promise<PurchaseResult> {
  return { success: true, isPro: true };
}

export async function presentPaywall(): Promise<PurchaseResult> {
  return { success: true, isPro: true };
}

export async function presentCustomerCenter(): Promise<void> {
  // Test fallback
}

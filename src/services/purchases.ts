import type { ProGrantListener, PurchaseResult, PurchasesOfferings } from './purchases.types';

export { PRO_ENTITLEMENT_ID } from './purchases.constants';
export type {
  ProGrantListener,
  PurchaseResult,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesProduct,
} from './purchases.types';

export async function initPurchases(): Promise<void> {
  // Base fallback for non-platform runtimes (unit tests) — intentionally a no-op.
}

export function setProGrantListener(_listener: ProGrantListener): void {
  // Native RevenueCat registers the real listener. Tests and web no-op unless purchases.web overrides it.
}

export async function getCustomerInfo(): Promise<null> {
  return null;
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  return null;
}

export async function purchasePackage(): Promise<PurchaseResult> {
  return { success: false, isPro: false, error: 'Purchases unavailable on this platform' };
}

export async function purchasePackageByIdentifier(
  _tier: 'lifetime' | 'yearly' | 'monthly',
  _email?: string,
): Promise<PurchaseResult> {
  return { success: false, isPro: false, error: 'Purchases unavailable on this platform' };
}

export async function purchaseAdFreePackage(): Promise<PurchaseResult> {
  return { success: false, isPro: false, error: 'Purchases unavailable on this platform' };
}

export async function restoreAdFreePurchases(_email?: string): Promise<PurchaseResult> {
  return { success: false, isPro: false, error: 'Purchases unavailable on this platform' };
}

export async function presentPaywall(): Promise<PurchaseResult> {
  return { success: false, isPro: false, error: 'Purchases unavailable on this platform' };
}

export async function presentCustomerCenter(): Promise<boolean> {
  return false;
}

/**
 * Canonical RevenueCat entitlement identifier for TallyHo Pro. Must match the Entitlements identifier in the RevenueCat
 * dashboard.
 */
export const PRO_ENTITLEMENT_ID = 'TallyHo Pro';

export interface PurchaseResult {
  success: boolean;
  isPro: boolean;
  userCancelled?: boolean;
  error?: string;
  redirected?: boolean;
  needsEmail?: boolean;
  /** Store reports the product as already owned — caller should recover via restore. */
  alreadyOwned?: boolean;
}

export interface PurchasesProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

export interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: PurchasesProduct;
}

export interface PurchasesOffering {
  identifier: string;
  serverDescription: string;
  availablePackages: PurchasesPackage[];
  lifetime?: PurchasesPackage | null;
  annual?: PurchasesPackage | null;
  monthly?: PurchasesPackage | null;
}

export interface PurchasesOfferings {
  all: Record<string, PurchasesOffering>;
  current: PurchasesOffering | null;
}

export async function initPurchases(): Promise<void> {
  // Base fallback for non-platform runtimes (unit tests) — intentionally a no-op.
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

export interface PurchaseResult {
  success: boolean;
  isPro: boolean;
  userCancelled?: boolean;
  error?: string;
  redirected?: boolean;
  needsEmail?: boolean;
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
  // Vitest test fallback
}

export async function getCustomerInfo(): Promise<null> {
  return null;
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
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

export async function restoreAdFreePurchases(_email?: string): Promise<PurchaseResult> {
  return { success: true, isPro: true };
}

export async function presentPaywall(): Promise<PurchaseResult> {
  return { success: true, isPro: true };
}

export async function presentCustomerCenter(): Promise<void> {
  // Test fallback
}

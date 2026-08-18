import { Linking } from 'react-native';

const STRIPE_CHECKOUT_URL = process.env.EXPO_PUBLIC_STRIPE_CHECKOUT_URL || 'https://buy.stripe.com/tallyho_pro';

export interface PurchaseResult {
  success: boolean;
  isPro: boolean;
  userCancelled?: boolean;
  error?: string;
  redirected?: boolean;
}

export async function initPurchases(): Promise<void> {
  // Web checkout uses Stripe link redirect
}

export async function getCustomerInfo(): Promise<null> {
  return null;
}

import type { PurchasesOfferings } from './purchases';

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  return null;
}

export async function purchasePackage(): Promise<PurchaseResult> {
  return purchaseAdFreePackage();
}

export async function purchasePackageByIdentifier(_tier: 'lifetime' | 'yearly' | 'monthly'): Promise<PurchaseResult> {
  return purchaseAdFreePackage();
}

export async function purchaseAdFreePackage(): Promise<PurchaseResult> {
  try {
    if (typeof window !== 'undefined') {
      window.open(STRIPE_CHECKOUT_URL, '_blank');
    } else {
      await Linking.openURL(STRIPE_CHECKOUT_URL);
    }
    return { success: true, isPro: false, redirected: true };
  } catch (err) {
    console.error('[Purchases] Web Stripe redirect failed:', err);
    return { success: false, isPro: false };
  }
}

export async function restoreAdFreePurchases(): Promise<PurchaseResult> {
  return { success: false, isPro: false };
}

export async function presentPaywall(): Promise<PurchaseResult> {
  return purchaseAdFreePackage();
}

export async function presentCustomerCenter(): Promise<void> {
  if (typeof window !== 'undefined') {
    window.open('https://billing.stripe.com/p/login/test', '_blank');
  }
}

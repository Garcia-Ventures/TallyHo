import { Linking } from 'react-native';

const STRIPE_CHECKOUT_URL = process.env.EXPO_PUBLIC_STRIPE_CHECKOUT_URL || 'https://buy.stripe.com/tallyho_pro';

export interface PurchaseResult {
  success: boolean;
  isAdFree: boolean;
  redirected?: boolean;
}

/**
 * Initializes Purchases service on Web.
 */
export async function initPurchases(): Promise<void> {
  // Web checkout uses Stripe link redirect
}

/**
 * Executes Ad-Free lifetime purchase on Web target via Stripe.
 */
export async function purchaseAdFreePackage(): Promise<PurchaseResult> {
  try {
    if (typeof window !== 'undefined') {
      window.open(STRIPE_CHECKOUT_URL, '_blank');
    } else {
      await Linking.openURL(STRIPE_CHECKOUT_URL);
    }
    return { success: true, isAdFree: false, redirected: true };
  } catch (err) {
    console.error('[Purchases] Web Stripe redirect failed:', err);
    return { success: false, isAdFree: false };
  }
}

/**
 * Restores previous purchases on Web target.
 */
export async function restoreAdFreePurchases(): Promise<PurchaseResult> {
  return { success: false, isAdFree: false };
}

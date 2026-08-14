import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { AD_CONFIG } from '../constants/config';

const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '';
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '';

let isInitialized = false;

export interface PurchaseResult {
  success: boolean;
  isAdFree: boolean;
  redirected?: boolean;
}

/**
 * Initializes RevenueCat SDK on Android Google Play Billing & iOS StoreKit.
 */
export async function initPurchases(): Promise<void> {
  if (isInitialized) {
    return;
  }

  const apiKey = Platform.OS === 'android' ? REVENUECAT_API_KEY_ANDROID : REVENUECAT_API_KEY_IOS;
  if (!apiKey) {
    if (__DEV__) {
      console.log('[Purchases] No RevenueCat API key configured for platform:', Platform.OS);
    }
    return;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey });
    isInitialized = true;
  } catch (err) {
    console.error('[Purchases] Failed to configure RevenueCat:', err);
  }
}

/**
 * Purchases the Ad-Free lifetime package via RevenueCat / Google Play Billing.
 */
export async function purchaseAdFreePackage(): Promise<PurchaseResult> {
  if (!isInitialized) {
    await initPurchases();
  }

  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      const pkg = offerings.current.availablePackages[0];
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isAdFree = Boolean(customerInfo.entitlements.active[AD_CONFIG.entitlementId]);
      return { success: true, isAdFree };
    }
    return { success: false, isAdFree: false };
  } catch (err: unknown) {
    const errorObj = err as { userCancelled?: boolean };
    if (!errorObj?.userCancelled) {
      console.error('[Purchases] Purchase failed:', err);
    }
    return { success: false, isAdFree: false };
  }
}

/**
 * Restores previous purchases via RevenueCat.
 */
export async function restoreAdFreePurchases(): Promise<PurchaseResult> {
  if (!isInitialized) {
    await initPurchases();
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isAdFree = Boolean(customerInfo.entitlements.active[AD_CONFIG.entitlementId]);
    return { success: true, isAdFree };
  } catch (err) {
    console.error('[Purchases] Restore failed:', err);
    return { success: false, isAdFree: false };
  }
}

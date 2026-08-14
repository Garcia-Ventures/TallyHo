import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { trackEvent } from './analytics';

const API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ||
  (Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID
    : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS) ||
  'test_kHiPaoFakAarsAuCMHvjpgKjVPS';

let isInitialized = false;

export interface PurchaseResult {
  success: boolean;
  isPro: boolean;
  userCancelled?: boolean;
  error?: string;
  redirected?: boolean;
}

/**
 * Initializes RevenueCat SDK with the provided API key.
 */
export async function initPurchases(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey: API_KEY });
    isInitialized = true;

    // Listen to real-time customer info updates
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      checkProEntitlement(customerInfo);
    });

    if (__DEV__) {
      console.log('[RevenueCat] Initialized successfully with API Key:', API_KEY);
    }
  } catch (err) {
    console.error('[RevenueCat] Initialization failed:', err);
  }
}

/**
 * Checks if the customer info has active 'TallyHo Pro' (or 'pro') entitlement.
 */
export function checkProEntitlement(customerInfo: CustomerInfo): boolean {
  if (!customerInfo || !customerInfo.entitlements || !customerInfo.entitlements.active) {
    return false;
  }
  const activeEntitlements = customerInfo.entitlements.active;
  return Boolean(activeEntitlements['TallyHo Pro'] || activeEntitlements['pro']);
}

/**
 * Retrieves the current customer info from RevenueCat.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isInitialized) {
    await initPurchases();
  }
  try {
    return await Purchases.getCustomerInfo();
  } catch (err) {
    console.error('[RevenueCat] Failed to fetch CustomerInfo:', err);
    return null;
  }
}

/**
 * Retrieves configured offerings (Monthly, Yearly, Lifetime) from RevenueCat.
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (!isInitialized) {
    await initPurchases();
  }
  try {
    return await Purchases.getOfferings();
  } catch (err) {
    console.error('[RevenueCat] Failed to fetch Offerings:', err);
    return null;
  }
}

/**
 * Purchases a specific package (Monthly, Yearly, Lifetime) via RevenueCat.
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!isInitialized) {
    await initPurchases();
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = checkProEntitlement(customerInfo);
    trackEvent('purchase_success', { package: pkg.identifier, isPro });
    return { success: true, isPro };
  } catch (err: unknown) {
    const error = err as { code?: PURCHASES_ERROR_CODE; userCancelled?: boolean; message?: string };
    if (error.userCancelled || error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, isPro: false, userCancelled: true };
    }
    console.error('[RevenueCat] Purchase failed:', error);
    return { success: false, isPro: false, error: error.message || 'Purchase failed' };
  }
}

/**
 * Purchases a package tier by identifier ('lifetime' | 'yearly' | 'monthly').
 */
export async function purchasePackageByIdentifier(tier: 'lifetime' | 'yearly' | 'monthly'): Promise<PurchaseResult> {
  if (!isInitialized) {
    await initPurchases();
  }

  try {
    const offerings = await getOfferings();
    const current = offerings?.current;
    if (current) {
      let targetPkg: PurchasesPackage | undefined;
      if (tier === 'lifetime') {
        targetPkg = current.lifetime || current.availablePackages.find((p) => p.packageType === 'LIFETIME');
      } else if (tier === 'yearly') {
        targetPkg = current.annual || current.availablePackages.find((p) => p.packageType === 'ANNUAL');
      } else if (tier === 'monthly') {
        targetPkg = current.monthly || current.availablePackages.find((p) => p.packageType === 'MONTHLY');
      }

      if (!targetPkg && current.availablePackages.length > 0) {
        targetPkg = current.availablePackages[0];
      }

      if (targetPkg) {
        return await purchasePackage(targetPkg);
      }
    }
    return purchaseAdFreePackage();
  } catch (err: unknown) {
    const error = err as { message?: string };
    return { success: false, isPro: false, error: error.message || 'Purchase failed' };
  }
}

/**
 * Purchases the default Ad-Free lifetime package via RevenueCat.
 */
export async function purchaseAdFreePackage(): Promise<PurchaseResult> {
  if (!isInitialized) {
    await initPurchases();
  }

  try {
    const offerings = await getOfferings();
    if (offerings?.current?.availablePackages && offerings.current.availablePackages.length > 0) {
      const pkg = offerings.current.availablePackages[0];
      return await purchasePackage(pkg);
    }
    return { success: false, isPro: false, error: 'No offering packages available' };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return { success: false, isPro: false, error: error.message || 'Purchase failed' };
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
    const isPro = checkProEntitlement(customerInfo);
    trackEvent('purchases_restored', { isPro });
    return { success: true, isPro };
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error('[RevenueCat] Restore failed:', err);
    return { success: false, isPro: false, error: error.message || 'Restore failed' };
  }
}

/**
 * Presents RevenueCat Paywall UI modal if user does not have TallyHo Pro entitlement.
 */
export async function presentPaywall(): Promise<PurchaseResult> {
  if (!isInitialized) {
    await initPurchases();
  }

  try {
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: 'TallyHo Pro',
    });

    if (paywallResult === PAYWALL_RESULT.PURCHASED || paywallResult === PAYWALL_RESULT.RESTORED) {
      const customerInfo = await getCustomerInfo();
      const isPro = customerInfo ? checkProEntitlement(customerInfo) : true;
      return { success: true, isPro };
    }
    if (paywallResult === PAYWALL_RESULT.CANCELLED) {
      return { success: false, isPro: false, userCancelled: true };
    }
    return { success: false, isPro: false };
  } catch (err) {
    console.error('[RevenueCat] Paywall presentation failed:', err);
    return { success: false, isPro: false };
  }
}

/**
 * Presents RevenueCat Customer Center UI modal for subscription management & support.
 */
export async function presentCustomerCenter(): Promise<void> {
  if (!isInitialized) {
    await initPurchases();
  }

  try {
    await RevenueCatUI.presentCustomerCenter();
  } catch (err) {
    console.error('[RevenueCat] Customer Center presentation failed:', err);
  }
}

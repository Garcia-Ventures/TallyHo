import { Linking, Platform } from 'react-native';
import type { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import Purchases, { LOG_LEVEL, PURCHASES_ERROR_CODE } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

import { useSettingsStore } from '../stores/useSettingsStore';
import { logError, logInfo, logWarn } from '../utils/logger';
import { isExpectedBillingError } from '../utils/sentry';
import { trackEvent } from './analytics';
import { PRO_ENTITLEMENT_ID } from './purchases.constants';

let isInitialized = false;
/** Latches after a missing key or a failed configure so we do not call the native SDK again (TALLYHO-Y/Z). */
let configurationFailed = false;

function nonemptyEnv(value: string | undefined): string {
  return value?.trim() ?? '';
}

/** Reads the platform RevenueCat public SDK key. Blank keys must never reach Purchases.configure. */
function readNativeApiKey(): string {
  const platformKey =
    Platform.OS === 'android'
      ? nonemptyEnv(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID)
      : nonemptyEnv(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS);
  return platformKey || nonemptyEnv(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY);
}

function purchasesDisabledResult(): PurchaseResult {
  return { success: false, isPro: false, error: 'Purchases are unavailable right now.' };
}

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

/**
 * Configures RevenueCat once. Returns false when the SDK must not be called.
 * A blank API key throws an uncaught native IllegalArgumentException (TALLYHO-Y) and leaves no singleton, so the next
 * offerings fetch reports "no singleton instance" (TALLYHO-Z).
 */
async function ensureConfigured(): Promise<boolean> {
  if (isInitialized) {
    return true;
  }
  if (configurationFailed) {
    return false;
  }

  const apiKey = readNativeApiKey();
  if (!apiKey) {
    configurationFailed = true;
    logWarn('[RevenueCat] API key is not set. Purchases stay disabled.');
    return false;
  }

  try {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey });
    isInitialized = true;
    // Listen to real-time customer info updates and sync Pro grants to the store.
    // Grant-only: never auto-revoke here to avoid flapping on transient states.
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      if (checkProEntitlement(customerInfo)) {
        useSettingsStore.getState().purchaseRemoveAds();
      }
    });

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      logInfo('[RevenueCat] Initialized successfully');
    }
    return true;
  } catch (err) {
    // Do not retry. A native configure failure is not always a catchable JS exception, and calling again crashes.
    configurationFailed = true;
    if (isExpectedBillingError(err, { message: '[RevenueCat] Initialization failed:' })) {
      logInfo('[RevenueCat] Initialization skipped (expected store state)');
      return false;
    }
    logError('[RevenueCat] Initialization failed:', err);
    return false;
  }
}

/** Initializes RevenueCat SDK with the provided API key. */
export async function initPurchases(): Promise<void> {
  await ensureConfigured();
}

/** Checks if the customer info has the active TallyHo Pro entitlement. */
export function checkProEntitlement(customerInfo: CustomerInfo): boolean {
  if (!customerInfo || !customerInfo.entitlements || !customerInfo.entitlements.active) {
    return false;
  }
  return Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
}

/** Retrieves the current customer info from RevenueCat. */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!(await ensureConfigured())) {
    return null;
  }
  try {
    return await Purchases.getCustomerInfo();
  } catch (err) {
    if (isExpectedBillingError(err, { message: '[RevenueCat] Failed to fetch CustomerInfo:' })) {
      logInfo('[RevenueCat] CustomerInfo unavailable (expected store state)');
      return null;
    }
    logError('[RevenueCat] Failed to fetch CustomerInfo:', err);
    return null;
  }
}

/** Retrieves configured offerings (Monthly, Yearly, Lifetime) from RevenueCat. */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (!(await ensureConfigured())) {
    return null;
  }
  try {
    return await Purchases.getOfferings();
  } catch (err) {
    if (isExpectedBillingError(err, { message: '[RevenueCat] Failed to fetch Offerings:' })) {
      logInfo('[RevenueCat] Offerings unavailable (expected store state)');
      return null;
    }
    logError('[RevenueCat] Failed to fetch Offerings:', err);
    return null;
  }
}

/** Purchases a specific package (Monthly, Yearly, Lifetime) via RevenueCat. */
export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!(await ensureConfigured())) {
    return purchasesDisabledResult();
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
    if (isBillingNotAllowedError(error)) {
      logInfo('[RevenueCat] Purchase not allowed on this device (expected store state)');
      return {
        success: false,
        isPro: false,
        error: 'Purchases are not allowed on this device. Please check your store settings and try again.',
      };
    }
    if (isAlreadyOwnedError(error)) {
      // Play Store reports the product as already owned (e.g. an earlier
      // sandbox/test-track purchase is active on this account). Recover by
      // restoring — the entitlement check decides whether Pro is granted.
      logInfo('[RevenueCat] Product already owned, attempting restore for recovery');
      try {
        const customerInfo = await Purchases.restorePurchases();
        const isPro = checkProEntitlement(customerInfo);
        if (isPro) {
          trackEvent('purchase_recovered_via_restore', {});
          return { success: true, isPro };
        }
      } catch (restoreErr) {
        if (!isExpectedBillingError(restoreErr)) {
          logError('[RevenueCat] Recovery restore after already-owned failed:', restoreErr);
        }
      }
      return {
        success: false,
        isPro: false,
        alreadyOwned: true,
        error: 'This product is already active on your account. Use Restore below to unlock Pro.',
      };
    }
    if (isExpectedBillingError(error, { message: '[RevenueCat] Purchase failed:' })) {
      logInfo('[RevenueCat] Purchase ended in expected store state');
      return { success: false, isPro: false, error: error.message || 'Purchase failed' };
    }
    logError('[RevenueCat] Purchase failed:', error);
    return { success: false, isPro: false, error: error.message || 'Purchase failed' };
  }
}

/** Detects store already-owned errors by code or message across SDK versions. */
function isAlreadyOwnedError(error: { code?: unknown; message?: string }): boolean {
  if (error.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
    return true;
  }
  return /already (active|owned|purchased)/i.test(error.message || '');
}

/** Detects devices/users that are not allowed to make purchases (TALLYHO-Q). */
function isBillingNotAllowedError(error: { code?: unknown; message?: string }): boolean {
  const code = String(error.code ?? '').toUpperCase();
  if (
    code.includes('NOT_ALLOWED') ||
    code.includes('PAYMENT_NOT_ALLOWED') ||
    code.includes('BILLING_UNAVAILABLE') ||
    code.includes('PURCHASE_NOT_ALLOWED')
  ) {
    return true;
  }
  return /not allowed to make the purchase|purchase.?s? (are )?not allowed|billing (is )?unavailable/i.test(
    error.message || '',
  );
}

/** Purchases a package tier by identifier ('lifetime' | 'yearly' | 'monthly'). */
export async function purchasePackageByIdentifier(
  tier: 'lifetime' | 'yearly' | 'monthly',
  _email?: string,
): Promise<PurchaseResult> {
  if (!(await ensureConfigured())) {
    return purchasesDisabledResult();
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

/** Purchases the default Ad-Free lifetime package via RevenueCat. */
export async function purchaseAdFreePackage(): Promise<PurchaseResult> {
  if (!(await ensureConfigured())) {
    return purchasesDisabledResult();
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

/** Restores previous purchases via RevenueCat (Google Play Store receipt or cross-platform email lookup). */
export async function restoreAdFreePurchases(email?: string): Promise<PurchaseResult> {
  if (!(await ensureConfigured())) {
    return purchasesDisabledResult();
  }

  try {
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const { customerInfo } = await Purchases.logIn(cleanEmail);
      const isPro = checkProEntitlement(customerInfo);
      trackEvent('purchases_restored', { isPro, method: 'email' });
      return { success: true, isPro };
    }

    const customerInfo = await Purchases.restorePurchases();
    const isPro = checkProEntitlement(customerInfo);
    trackEvent('purchases_restored', { isPro, method: 'native_store' });

    if (!isPro) {
      return {
        success: false,
        isPro: false,
        needsEmail: true,
        error: 'No Google Play purchase found. If you purchased on Web/Stripe, please verify your billing email.',
      };
    }

    return { success: true, isPro };
  } catch (err: unknown) {
    const error = err as { message?: string };
    if (!isExpectedBillingError(err, { message: '[RevenueCat] Restore failed:' })) {
      logError('[RevenueCat] Restore failed:', err);
    } else {
      logInfo('[RevenueCat] Restore ended in expected store state');
    }
    return { success: false, isPro: false, error: error.message || 'Restore failed' };
  }
}

/** Presents RevenueCat Paywall UI modal if user does not have TallyHo Pro entitlement. */
export async function presentPaywall(): Promise<PurchaseResult> {
  if (!(await ensureConfigured())) {
    return purchasesDisabledResult();
  }

  try {
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: PRO_ENTITLEMENT_ID,
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
    if (!isExpectedBillingError(err, { message: '[RevenueCat] Paywall presentation failed:' })) {
      logError('[RevenueCat] Paywall presentation failed:', err);
    } else {
      logInfo('[RevenueCat] Paywall dismissed in expected store state');
    }
    return { success: false, isPro: false };
  }
}

/** Presents RevenueCat Customer Center UI modal for subscription management & support. */
export async function presentCustomerCenter(): Promise<boolean> {
  if (!(await ensureConfigured())) {
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    if (customerInfo?.managementURL) {
      await Linking.openURL(customerInfo.managementURL);
      return true;
    }
    await RevenueCatUI.presentCustomerCenter();
    return true;
  } catch (err) {
    if (isExpectedBillingError(err)) {
      logInfo('[RevenueCat] Customer Center unavailable (expected store state), falling back to store link');
    } else {
      logWarn('[RevenueCat] Customer Center presentation failed, falling back to store link:', err);
    }
    if (Platform.OS === 'android') {
      await Linking.openURL('https://play.google.com/store/account/subscriptions?package=com.gventureshq.tallyho');
      return true;
    } else if (Platform.OS === 'ios') {
      await Linking.openURL('https://apps.apple.com/account/subscriptions');
      return true;
    }
    return false;
  }
}

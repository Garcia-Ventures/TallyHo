import { PackageType, Purchases } from '@revenuecat/purchases-js';
import { trackEvent } from './analytics';
import type { PurchaseResult, PurchasesOffering, PurchasesOfferings, PurchasesPackage } from './purchases';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_WEB || 'rcb_sb_iVWzeNXHfGDfIlKMfeZSWDvZN';
export const ANONYMOUS_USER_STORAGE_KEY = 'tallyho_web_app_user_id';

let purchasesInstance: Purchases | null = null;

export function getAnonymousUserId(): string {
  if (typeof window === 'undefined') {
    return 'tallyho_web_anon';
  }
  const stored = localStorage.getItem(ANONYMOUS_USER_STORAGE_KEY);
  if (stored) {
    return stored;
  }
  const newId = `web_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  localStorage.setItem(ANONYMOUS_USER_STORAGE_KEY, newId);
  return newId;
}

export async function initPurchases(): Promise<Purchases | null> {
  if (purchasesInstance) {
    return purchasesInstance;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  if (!API_KEY) {
    console.warn('[Purchases Web] EXPO_PUBLIC_REVENUECAT_API_KEY_WEB is not set.');
    return null;
  }

  try {
    const userId = getAnonymousUserId();
    purchasesInstance = Purchases.configure(API_KEY, userId);
    return purchasesInstance;
  } catch (err) {
    console.error('[Purchases Web] Failed to configure RevenueCat Purchases JS:', err);
    return null;
  }
}

export async function getCustomerInfo() {
  const p = await initPurchases();
  if (!p) {
    return null;
  }
  try {
    return await p.getCustomerInfo();
  } catch (err) {
    console.error('[Purchases Web] Failed to fetch customer info:', err);
    return null;
  }
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  const p = await initPurchases();
  if (!p) {
    return null;
  }

  try {
    const rawOfferings = await p.getOfferings();
    const currentRaw = rawOfferings?.current;
    if (!currentRaw) {
      return null;
    }

    const availablePackages: PurchasesPackage[] = (currentRaw.availablePackages || []).map((pkg) => {
      const priceStr = pkg.rcBillingProduct?.currentPrice?.formattedPrice || '$4.99';
      return {
        identifier: pkg.identifier,
        packageType: pkg.packageType,
        product: {
          identifier: pkg.rcBillingProduct?.identifier || pkg.identifier,
          description: pkg.rcBillingProduct?.description || '',
          title: pkg.rcBillingProduct?.title || '',
          price: pkg.rcBillingProduct?.currentPrice?.amountMicros
            ? pkg.rcBillingProduct.currentPrice.amountMicros / 1000000
            : 4.99,
          priceString: priceStr,
          currencyCode: pkg.rcBillingProduct?.currentPrice?.currency || 'USD',
        },
      };
    });

    const lifetimePkg = availablePackages.find(
      (pkg) => pkg.identifier === '$rc_lifetime' || pkg.packageType === PackageType.Lifetime,
    );
    const annualPkg = availablePackages.find(
      (pkg) => pkg.identifier === '$rc_annual' || pkg.packageType === PackageType.Annual,
    );
    const monthlyPkg = availablePackages.find(
      (pkg) => pkg.identifier === '$rc_monthly' || pkg.packageType === PackageType.Monthly,
    );

    const mappedOffering: PurchasesOffering = {
      identifier: currentRaw.identifier,
      serverDescription: currentRaw.serverDescription || '',
      availablePackages,
      lifetime: lifetimePkg || null,
      annual: annualPkg || null,
      monthly: monthlyPkg || null,
    };

    return {
      all: { [currentRaw.identifier]: mappedOffering },
      current: mappedOffering,
    };
  } catch (err) {
    console.error('[Purchases Web] Failed to fetch offerings:', err);
    return null;
  }
}

export async function purchasePackageByIdentifier(
  tier: 'lifetime' | 'yearly' | 'monthly',
  email?: string,
): Promise<PurchaseResult> {
  const p = await initPurchases();
  if (!p) {
    return { success: false, isPro: false, error: 'Purchases could not be initialized' };
  }

  try {
    const cleanEmail = email?.trim().toLowerCase();
    if (cleanEmail) {
      await p.changeUser(cleanEmail);
      await p.setAttributes({ $email: cleanEmail });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ANONYMOUS_USER_STORAGE_KEY, cleanEmail);
      }
    }

    const rawOfferings = await p.getOfferings();
    const current = rawOfferings?.current;
    if (!current) {
      return { success: false, isPro: false, error: 'No offerings available.' };
    }

    let targetPkg = current.availablePackages.find((pkg) => {
      if (tier === 'lifetime') {
        return pkg.identifier === '$rc_lifetime' || pkg.packageType === PackageType.Lifetime;
      }
      if (tier === 'yearly') {
        return pkg.identifier === '$rc_annual' || pkg.packageType === PackageType.Annual;
      }
      if (tier === 'monthly') {
        return pkg.identifier === '$rc_monthly' || pkg.packageType === PackageType.Monthly;
      }
      return false;
    });

    if (!targetPkg && current.availablePackages.length > 0) {
      targetPkg = current.availablePackages[0];
    }

    if (!targetPkg) {
      return { success: false, isPro: false, error: `Package not found for tier: ${tier}` };
    }

    trackEvent('web_checkout_started', { tier, package: targetPkg.identifier, email: cleanEmail });

    const result = await p.purchase({
      rcPackage: targetPkg,
      ...(cleanEmail ? { customerEmail: cleanEmail } : {}),
    });

    const isPro = Boolean(
      result.customerInfo?.entitlements?.active?.['TallyHo Pro'] || result.customerInfo?.entitlements?.active?.pro,
    );

    if (isPro) {
      trackEvent('purchase_success', { tier, isPro: true, platform: 'web' });
      return { success: true, isPro: true };
    }

    return { success: false, isPro: false };
  } catch (err: unknown) {
    const error = err as { userCancelled?: boolean; message?: string };
    if (error.userCancelled) {
      trackEvent('purchase_cancelled', { tier, platform: 'web' });
      return { success: false, isPro: false, userCancelled: true };
    }
    console.error('[Purchases Web] Purchase failed:', err);
    return { success: false, isPro: false, error: error.message || 'Payment could not be completed.' };
  }
}

export async function purchasePackage(_pkg: unknown): Promise<PurchaseResult> {
  return purchasePackageByIdentifier('lifetime');
}

export async function purchaseAdFreePackage(): Promise<PurchaseResult> {
  return purchasePackageByIdentifier('lifetime');
}

export async function restoreAdFreePurchases(email?: string): Promise<PurchaseResult> {
  const p = await initPurchases();
  if (!p) {
    return { success: false, isPro: false, error: 'Purchases could not be initialized' };
  }

  try {
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      localStorage.setItem('tallyho_web_app_user_id', cleanEmail);
      await p.changeUser(cleanEmail);
      try {
        await p.setAttributes({ $email: cleanEmail });
      } catch {}
    }

    const customerInfo = await p.getCustomerInfo();
    const isPro = Boolean(
      customerInfo?.entitlements?.active?.['TallyHo Pro'] || customerInfo?.entitlements?.active?.pro,
    );

    if (isPro) {
      return { success: true, isPro: true };
    }

    return {
      success: false,
      isPro: false,
      needsEmail: !email,
      error: email
        ? `No active TallyHo Pro subscription found for ${email}.`
        : 'No prior purchases found on this browser session.',
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error('[Purchases Web] Failed to restore purchases:', err);
    return { success: false, isPro: false, error: error.message || 'Unable to restore purchases at this time.' };
  }
}

export async function presentPaywall(): Promise<PurchaseResult> {
  return purchasePackageByIdentifier('lifetime');
}

export async function presentCustomerCenter(): Promise<boolean> {
  const p = await initPurchases();
  if (!p) {
    return false;
  }

  try {
    const customerInfo = await p.getCustomerInfo();
    const managementUrl = customerInfo?.managementURL;
    if (managementUrl && typeof window !== 'undefined') {
      window.open(managementUrl, '_blank');
      return true;
    }

    const portalUrl = process.env.EXPO_PUBLIC_STRIPE_PORTAL_URL;
    if (portalUrl && typeof window !== 'undefined') {
      window.open(portalUrl, '_blank');
      return true;
    }

    return false;
  } catch (err) {
    console.error('[Purchases Web] Failed to open customer center:', err);
    return false;
  }
}

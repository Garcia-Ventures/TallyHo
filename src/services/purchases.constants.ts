/**
 * Canonical RevenueCat entitlement identifier for TallyHo Pro. Must match the Entitlements identifier in the RevenueCat
 * dashboard.
 *
 * Kept out of `purchases.ts` on purpose. Metro resolves `./purchases` to `purchases.web.ts` or `purchases.native.ts`,
 * so those files cannot import this constant from `./purchases` without a self-cycle that leaves the binding undefined.
 */
export const PRO_ENTITLEMENT_ID = 'TallyHo Pro';

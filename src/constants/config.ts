export interface AdContent {
  id: string;
  title: string;
  description: string;
  badge: string;
  actionText: string;
  linkUrl?: string;
}

export const AD_CONFIG = {
  // Enabled if explicitly set in env or running in __DEV__ mode
  showTestAds: process.env.EXPO_PUBLIC_SHOW_TEST_ADS !== 'false',

  // Product entitlements & product IDs
  productId: 'tallyho_ad_free_lifetime',
  entitlementId: 'pro',

  // House ad cards (self-hosted rotating ads)
  houseAds: [
    {
      id: 'house_ad_pro',
      title: '🎲 Support TallyHo & Go 100% Ad-Free',
      description: 'Unlock permanent ad-free status across all devices with a one-time $1.99 lifetime unlock!',
      badge: 'TALLYHO PRO',
      actionText: 'Unlock Ad-Free ($1.99)',
    },
    {
      id: 'house_ad_gventures',
      title: '✨ Discover More Game Night Tools',
      description:
        'Crafted with passion by GVTech. Enjoy clean, fast, privacy-focused scorekeepers with zero tracking.',
      badge: 'GVTECH GAMES',
      actionText: 'Learn More',
      linkUrl: 'https://gventureshq.com',
    },
  ] as AdContent[],

  adBlockerFallbackAd: {
    id: 'ad_blocker_fallback',
    title: '✨ Enjoying TallyHo?',
    description:
      'Notice: You are using an ad-blocker or offline mode. You can purchase the official ad-free version to support TallyHo!',
    badge: 'SUPPORT TALLYHO',
    actionText: 'Upgrade to Ad-Free ($1.99)',
  } as AdContent,
};

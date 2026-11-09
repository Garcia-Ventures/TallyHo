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

  // Product entitlements & product IDs (entitlement must match RevenueCat dashboard)
  productId: 'tallyho_ad_free_lifetime',
  entitlementId: 'TallyHo Pro',

  // House ads only. These promote Garcia Ventures properties.
  // External ad networks stay out until this catalog is the baseline rotation.
  // An ad with no linkUrl opens the TallyHo Pro purchase sheet.
  houseAds: [
    {
      id: 'house_ad_pro',
      title: '🎲 Support TallyHo & Go 100% Ad-Free',
      description: 'Unlock permanent ad-free status across all devices with a one-time $1.99 lifetime unlock!',
      badge: 'TALLYHO PRO',
      actionText: 'Unlock Ad-Free ($1.99)',
    },
    {
      id: 'house_ad_parable_bloom',
      title: '🌸 Play Parable Bloom',
      description:
        'A calm Christ-centered puzzle from Garcia Ventures. Slide vines through 500+ garden levels and meet Scripture along the way.',
      badge: 'PARABLE BLOOM',
      actionText: 'Play on the Web',
      linkUrl: 'https://parable-bloom.pages.dev/',
    },
    {
      id: 'house_ad_gventures',
      title: '✨ Garcia Ventures HQ',
      description:
        'TallyHo is one venture under the parent brand. See the studios, products, and experiments we are building.',
      badge: 'GARCIA VENTURES',
      actionText: 'Visit HQ',
      linkUrl: 'https://gventureshq.com',
    },
    {
      id: 'house_ad_gv_travel',
      title: '✈️ Plan a Trip with GV Travel',
      description:
        'Thoughtful family travel planning from Garcia Ventures. Curated cruises and itineraries, with less stress and clearer spending.',
      badge: 'GV TRAVEL',
      actionText: 'See GV Travel',
      linkUrl: 'https://gv-travel.com/',
    },
    {
      id: 'house_ad_gv_design',
      title: '🎨 The System Behind the App',
      description:
        'GV Tech Design is the shared design language for Garcia Ventures products, including TallyHo. Browse the live playground.',
      badge: 'GV TECH DESIGN',
      actionText: 'Open Playground',
      linkUrl: 'https://design.gventureshq.com',
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

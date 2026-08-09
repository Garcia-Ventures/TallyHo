export const AD_CONFIG = {
  // Enabled if explicitly set in env or running in __DEV__ mode
  showTestAds: process.env.EXPO_PUBLIC_SHOW_TEST_ADS !== 'false',
  defaultTestAd: {
    title: '🎲 TallyHo Pro & Game Night Essentials',
    description: '[TEST AD MODE] Support independent development and keep TallyHo free, or upgrade to remove ads!',
    badge: 'DEMO AD • DEV MODE',
    actionText: 'Remove Ads ($1.99)',
  },
  adBlockerFallbackAd: {
    title: '✨ Enjoying TallyHo?',
    description:
      'Notice: You are using an ad-blocker or offline mode. You can purchase the official ad-free version to support TallyHo!',
    badge: 'SUPPORT TALLYHO',
    actionText: 'Upgrade to Ad-Free ($1.99)',
  },
};

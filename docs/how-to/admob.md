# How to ship AdMob banners

Android shows a non-personalized Google AdMob banner on the home screen and the game-over sheet. iOS and web keep the house-ad card. Pro (`isAdFree`) and the ad-blocker toggle hide the network banner. A no-fill, a consent denial, or a missing production unit falls back to the house-ad rotation in `AD_CONFIG.houseAds`.

The scoring screen never mounts `AdBannerCard`.

## Android, already started

The AdMob account exists and the Android app is registered. Publisher line for `app-ads.txt`:

```text
google.com, pub-2441210659621996, DIRECT, f08c47fec0942fa0
```

That file is in two places:

- `public/app-ads.txt` in this repo, served at `https://tallyho.gventureshq.com/app-ads.txt` after the next web deploy.
- `public/app-ads.txt` in the `gventures-hq` repo, served at `https://gventureshq.com/app-ads.txt` after that site deploys.

AdMob crawls the **Website** field on the Play listing, not the privacy-policy URL. The public Play page for `com.gventureshq.tallyho` currently shows the privacy URL and no website. In Play Console, set Store listing contact details → Website to the host that already serves the file, with no path:

- `https://gventureshq.com` once that site is deployed, or
- `https://tallyho.gventureshq.com` once this app's web export is deployed.

The value must match the host character for character. Then in AdMob, run the app-ads.txt crawl.

Still required in AdMob before a production binary:

1. Copy the Android **App ID** (`ca-app-pub-2441210659621996~…`, tilde). This is not the publisher ID.
2. Create one **banner** ad unit and copy its ID (`ca-app-pub-…/…`, slash). Home and game-over share it.
3. In Privacy & messaging, add a GDPR / UK message for the Android app. The app calls `AdsConsent.gatherConsent()` before the first request and only loads an ad when `canRequestAds` is true. A denial or a form error shows a house ad.
4. Do not turn on child-directed treatment. TallyHo is a general-audience scorekeeper.

Put the two IDs on the Expo **production** environment (same place as the RevenueCat Android key):

- `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`
- `EXPO_PUBLIC_ADMOB_BANNER_ANDROID`

`eas.json` sets `EXPO_PUBLIC_SHOW_TEST_ADS=true` for development and preview, and `false` for production. Test builds always embed Google's demo App ID and demo banner unit. A production config with the demo App ID, or with no App ID, throws during `expo` config evaluation so the binary cannot ship the demo ID.

The banner unit is JavaScript. If it is missing in production, the app shows house ads and does not call AdMob. The App ID is native. Changing it needs a new Play binary. `app.json` uses `runtimeVersion.policy: appVersion`, so that binary is also a version bump. Expo Go cannot load the SDK.

Development and preview builds must be new EAS binaries (or a local prebuild) after this change. `android/` and `ios/` are gitignored. EAS runs prebuild from `app.config.ts`.

The plugin strips `com.google.android.gms.permission.AD_ID`, delays app measurement until consent, and keeps the UMP consent classes in Proguard. Requests set `requestNonPersonalizedAdsOnly: true`. There is no `NSUserTrackingUsageDescription` and no App Tracking Transparency prompt.

OpenPanel records a network impression as `ad_impression` with `adId: admob_banner`. A tap is `ad_click`. The advertising ID and the creative are not sent.

## iOS, when an Apple Developer account exists

Do this only after the account is active. Do not submit an iOS binary that still contains Google's sample App ID.

1. In AdMob, add an iOS app with bundle ID `com.gventureshq.tallyho`. Copy its App ID (`ca-app-pub-…~…`).
2. Create one iOS banner ad unit. Copy the unit ID (`ca-app-pub-…/…`).
3. Set `EXPO_PUBLIC_ADMOB_IOS_APP_ID` on the Expo production environment. `resolveIosAppId` in `src/constants/admob.ts` uses that value. Until then the Expo plugin writes Google's sample iOS App ID (`ca-app-pub-3940256099942544~1458002511`) so prebuild has a placeholder. A store binary must not keep the sample ID.
4. Add `EXPO_PUBLIC_ADMOB_BANNER_IOS` the same way as the Android unit, and teach `resolveAndroidBannerUnitId`'s sibling to return it only when `EXPO_PUBLIC_SHOW_TEST_ADS` is `false`.
5. Allow the slot on iOS. Today only `NativeAdSlot.android.tsx` loads the SDK. iOS resolves `NativeAdSlot.tsx`, which is a no-op, so a house ad shows. Point iOS at the same consent and banner path: `AdsConsent.gatherConsent()`, `mobileAds().initialize()` only after `canRequestAds`, and `requestNonPersonalizedAdsOnly: true`.
6. Keep `delayAppMeasurementInit: true`. Do not set `userTrackingUsageDescription`. Do not call the tracking prompt. Refresh `skAdNetworkItems` from the [Google SKAdNetwork list](https://developers.google.com/admob/ios/3p-skadnetworks) when you are ready to attribute installs. Those IDs are not required to show a non-personalized banner, and this app does not add them yet.
7. Rebuild an iOS binary. The SDK does not ride along in an EAS Update.
8. In App Store Connect, declare third-party ads in the age rating, stay out of the Kids category, and fill App Privacy from [Google's SDK disclosure](https://developers.google.com/admob/ios/privacy). Do not mark the data as used to track the user while IDFA stays off. Point the privacy URL at the republished policy (version 1.3.0 or later).
9. Publish the same `app-ads.txt` line on the website listed in App Store Connect. One file on `gventureshq.com` covers both stores when both listings use that host.

## Web

Do not add AdMob or AdSense to the Expo web app. Web keeps house ads.

## Store forms that ship with the Android binary

Use [Google's Mobile Ads SDK Play data disclosure](https://developers.google.com/admob/android/privacy/play-data-disclosure).

- Play ads declaration: the app contains ads.
- Data safety: add the device data Google's sheet lists. Do not declare the Advertising ID while `AD_ID` stays blocked.
- Content rating: answer the advertising questions. Do not enroll the app as Designed for Families.
- The live Play description still says the app has no ads. Replace that sentence before the binary is reviewed. The scoring table stays free of banners. Suggested line: "Home and game-over may show a small banner. The score table does not. TallyHo Pro removes ads."
- Republish `https://tallyho.gventureshq.com/privacy` so it matches in-app policy version 1.3.0. The store privacy URL must match the binary.

## Checks

- `bun test src/constants/admob.test.ts src/components/AdBannerCard.test.tsx`
- On a device, a development build shows Google's **Test Ad** label on home and game over, nothing on the score table, a house card when the ad fails, nothing for Pro, and the house fallback when the ad-blocker toggle is on.
- Do not click your own live ads. Test ads are safe to click.

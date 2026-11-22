import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import mobileAds, { AdsConsent, BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { trackEvent } from '../services/analytics';
import type { NativeAdSlotProps } from './adBannerPlacement';

export const nativeAdsSupported = true;

const NETWORK_AD_ID = 'admob_banner';

let preparePromise: Promise<boolean> | null = null;

/** Consent first, then one SDK init. A denial or a form error never requests an ad. */
function prepareNonPersonalizedAds(): Promise<boolean> {
  if (!preparePromise) {
    preparePromise = (async () => {
      try {
        await AdsConsent.gatherConsent();
        const info = await AdsConsent.getConsentInfo();
        if (!info.canRequestAds) {
          return false;
        }
        await mobileAds().initialize();
        return true;
      } catch {
        return false;
      }
    })().then((ok) => {
      if (!ok) {
        preparePromise = null;
      }
      return ok;
    });
  }
  return preparePromise;
}

export function NativeAdSlot({ unitId, placement, onUnavailable }: NativeAdSlotProps) {
  const [ready, setReady] = useState(false);
  const [width, setWidth] = useState(0);
  const impressionTracked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void prepareNonPersonalizedAds().then((ok) => {
      if (cancelled) {
        return;
      }
      if (!ok) {
        onUnavailable();
        return;
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [onUnavailable]);

  const trackImpression = () => {
    if (impressionTracked.current) {
      return;
    }
    impressionTracked.current = true;
    trackEvent('ad_impression', { adId: NETWORK_AD_ID, placement, badge: 'AD' });
  };

  return (
    <View
      className="w-full items-center"
      onLayout={(event) => {
        const next = Math.floor(event.nativeEvent.layout.width);
        if (next > 0 && next !== width) {
          setWidth(next);
        }
      }}
    >
      {ready && width > 0 ? (
        <BannerAd
          unitId={unitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          width={width}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={trackImpression}
          onAdImpression={trackImpression}
          onAdClicked={() => {
            trackEvent('ad_click', {
              adId: NETWORK_AD_ID,
              placement,
              badge: 'AD',
              hasExternalLink: true,
            });
          }}
          onAdFailedToLoad={() => onUnavailable()}
        />
      ) : null}
    </View>
  );
}

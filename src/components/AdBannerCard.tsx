import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import { ExternalLink, Megaphone, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import { PALETTE } from '../constants/colors';
import { AD_CONFIG, AdContent } from '../constants/config';
import { trackEvent } from '../services/analytics';
import { useSettingsStore } from '../stores/useSettingsStore';
import { RemoveAdsModal } from './RemoveAdsModal';

interface AdBannerCardProps {
  placement?: 'home' | 'game-over' | 'settings';
  className?: string;
}

export function AdBannerCard({ placement = 'home', className = '' }: AdBannerCardProps) {
  const { settings } = useSettingsStore();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [adContent, setAdContent] = useState<AdContent>(AD_CONFIG.houseAds[0]);

  // Select ad content on mount & track impression
  useEffect(() => {
    if (settings.isAdFree) {
      return;
    }

    const selectedAd = settings.isAdBlocked
      ? AD_CONFIG.adBlockerFallbackAd
      : AD_CONFIG.houseAds[Math.floor(Math.random() * AD_CONFIG.houseAds.length)];

    setAdContent(selectedAd);

    // Track OpenPanel ad impression
    trackEvent('ad_impression', {
      adId: selectedAd.id,
      placement,
      badge: selectedAd.badge,
    });
  }, [placement, settings.isAdBlocked, settings.isAdFree]);

  // If user has purchased Ad-Free, do NOT render ads anywhere
  if (settings.isAdFree) {
    return null;
  }

  const handleAction = () => {
    // Track OpenPanel ad click
    trackEvent('ad_click', {
      adId: adContent.id,
      placement,
      badge: adContent.badge,
      hasExternalLink: Boolean(adContent.linkUrl),
    });

    if (adContent.linkUrl) {
      Linking.openURL(adContent.linkUrl);
    } else {
      setIsUpgradeModalOpen(true);
    }
  };

  const isFallback = settings.isAdBlocked;

  return (
    <View className={className}>
      <Card className="border-border bg-card rounded-2xl border p-5 shadow-xs">
        <CardContent className="gap-3.5 p-0">
          <View className="flex-row items-center justify-between">
            <Badge
              variant="secondary"
              className={isFallback ? 'bg-chip-purple/20 px-2.5 py-0.5' : 'bg-chip-mustard/20 px-2.5 py-0.5'}
            >
              <Text
                className={`text-[9px] font-black tracking-wider uppercase ${
                  isFallback ? 'text-chip-purple' : 'text-chip-mustard'
                }`}
              >
                {adContent.badge}
              </Text>
            </Badge>

            <Text className="text-muted-foreground text-[10px] font-medium">Supports Free TallyHo</Text>
          </View>

          <View className="flex-row items-start gap-3">
            <View className="bg-chip-mustard/15 mt-0.5 h-9 w-9 items-center justify-center rounded-xl">
              {isFallback ? (
                <Megaphone size={18} color={PALETTE.chip.purple} />
              ) : adContent.linkUrl ? (
                <ExternalLink size={18} color={PALETTE.chip.mustard} />
              ) : (
                <Sparkles size={18} color={PALETTE.chip.mustard} />
              )}
            </View>

            <View className="flex-1 gap-1">
              <Text className="text-foreground text-sm font-black">{adContent.title}</Text>
              <Text className="text-muted-foreground text-xs leading-relaxed font-medium">{adContent.description}</Text>
            </View>
          </View>

          <Button
            onPress={handleAction}
            variant="outline"
            className="border-chip-mustard/40 bg-chip-mustard/10 h-10 w-full items-center justify-center rounded-xl"
          >
            <Text className="text-chip-mustard text-xs font-black">{adContent.actionText}</Text>
          </Button>
        </CardContent>
      </Card>

      <RemoveAdsModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </View>
  );
}

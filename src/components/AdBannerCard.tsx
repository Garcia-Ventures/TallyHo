import { Badge, Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import { Megaphone, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { PALETTE } from '../constants/colors';
import { AD_CONFIG } from '../constants/config';
import { useSettingsStore } from '../stores/useSettingsStore';
import { RemoveAdsModal } from './RemoveAdsModal';

interface AdBannerCardProps {
  placement?: 'home' | 'game-over' | 'settings';
  className?: string;
}

export function AdBannerCard({ placement = 'home', className = '' }: AdBannerCardProps) {
  const { settings } = useSettingsStore();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // If user has purchased Ad-Free, do NOT render ads anywhere
  if (settings.isAdFree) {
    return null;
  }

  // Determine if ad-blocker fallback is active
  const isFallback = settings.isAdBlocked;
  const adContent = isFallback ? AD_CONFIG.adBlockerFallbackAd : AD_CONFIG.defaultTestAd;

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
            onPress={() => setIsUpgradeModalOpen(true)}
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

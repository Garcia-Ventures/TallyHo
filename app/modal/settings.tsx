import { Text } from '@gv-tech/ui-native';
import { useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, ScrollView, useColorScheme, View } from 'react-native';

import logoHorizontalDark from '../../assets/logo-horizontal-dark.png';
import logoHorizontal from '../../assets/logo-horizontal.png';
import { RemoveAdsModal } from '../../src/components/RemoveAdsModal';
import { RestorePurchaseModal } from '../../src/components/RestorePurchaseModal';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { SettingsAppearanceSection } from '../../src/components/settings/SettingsAppearanceSection';
import { SettingsDataSection } from '../../src/components/settings/SettingsDataSection';
import { SettingsFeedbackSection } from '../../src/components/settings/SettingsFeedbackSection';
import { SettingsPurchasesSection } from '../../src/components/settings/SettingsPurchasesSection';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { getAppVersionLabel } from '../../src/utils/appInfo';

export default function SettingsModal() {
  const themeMode = useSettingsStore((state) => state.settings.themeMode);
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const [isRemoveAdsModalOpen, setIsRemoveAdsModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
        <SettingsPurchasesSection
          onUpgrade={() => setIsRemoveAdsModalOpen(true)}
          onNeedsEmail={() => setIsRestoreModalOpen(true)}
        />
        <SettingsAppearanceSection />
        <SettingsFeedbackSection />
        <SettingsDataSection />

        <View className="items-center justify-center gap-2 pt-2 pb-6">
          <Image
            source={(isDark ? logoHorizontalDark : logoHorizontal) as ImageSourcePropType}
            style={{ width: 140, height: 40 }}
            resizeMode="contain"
            accessibilityLabel="TallyHo Logo"
          />
          <Text className="text-muted-foreground text-center text-xs font-semibold">
            {`TallyHo ${getAppVersionLabel()} • Crafted by Garcia Ventures`}
          </Text>
        </View>
      </ScrollView>

      <RemoveAdsModal isOpen={isRemoveAdsModalOpen} onClose={() => setIsRemoveAdsModalOpen(false)} />
      <RestorePurchaseModal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)} />
    </ScreenContainer>
  );
}

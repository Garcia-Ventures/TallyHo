export type AdBannerPlacement = 'home' | 'game-over' | 'settings';

export interface NativeAdSlotProps {
  unitId: string;
  placement: AdBannerPlacement;
  onUnavailable: () => void;
}

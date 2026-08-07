import React from 'react';
import { ScrollView, View } from 'react-native';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

export type ScreenMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
export type ScreenPadding = 'none' | 'sm' | 'normal' | 'large';

export interface ScreenContainerProps {
  children: React.ReactNode;
  maxWidth?: ScreenMaxWidth;
  padding?: ScreenPadding;
  scrollable?: boolean;
  className?: string;
  contentClassName?: string;
}

const MAX_WIDTH_MAP: Record<ScreenMaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  full: 'w-full',
};

const PADDING_MAP: Record<ScreenPadding, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  normal: 'p-5 sm:p-8',
  large: 'p-6 sm:p-10',
};

/**
 * ScreenContainer provides consistent max-width capping, horizontal centering,
 * responsive padding, and optional scrollable behavior across all app screens and modals.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  maxWidth = '4xl',
  padding = 'normal',
  scrollable = true,
  className,
  contentClassName,
}) => {
  const maxWidthClass = MAX_WIDTH_MAP[maxWidth] || 'max-w-4xl';
  const paddingClass = PADDING_MAP[padding] || 'p-5 sm:p-8';

  const innerContent = (
    <View className={cn('mx-auto w-full', maxWidthClass, paddingClass, contentClassName)}>{children}</View>
  );

  if (scrollable) {
    return (
      <ScrollView
        className={cn('bg-background flex-1', className)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 48 }}
      >
        {innerContent}
      </ScrollView>
    );
  }

  return <View className={cn('bg-background flex-1 items-center', className)}>{innerContent}</View>;
};

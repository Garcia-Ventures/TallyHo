import React from 'react';
import { ScrollView, View } from 'react-native';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

export type ScreenMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
export type ScreenPadding = 'none' | 'sm' | 'normal' | 'large';

export interface ScreenContainerProps {
  children: React.ReactNode;
  header?: React.ReactNode;
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
 * responsive padding, full-width headers, and optional scrollable behavior across all app screens and modals.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  header,
  maxWidth = '4xl',
  padding = 'normal',
  scrollable = true,
  className,
  contentClassName,
}) => {
  const maxWidthClass = MAX_WIDTH_MAP[maxWidth] || 'max-w-4xl';
  const paddingClass = PADDING_MAP[padding] || 'p-5 sm:p-8';

  const headerElement = header ? (
    <View className="border-border bg-card w-full border-b">
      <View className={cn('mx-auto w-full px-5 py-4 sm:px-8', maxWidthClass)}>{header}</View>
    </View>
  ) : null;

  const innerContent = (
    <View className={cn('mx-auto w-full', maxWidthClass, paddingClass, contentClassName)}>{children}</View>
  );

  if (scrollable) {
    return (
      <View className={cn('bg-background flex-1', className)}>
        {headerElement}
        <ScrollView
          className="w-full flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 }}
        >
          {innerContent}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className={cn('bg-background flex-1', className)}>
      {headerElement}
      <View className="flex-1 items-center">{innerContent}</View>
    </View>
  );
};

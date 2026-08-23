import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  ScrollView: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}));

import { ScreenContainer } from './ScreenContainer';

describe('ScreenContainer Component', () => {
  it('renders children with default scrollable layout and padding', () => {
    const html = renderToString(
      <ScreenContainer maxWidth="2xl" padding="normal">
        <div>Inner Content</div>
      </ScreenContainer>,
    );

    expect(html).toContain('Inner Content');
    expect(html).toContain('max-w-2xl');
  });

  it('renders header when header prop is provided', () => {
    const html = renderToString(
      <ScreenContainer header={<div>Custom Header Bar</div>}>
        <div>Main Area</div>
      </ScreenContainer>,
    );

    expect(html).toContain('Custom Header Bar');
    expect(html).toContain('Main Area');
  });

  it('renders non-scrollable layout when scrollable is false', () => {
    const html = renderToString(
      <ScreenContainer scrollable={false}>
        <div>Static View</div>
      </ScreenContainer>,
    );

    expect(html).toContain('Static View');
  });
});

import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  Image: ({ ...props }: React.ComponentProps<'img'>) => <img {...props} />,
  useColorScheme: () => 'light',
}));

import { CustomHeader } from './CustomHeader';

describe('CustomHeader Component', () => {
  it('renders web header with logo on home route', () => {
    const html = renderToString(<CustomHeader options={{ title: 'Home' }} route={{ name: 'index' }} />);

    expect(html).toContain('TallyHo Logo');
  });

  it('renders web header with custom title on inner screen route', () => {
    const html = renderToString(<CustomHeader options={{ title: 'Game Match #42' }} route={{ name: 'match' }} />);

    expect(html).toContain('Game Match #42');
  });
});

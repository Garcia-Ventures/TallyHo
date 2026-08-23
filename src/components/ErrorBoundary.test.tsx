import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@gv-tech/ui-native', () => ({
  Button: ({ children, onPress, ...props }: React.ComponentProps<'button'> & { onPress?: () => void }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
}));

vi.mock('react-native', () => ({
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
}));

vi.mock('../utils/sentry', () => ({
  captureException: vi.fn(),
}));

import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary Component', () => {
  it('renders children when no error occurs', () => {
    const html = renderToString(
      <ErrorBoundary>
        <div>Normal Content</div>
      </ErrorBoundary>,
    );

    expect(html).toContain('Normal Content');
  });

  it('renders fallback UI when an error is caught in state', () => {
    const boundary = new ErrorBoundary({ children: <div>Normal</div> });
    boundary.state = { hasError: true, error: new Error('Simulated crash') };

    const rendered = boundary.render();
    const html = renderToString(rendered as React.ReactElement);

    expect(html).toContain('Oops! Something went wrong');
    expect(html).toContain('Try Again');
  });

  it('renders custom fallback element when provided in props', () => {
    const boundary = new ErrorBoundary({
      children: <div>Normal</div>,
      fallback: <div>Custom Crash View</div>,
    });
    boundary.state = { hasError: true, error: new Error('Simulated crash') };

    const rendered = boundary.render();
    const html = renderToString(rendered as React.ReactElement);

    expect(html).toContain('Custom Crash View');
  });

  it('updates state via getDerivedStateFromError and logs to sentry via componentDidCatch', async () => {
    const { captureException } = await import('../utils/sentry');
    const err = new Error('State error');
    const derived = ErrorBoundary.getDerivedStateFromError(err);
    expect(derived.hasError).toBe(true);
    expect(derived.error).toBe(err);

    const boundary = new ErrorBoundary({ children: <div>Normal</div> });
    boundary.componentDidCatch(err, { componentStack: 'MockStack' });
    expect(captureException).toHaveBeenCalledWith(err, { componentStack: 'MockStack' });
  });
});

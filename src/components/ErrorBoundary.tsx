import { Button, Card, CardContent, Text } from '@gv-tech/ui-native';
import { Component, ErrorInfo, ReactNode } from 'react';
import { View } from 'react-native';
import { captureException } from '../utils/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    captureException(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="will-change-variable bg-background flex-1 items-center justify-center p-6">
          <Card className="border-border bg-card w-full max-w-md p-6 shadow-md">
            <CardContent className="items-center gap-4 text-center">
              <Text className="text-4xl">⚠️</Text>
              <Text className="text-foreground text-xl font-black">Oops! Something went wrong</Text>
              <Text className="text-muted-foreground text-center text-sm leading-relaxed">
                Tally Ho encountered an unexpected error. Don't worry—your active game score data is safely saved on
                your device.
              </Text>

              <Button onPress={this.handleReset} className="bg-primary mt-2 w-full rounded-xl py-3">
                <Text className="text-primary-foreground text-sm font-black">Try Again</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

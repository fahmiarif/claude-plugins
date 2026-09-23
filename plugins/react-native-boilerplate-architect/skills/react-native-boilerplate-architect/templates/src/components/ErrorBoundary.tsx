import React, { Component, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Optional crash reporter hook — called once per caught render error,
   * before the fallback UI renders. Left undefined by default so this
   * component has no hard dependency on Sentry/Crashlytics/etc (pick one
   * per reference/LIBRARIES.md's "Crash reporting" row, don't run both).
   * Wire it once a crash reporter is installed, e.g.
   * `onError={(error, info) => Sentry.captureException(error, { extra: info })}`
   * — see SKILL.md's "Optional patterns" → "Crash reporting hook".
   */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Wraps the app (see app/_layout.tsx) so a render error anywhere in the
 * tree shows a recoverable screen instead of a blank/crashed app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, info);
    this.props.onError?.(error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Terjadi kesalahan</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Button label="Coba lagi" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    color: '#6b7280',
    textAlign: 'center',
  },
});

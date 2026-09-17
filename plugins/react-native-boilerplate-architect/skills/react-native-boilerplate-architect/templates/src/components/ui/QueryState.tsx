import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export interface QueryStateProps<T> {
  isLoading: boolean;
  isError: boolean;
  data: T[] | undefined;
  children: (data: T[]) => ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

/**
 * Wraps a React Query list result so every screen handles loading/error/
 * empty the same way instead of ad-hoc `if (isLoading) return ...` per
 * screen. Not a full-screen blocking spinner — swap the loading branch for
 * a skeleton component once the design system has one.
 */
export function QueryState<T>({
  isLoading,
  isError,
  data,
  children,
  emptyMessage = 'Belum ada data.',
  errorMessage = 'Gagal memuat data.',
  onRetry,
}: QueryStateProps<T>) {
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{errorMessage}</Text>
        {onRetry && (
          <Text style={styles.retry} onPress={onRetry}>
            Coba lagi
          </Text>
        )}
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{emptyMessage}</Text>
      </View>
    );
  }

  return <>{children(data)}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  message: {
    color: '#6b7280',
    textAlign: 'center',
  },
  retry: {
    color: '#2563eb',
    fontWeight: '600',
  },
});

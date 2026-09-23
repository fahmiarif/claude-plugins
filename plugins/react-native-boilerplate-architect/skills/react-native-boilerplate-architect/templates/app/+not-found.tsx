import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/hooks/useTheme';

/**
 * Expo Router's reserved not-found convention file — renders whenever a URL
 * or deep link doesn't match any route. Without this file, an unmatched
 * route falls back to Expo Router's default unstyled 404 instead of the
 * app's own design system.
 */
export default function NotFoundScreen() {
  const { colors, spacing, typography } = useTheme();

  const handleGoHome = useCallback(() => {
    // replace, not push — an unmatched route shouldn't stay in the back stack.
    router.replace('/(tabs)');
  }, []);

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={[typography.heading, { color: colors.text }]}>Halaman tidak ditemukan</Text>
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
          Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
        </Text>
      </View>
      <Button label="Kembali ke Beranda" onPress={handleGoHome} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});

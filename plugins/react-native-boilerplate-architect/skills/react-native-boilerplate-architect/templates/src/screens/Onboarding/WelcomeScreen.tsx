import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/hooks/useTheme';

/**
 * First screen after the splash — pure branding, no logic beyond
 * navigating into the onboarding carousel. Keep this static; feature
 * highlights belong in `OnboardingScreen`, not here.
 */
export const WelcomeScreen = () => {
  const { colors, spacing, typography } = useTheme();

  const handleContinue = useCallback(() => {
    router.push('/(onboarding)/onboarding');
  }, []);

  return (
    <Screen>
      <View style={styles.body}>
        {/* Swap for the real logo/illustration asset once the app has one. */}
        <View style={[styles.logoPlaceholder, { backgroundColor: colors.surface }]} />
        <Text style={[typography.heading, { color: colors.text, marginTop: spacing.lg }]}>Nama Aplikasi</Text>
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>
          Tagline singkat yang menjelaskan value aplikasi ini.
        </Text>
      </View>
      <Button label="Mulai" onPress={handleContinue} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
});

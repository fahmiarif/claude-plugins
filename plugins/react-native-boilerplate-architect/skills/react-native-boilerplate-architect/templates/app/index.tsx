import { Redirect } from 'expo-router';
import React from 'react';

import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Boot-time router — decides the first screen from onboarding/auth state
 * instead of hardcoding one. By the time this renders, the root layout has
 * already held the splash screen until BOTH persisted stores rehydrated
 * (see app/_layout.tsx), so `hasSeenOnboarding`/`isAuthenticated` here are
 * the real stored values, not their defaults.
 */
export default function Index() {
  const hasSeenOnboarding = useAppPreferencesStore((state) => state.hasSeenOnboarding);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!hasSeenOnboarding) return <Redirect href="/(onboarding)/welcome" />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}

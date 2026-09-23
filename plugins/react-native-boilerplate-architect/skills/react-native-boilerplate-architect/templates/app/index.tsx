import { Redirect } from 'expo-router';
import React from 'react';

import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';

/**
 * Boot-time router — decides the first screen from onboarding/auth state
 * instead of hardcoding one. By the time this renders, the root layout has
 * already held the splash screen until the persisted store rehydrated, so
 * `hasSeenOnboarding` here is the real stored value, not the default.
 */
export default function Index() {
  const hasSeenOnboarding = useAppPreferencesStore((state) => state.hasSeenOnboarding);

  // TODO: replace with a real session check once an auth hook exists — see
  // SKILL.md step 4, don't wire the authenticated/unauthenticated branch
  // speculatively before there's an actual session to check.
  const isAuthenticated = false;

  if (!hasSeenOnboarding) return <Redirect href="/(onboarding)/welcome" />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { queryClient } from '@/services/queryClient';
import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';
import { useAuthStore } from '@/store/useAuthStore';

// Module scope, not inside the component — must run before first render so
// the native splash screen never auto-hides before we're ready to decide
// what's behind it.
SplashScreen.preventAutoHideAsync();

/**
 * Root layout — this is the file-based-routing equivalent of a manual
 * RootNavigator. Route groups below (onboarding, auth, tabs, modals) do the
 * job a hand-rolled OnboardingStack/AuthStack/MainTabs split would do in
 * React Navigation, without a separate navigation config file to keep in
 * sync with /app.
 *
 * This is also the ONE place providers get composed — GestureHandler and
 * SafeArea must wrap everything (gestures/insets break otherwise),
 * QueryClientProvider must wrap every screen that fetches data, and the
 * Toast root must render above the navigator so it can appear over any
 * screen. Forgetting one of these here is a common "why doesn't X work"
 * bug in a fresh Expo Router app.
 *
 * The splash screen is held (not just shown at launch) until BOTH
 * persisted stores finish rehydrating from AsyncStorage —
 * `useAppPreferencesStore` (onboarding) and `useAuthStore` (session).
 * Without this, `app/index.tsx` would briefly read the *default* value of
 * whichever store hasn't hydrated yet (`hasSeenOnboarding: false` or
 * `isAuthenticated: false`) before the persisted value loads, flashing the
 * onboarding flow or the login screen at a returning user for one frame.
 */
export default function RootLayout() {
  const prefsHydrated = useAppPreferencesStore((state) => state.hasHydrated);
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const hasHydrated = prefsHydrated && authHydrated;

  useEffect(() => {
    if (hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [hasHydrated]);

  if (!hasHydrated) {
    // Native splash screen is still covering the app — render nothing behind it.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
            </Stack>
          </ErrorBoundary>
          <Toast />
          <OfflineBanner />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

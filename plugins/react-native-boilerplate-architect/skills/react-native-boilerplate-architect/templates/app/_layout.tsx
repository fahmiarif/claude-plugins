import { Stack } from 'expo-router';
import React from 'react';

/**
 * Root layout — this is the file-based-routing equivalent of a manual
 * RootNavigator. Route groups below (auth, tabs, modals) do the job a
 * hand-rolled AuthStack/MainTabs split would do in React Navigation,
 * without a separate navigation config file to keep in sync with /app.
 */
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

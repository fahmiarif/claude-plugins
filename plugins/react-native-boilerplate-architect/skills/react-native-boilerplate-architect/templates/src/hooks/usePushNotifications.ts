import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { registerPushToken } from '@/services/api/pushNotifications';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Optional pattern — NOT wired into app/_layout.tsx by default
 * (expo-notifications is supplementary per reference/LIBRARIES.md). Copy
 * this file + services/api/pushNotifications.ts and call the hook once
 * from the root layout only after `npx expo install expo-notifications`
 * and once there's a real backend endpoint to register tokens against.
 *
 * Requests permission, registers the Expo push token to the backend once
 * authenticated, and wires the two listeners every push integration
 * needs: foreground arrival and tap-to-navigate (deep link via
 * expo-router's `router`).
 */
export function usePushNotifications() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const register = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

      await registerPushToken({
        expoPushToken,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        appVersion: Constants.expoConfig?.version,
      }).catch(() => {
        // Registration failure shouldn't block app usage — retry on next mount.
      });
    };

    register();
  }, [isAuthenticated]);

  useEffect(() => {
    const tapSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route;
      if (typeof route === 'string') {
        router.push(route as never);
      }
    });

    const foregroundSubscription = Notifications.addNotificationReceivedListener(() => {
      // Surface via the app's existing Toast root if desired — left as a
      // no-op here so this file has no hard dependency on Toast content.
    });

    return () => {
      tapSubscription.remove();
      foregroundSubscription.remove();
    };
  }, []);
}

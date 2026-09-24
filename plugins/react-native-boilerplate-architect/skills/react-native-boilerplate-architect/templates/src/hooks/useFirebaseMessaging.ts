import notifee, { AndroidImportance } from '@notifee/react-native';
import { getMessaging, getToken, onMessage, onTokenRefresh } from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';

const DEFAULT_CHANNEL_ID = 'default';

async function ensureDefaultChannel() {
  await notifee.createChannel({
    id: DEFAULT_CHANNEL_ID,
    name: 'Default',
    importance: AndroidImportance.HIGH,
  });
}

async function registerToken(token: string) {
  await apiClient.post('/push-tokens', { token, platform: Platform.OS, provider: 'fcm' }).catch(() => {
    // Registration failure shouldn't block app usage — retry on next mount.
  });
}

/**
 * Optional pattern, an ALTERNATIVE to usePushNotifications.ts
 * (expo-notifications) — pick one, not both. Only relevant once the app
 * already uses Firebase directly (Crashlytics, the analytics wrapper)
 * and wants richer native control than Expo's own push service: custom
 * Android notification channels, data-only background messages.
 *
 * Permission is requested via expo-notifications (see
 * usePushNotifications.ts), NOT via @react-native-firebase/messaging's
 * own requestPermission()/hasPermission() — those are deprecated by the
 * library itself. This hook only owns token retrieval and foreground
 * message display, not the permission prompt.
 *
 * `setBackgroundMessageHandler` is intentionally NOT called here — it
 * must be registered top-level, outside the React component tree, in
 * the app's entry file. See SKILL.md's "Optional patterns" → "Firebase
 * Cloud Messaging" for the Expo Router custom-entry-file setup this
 * needs (the default entry is `expo-router/entry`, which has no
 * user-editable file to add this to otherwise).
 */
export function useFirebaseMessaging() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const messaging = getMessaging();

    const register = async () => {
      await ensureDefaultChannel();
      const token = await getToken(messaging);
      await registerToken(token);
    };

    register();

    const unsubscribeRefresh = onTokenRefresh(messaging, (token) => {
      registerToken(token);
    });

    return () => unsubscribeRefresh();
  }, [isAuthenticated]);

  useEffect(() => {
    const messaging = getMessaging();

    // FCM data-only messages render no UI on their own — Notifee is what
    // actually displays a heads-up notification while the app is in the
    // foreground. Background/quit-state messages are handled by the
    // separate setBackgroundMessageHandler in the entry file instead.
    const unsubscribe = onMessage(messaging, async (remoteMessage) => {
      await ensureDefaultChannel();
      await notifee.displayNotification({
        // FCM's data payload types values as `string | object`, but in
        // practice a data-only message's own fields are always strings
        // (FCM itself only carries string values in `data`) — cast
        // rather than let a rare non-string value crash displayNotification.
        title: remoteMessage.notification?.title ?? (remoteMessage.data?.title as string | undefined),
        body: remoteMessage.notification?.body ?? (remoteMessage.data?.body as string | undefined),
        android: {
          channelId: DEFAULT_CHANNEL_ID,
          pressAction: { id: 'default' },
        },
      });
    });

    return () => unsubscribe();
  }, []);
}

import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { AppState, Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { env } from '@/constants/env';
import { useTheme } from '@/hooks/useTheme';
import { apiClient } from '@/services/api/client';

interface ForceUpdateInfo {
  url: string;
  latestVersion: string;
}

interface VersionCheckResponse {
  min_version: string;
  latest_version: string;
  update_url: string;
}

function isVersionLower(current: string, target: string): boolean {
  const currentParts = current.split('.').map(Number);
  const targetParts = target.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const a = currentParts[i] ?? 0;
    const b = targetParts[i] ?? 0;
    if (a < b) return true;
    if (a > b) return false;
  }
  return false;
}

/**
 * Optional pattern — only relevant for apps using EAS Update, see
 * SKILL.md's "Optional patterns" section. Requires
 * `EXPO_PUBLIC_VERSION_CHECK_URL` in env.ts and `npx expo install
 * expo-updates`.
 *
 * Two independent concerns in one file: a blocking force-update banner
 * (installed app version below the backend's min_version) and a
 * dismissable OTA-reload banner (expo-updates has fetched a new JS
 * bundle). Delete the OTA half below if the app only needs the
 * force-update gate without adopting EAS Update.
 */
export function UpdateBanner() {
  const { colors, typography } = useTheme();
  const [forceUpdate, setForceUpdate] = useState<ForceUpdateInfo | null>(null);
  const [otaDismissed, setOtaDismissed] = useState(false);
  const { isUpdateAvailable, isUpdatePending, isDownloading } = Updates.useUpdates();

  const currentVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    if (__DEV__ || !env.EXPO_PUBLIC_VERSION_CHECK_URL) return;

    const checkForceUpdate = async () => {
      try {
        const { data } = await apiClient.get<VersionCheckResponse>(env.EXPO_PUBLIC_VERSION_CHECK_URL!);
        if (isVersionLower(currentVersion, data.min_version)) {
          setForceUpdate({
            url: Platform.OS === 'ios' ? (env.EXPO_PUBLIC_IOS_STORE_URL ?? data.update_url) : data.update_url,
            latestVersion: data.latest_version,
          });
        } else {
          setForceUpdate(null);
        }
      } catch {
        // A failed version check shouldn't block app usage — fail silent,
        // it'll retry on the next foreground transition.
      }
    };

    checkForceUpdate();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkForceUpdate();
    });
    return () => subscription.remove();
  }, [currentVersion]);

  useEffect(() => {
    if (isUpdateAvailable && !isUpdatePending && !isDownloading) {
      Updates.fetchUpdateAsync().catch(() => {
        // The app keeps working on the current bundle either way.
      });
    }
  }, [isUpdateAvailable, isUpdatePending, isDownloading]);

  if (forceUpdate) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.danger }]}>
        <Text style={[typography.subheading, styles.lightText]}>Update wajib tersedia</Text>
        <Text style={[typography.caption, styles.lightText]}>
          Versi {forceUpdate.latestVersion} tersedia. Perbarui aplikasi untuk melanjutkan.
        </Text>
        <Button label="Update Sekarang" onPress={() => Linking.openURL(forceUpdate.url)} />
      </View>
    );
  }

  if (isUpdatePending && !otaDismissed) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.surface }]}>
        <Text style={[typography.subheading, { color: colors.text }]}>Update siap dipasang</Text>
        <Button label="Restart Sekarang" onPress={() => Updates.reloadAsync()} />
        <Text style={[typography.caption, { color: colors.textMuted }]} onPress={() => setOtaDismissed(true)}>
          Nanti saja
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 44,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    zIndex: 998,
  },
  lightText: {
    color: '#fff',
  },
});

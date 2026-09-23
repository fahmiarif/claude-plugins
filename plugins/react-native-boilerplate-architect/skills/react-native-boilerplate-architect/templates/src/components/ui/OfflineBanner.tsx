import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/useTheme';

/**
 * Mounted once in the root layout (see app/_layout.tsx), same pattern as
 * <Toast /> — a single global overlay, not per-screen. Slides down from
 * behind the status bar when connectivity drops, slides back up once
 * restored. This is an ambient signal only — a screen's own `QueryState`
 * error branch still handles a failed request on its own; the banner just
 * explains why requests are likely failing right now.
 */
export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const { colors, typography } = useTheme();
  const translateY = useSharedValue(-60);

  useEffect(() => {
    translateY.value = withTiming(isOffline ? 0 : -60, { duration: 250 });
  }, [isOffline, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, animatedStyle, { backgroundColor: colors.danger }]}
      // Android announces this live-region change automatically; iOS's real
      // equivalent is AccessibilityInfo.announceForAccessibility, so this is
      // a partial (Android-strong, iOS-partial) improvement, not full parity.
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text style={[typography.caption, styles.text]}>Anda sedang offline</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 44,
    paddingBottom: 8,
    alignItems: 'center',
    zIndex: 999,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});

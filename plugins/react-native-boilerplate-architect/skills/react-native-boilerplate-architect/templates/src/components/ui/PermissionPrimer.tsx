import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';

export interface PermissionPrimerProps {
  /** Icon/illustration node — pass an @expo/vector-icons element or an Image. */
  icon: ReactNode;
  title: string;
  description: string;
  /**
   * Wire this to the actual native permission request, e.g. expo-audio's
   * requestRecordingPermissionsAsync, expo-camera's
   * useCameraPermissions()[1], or Notifications.requestPermissionsAsync.
   */
  onAllow: () => void;
  onDismiss?: () => void;
  allowLabel?: string;
  dismissLabel?: string;
}

/**
 * Generic pre-permission "priming" card — asking a native permission
 * dialog cold (no context) has a lower accept rate than explaining why
 * first. Deliberately has no opinion on which permission: pass different
 * icon/copy/onAllow for camera, microphone, notifications, etc. Does not
 * call any permission API itself, so this component has no dependency on
 * any specific expo-* permissions module.
 */
export function PermissionPrimer({
  icon,
  title,
  description,
  onAllow,
  onDismiss,
  allowLabel = 'Izinkan',
  dismissLabel = 'Nanti saja',
}: PermissionPrimerProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.surface }]}>{icon}</View>
      <Text style={[typography.heading, { color: colors.text, marginTop: spacing.lg }]}>{title}</Text>
      <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
        {description}
      </Text>
      <View style={[styles.actions, { marginTop: spacing.xl, gap: spacing.sm }]}>
        <Button label={allowLabel} onPress={onAllow} />
        {onDismiss && (
          // hitSlop isn't a valid Text prop — Pressable is the correct
          // wrapper for an enlarged, accessible touch target.
          <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel={dismissLabel} hitSlop={8}>
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center' }]}>{dismissLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    width: '100%',
  },
});

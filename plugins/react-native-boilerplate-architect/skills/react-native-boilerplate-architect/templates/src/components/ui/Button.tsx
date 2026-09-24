import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  /** Overrides the screen-reader label if it should differ from the visible `label` text. */
  accessibilityLabel?: string;
  /** For E2E selectors (Maestro/Detox) — prefer this over a text selector once labels vary by locale. */
  testID?: string;
}

/**
 * Base design-system button. Handles its own loading/disabled visual state
 * so screens don't re-implement it per usage. Carries the baseline
 * accessibility props from STANDARD.md §9 (accessibilityRole/state, a
 * hitSlop safety margin toward the 44x44 minimum touch target) — keep new
 * `ui/` components consistent with this rather than adding it as an
 * afterthought.
 */
export const Button = ({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  accessibilityLabel,
  testID,
}: ButtonProps) => {
  const handlePress = useCallback(() => {
    if (isLoading || disabled) return;
    onPress();
  }, [isLoading, disabled, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || isLoading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
      hitSlop={8}
      testID={testID}
      style={({ pressed }) => [styles.button, (disabled || isLoading) && styles.disabled, pressed && styles.pressed]}
    >
      {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

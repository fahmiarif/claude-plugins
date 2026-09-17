import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Base design-system button. Handles its own loading/disabled visual state
 * so screens don't re-implement it per usage.
 */
export const Button = ({ label, onPress, isLoading = false, disabled = false }: ButtonProps) => {
  const handlePress = useCallback(() => {
    if (isLoading || disabled) return;
    onPress();
  }, [isLoading, disabled, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || isLoading}
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

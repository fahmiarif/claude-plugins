import React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export interface FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
  extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'style'> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
}

/**
 * The single reusable field for every RHF+Zod form — wraps `Controller` +
 * a themed `TextInput` + label + inline error message, so a screen composes
 * fields declaratively (`<FormField control={control} name="email"
 * label="Email" />`) instead of hand-rolling `useState` + `TextInput` +
 * manual error text per field. This replaces exactly that pattern: a real
 * production app never adopted `react-hook-form` at all despite it being
 * mandated, because every screen re-implemented forms by hand instead —
 * this component is what makes the mandate actually easy to follow.
 *
 * Generic over the form's field values (`TFieldValues`) and field name
 * (`TName`, constrained to an actual path in that form via `FieldPath`) so
 * a typo'd `name` prop is a compile error, not a silent no-op at runtime.
 * Standard `TextInputProps` are spread through, so `keyboardType`,
 * `secureTextEntry`, `autoCapitalize`, etc. all still work per field.
 */
export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  label,
  ...textInputProps
}: FormFieldProps<TFieldValues, TName>) {
  const { colors, spacing, typography } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={[styles.container, { gap: spacing.xs }]}>
          <Text style={[typography.caption, { color: colors.text }]}>{label}</Text>
          <TextInput
            {...textInputProps}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholderTextColor={colors.textMuted}
            style={[
              typography.body,
              styles.input,
              {
                color: colors.text,
                borderColor: error ? colors.danger : colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            // Screen-reader-friendly labeling (see STANDARD.md §9) — exposes
            // the field's own error text to assistive tech even though it's
            // also rendered visually below.
            accessibilityLabel={label}
            accessibilityHint={error?.message}
          />
          {error && (
            <Text style={[typography.caption, { color: colors.danger }]} accessibilityLiveRegion="polite">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44, // touch target minimum — see STANDARD.md §9 (Accessibility)
  },
});

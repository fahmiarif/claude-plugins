import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { useCreateExampleItem } from '@/hooks/useExampleItems';

const exampleFormSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
});

type ExampleFormValues = z.infer<typeof exampleFormSchema>;

/**
 * Reference pattern: React Hook Form + Zod validation, wired to a React
 * Query mutation. Copy this shape for other forms instead of manual
 * useState per field.
 */
export const ExampleFormScreen = () => {
  const { control, handleSubmit, reset, formState } = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues: { title: '' },
  });
  const createItem = useCreateExampleItem();

  const onSubmit = handleSubmit((values) => {
    createItem.mutate(values.title, { onSuccess: () => reset() });
  });

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Judul"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {formState.errors.title && <Text style={styles.error}>{formState.errors.title.message}</Text>}

      <Button label="Simpan" onPress={onSubmit} isLoading={createItem.isPending} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    color: '#dc2626',
    fontSize: 12,
  },
});

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';

import { useCreateExampleItem } from '../hooks/useExampleFeature';

const exampleFormSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
});

type ExampleFormValues = z.infer<typeof exampleFormSchema>;

/**
 * Reference pattern: React Hook Form + Zod validation, composed from
 * `FormField` (a shared `/src/components/ui` primitive — see
 * `@/components/ui/FormField`) and wired to this feature's own React
 * Query mutation. Copy this shape for other feature form screens — each
 * field is one declarative `<FormField>` line, not a hand-rolled
 * `Controller` + `TextInput` + error `Text` per field.
 */
export const ExampleFormScreen = () => {
  const { control, handleSubmit, reset } = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues: { title: '' },
  });
  const createItem = useCreateExampleItem();

  const onSubmit = handleSubmit((values) => {
    createItem.mutate(values.title, { onSuccess: () => reset() });
  });

  return (
    <View style={styles.container}>
      <FormField control={control} name="title" label="Judul" placeholder="Judul" />
      <Button label="Simpan" onPress={onSubmit} isLoading={createItem.isPending} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
});

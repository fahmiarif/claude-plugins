import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createExampleItem, fetchExampleItems } from '@/services/api/example';

const EXAMPLE_ITEMS_KEY = ['example-items'] as const;

/**
 * Server-state hook for the example items list. Screens/components consume
 * this instead of calling the API layer directly, so caching/loading/error
 * handling stay centralized in one place.
 */
export function useExampleItems() {
  return useQuery({
    queryKey: EXAMPLE_ITEMS_KEY,
    queryFn: fetchExampleItems,
  });
}

export function useCreateExampleItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExampleItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMPLE_ITEMS_KEY });
    },
  });
}

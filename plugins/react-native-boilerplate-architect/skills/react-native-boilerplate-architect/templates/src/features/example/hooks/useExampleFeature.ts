import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createExampleItem, fetchExampleItems } from '../api/exampleApi';

const EXAMPLE_ITEMS_KEY = ['example-feature', 'items'] as const;

/**
 * Server-state hooks for this feature's items list. Screens/components
 * consume these instead of calling `../api/exampleApi` directly, so
 * caching/loading/error handling stay centralized in one place.
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

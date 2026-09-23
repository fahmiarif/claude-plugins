import { QueryClient } from '@tanstack/react-query';

/**
 * Centralized so every screen gets the same retry/staleTime behavior
 * instead of each `useQuery` call configuring its own — a screen that
 * needs different behavior overrides it locally, but the default is set
 * once here.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

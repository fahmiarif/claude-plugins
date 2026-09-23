import { apiClient } from '@/services/api/client';

import type { ExampleItem } from '../types';

// Feature-local endpoints import the shared Axios client from
// /src/services/api/client.ts (interceptors, base URL) — the client
// itself stays shared since every feature needs the same auth header
// injection and 401 handling, not duplicated per feature.
export async function fetchExampleItems(): Promise<ExampleItem[]> {
  const { data } = await apiClient.get<ExampleItem[]>('/examples');
  return data;
}

export async function createExampleItem(title: string): Promise<ExampleItem> {
  const { data } = await apiClient.post<ExampleItem>('/examples', { title });
  return data;
}

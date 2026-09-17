import { apiClient } from '@/services/api/client';

import type { ExampleItem } from '../types';

// Same shape as the layer-based /src/services/api/example.ts — moved
// here wholesale when this feature graduates to its own folder.
export async function fetchExampleItems(): Promise<ExampleItem[]> {
  const { data } = await apiClient.get<ExampleItem[]>('/examples');
  return data;
}

export async function createExampleItem(title: string): Promise<ExampleItem> {
  const { data } = await apiClient.post<ExampleItem>('/examples', { title });
  return data;
}

import { apiClient } from './client';

export interface ExampleItem {
  id: string;
  title: string;
}

export async function fetchExampleItems(): Promise<ExampleItem[]> {
  const { data } = await apiClient.get<ExampleItem[]>('/examples');
  return data;
}

export async function createExampleItem(title: string): Promise<ExampleItem> {
  const { data } = await apiClient.post<ExampleItem>('/examples', { title });
  return data;
}

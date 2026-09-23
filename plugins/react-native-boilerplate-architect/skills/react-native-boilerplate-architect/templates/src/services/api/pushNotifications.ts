import { apiClient } from './client';

interface RegisterPushTokenPayload {
  expoPushToken: string;
  platform: 'ios' | 'android';
  appVersion?: string;
}

export async function registerPushToken(payload: RegisterPushTokenPayload): Promise<void> {
  await apiClient.post('/push-tokens', payload);
}

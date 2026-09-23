import axios from 'axios';
import { router } from 'expo-router';

import { env } from '@/constants/env';
import { useAuthStore } from '@/store/useAuthStore';

export const apiClient = axios.create({
  baseURL: env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

// Attach the auth token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, the session is no longer valid — clear it and send the user
// back to login. Runs for every request, so a screen deep in the (tabs)
// stack that suddenly gets a 401 (expired/revoked token) bounces the user
// out instead of silently failing and leaving a broken authenticated
// screen on-screen.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  }
);

function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

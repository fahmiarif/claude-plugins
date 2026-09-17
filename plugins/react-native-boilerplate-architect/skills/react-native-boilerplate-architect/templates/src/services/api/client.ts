import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

// Attach the auth token to every outgoing request. Read the token from
// wherever the app persists the session (e.g. a Zustand auth store), not
// from module-level mutable state, so it stays consistent across reloads.
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function getAuthToken(): string | null {
  // Replace with the real source, e.g. useAuthStore.getState().token
  return null;
}

import { create } from 'zustand';

interface AppPreferencesState {
  theme: 'light' | 'dark';
  hasSeenOnboarding: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  markOnboardingSeen: () => void;
}

/**
 * Client-only state — theme and onboarding flags have no server source of
 * truth. Data fetched from an API belongs in a React Query hook, not here.
 */
export const useAppPreferencesStore = create<AppPreferencesState>((set) => ({
  theme: 'light',
  hasSeenOnboarding: false,
  setTheme: (theme) => set({ theme }),
  markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
}));

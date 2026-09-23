import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppPreferencesState {
  theme: 'light' | 'dark';
  hasSeenOnboarding: boolean;
  hasHydrated: boolean;
  hasPromptedReview: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  markOnboardingSeen: () => void;
  setHasHydrated: (value: boolean) => void;
  markReviewPrompted: () => void;
}

/**
 * Client-only state — theme and onboarding flags have no server source of
 * truth. Data fetched from an API belongs in a React Query hook, not here.
 *
 * Persisted via AsyncStorage so `hasSeenOnboarding` survives app restarts —
 * without persistence, the onboarding carousel would replay on every launch.
 * `hasHydrated` lets the root layout hold the native splash screen until the
 * persisted value has actually loaded, avoiding a flash of the onboarding
 * flow for a returning user (see `app/_layout.tsx`).
 */
export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set) => ({
      theme: 'light',
      hasSeenOnboarding: false,
      hasHydrated: false,
      hasPromptedReview: false,
      setTheme: (theme) => set({ theme }),
      markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      markReviewPrompted: () => set({ hasPromptedReview: true }),
    }),
    {
      name: 'app-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        hasSeenOnboarding: state.hasSeenOnboarding,
        hasPromptedReview: state.hasPromptedReview,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

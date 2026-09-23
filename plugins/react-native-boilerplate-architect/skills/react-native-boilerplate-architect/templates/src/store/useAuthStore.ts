import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

/**
 * Adapts expo-secure-store's getItemAsync/setItemAsync/deleteItemAsync to
 * zustand's StateStorage shape (getItem/setItem/removeItem). SecureStore is
 * backed by the iOS Keychain / Android Keystore — encrypted at rest, unlike
 * AsyncStorage — which is why the auth token lives here instead of
 * AsyncStorage (see reference/LIBRARIES.md's storage table).
 *
 * Two SecureStore constraints worth knowing before this store grows: it
 * enforces a ~2KB value limit per key (fine for a JWT-sized token, but
 * `createJSONStorage` wraps the whole persisted slice as one JSON string
 * under one key, not one key per field) and only allows
 * alphanumeric/`.`/`-`/`_` in key names (the `name: 'auth-session'` below
 * already satisfies this).
 */
const secureStorage: StateStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setSession: (token: string) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

/**
 * Minimal generic session shape — client-only state per the state-category
 * table in STANDARD.md §2a (no server source of truth once stored locally).
 * The actual login API call is app-specific and out of scope here; this
 * store is just the persisted container `services/api/client.ts`'s
 * interceptors and `app/index.tsx`'s boot router read from.
 *
 * Persisted via `expo-secure-store`, not AsyncStorage — a real production
 * app skipped this exact swap under deadline pressure and shipped a
 * plaintext token for months, which is the mistake this default is meant to
 * prevent. `isAuthenticated` rides along in the same encrypted slice rather
 * than a separate AsyncStorage-backed store, since splitting it out would
 * mean a second `hasHydrated` flag and a more complex splash-hold condition
 * (see `app/_layout.tsx`) for a boolean that has no independent meaning
 * without the token next to it.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setSession: (token) => set({ token, isAuthenticated: true }),
      clearSession: () => set({ token: null, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

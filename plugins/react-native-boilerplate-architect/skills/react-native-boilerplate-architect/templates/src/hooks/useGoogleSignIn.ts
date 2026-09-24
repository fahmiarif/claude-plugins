import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useCallback, useState } from 'react';

import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';

interface GoogleAuthResponse {
  token: string;
}

/**
 * Optional pattern — requires a dev client/build, not Expo Go (this is a
 * native module). Google Sign-In is used purely as a credential-
 * acquisition step here, NOT as the app's auth backend: it gets a Google
 * ID token, POSTs it to this app's own `/auth/google` endpoint, and
 * whatever session token that endpoint returns feeds into the same
 * `useAuthStore.setSession()` every other login method uses. Swap the
 * endpoint path/response shape for whatever this app's real backend
 * expects — that part is app-specific, this hook only owns the Google
 * credential exchange.
 *
 * Requires `GoogleSignin.configure({ webClientId: '...' })` to have run
 * once at app startup (e.g. in the root layout) — see SKILL.md's
 * "Optional patterns" → "Google Sign-In" for the required `app.json`
 * config plugin entry and where `webClientId` comes from.
 */
export function useGoogleSignIn() {
  const setSession = useAuthStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.type !== 'success') return; // user cancelled the flow

      const { idToken } = response.data;
      if (!idToken) {
        throw new Error(
          'Google Sign-In returned no ID token — check webClientId in GoogleSignin.configure().'
        );
      }

      const { data } = await apiClient.post<GoogleAuthResponse>('/auth/google', { idToken });
      setSession(data.token);
    } catch (error: any) {
      if (error?.code === statusCodes.IN_PROGRESS) {
        // A sign-in is already in flight — ignore the duplicate tap.
      } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.warn('Google Play Services is not available on this device.');
      } else {
        console.error('Google sign-in failed', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setSession]);

  // Call this alongside useAuthStore's clearSession() in the app's own
  // logout handler — clearSession() only clears THIS app's session;
  // without also signing out of Google, the next sign-in attempt
  // silently re-authenticates as the same Google account.
  const signOutOfGoogle = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google sign-out failed', error);
    }
  }, []);

  return { signIn, signOutOfGoogle, isLoading };
}

import * as StoreReview from 'expo-store-review';

import { useAppPreferencesStore } from '@/store/useAppPreferencesStore';

/**
 * Optional pattern — requires `npx expo install expo-store-review`, see
 * reference/LIBRARIES.md. Call after a meaningful positive user action
 * (e.g. completing a core flow successfully), not on every app open.
 *
 * No-op if the platform can't show the native prompt, or if this app
 * install has already prompted once — `StoreReview.requestReview()`
 * itself is silently rate-limited by the OS (iOS in particular won't show
 * it more than a few times a year regardless), but tracking our own flag
 * avoids even calling it repeatedly and keeps behavior predictable/testable.
 */
export async function maybePromptForReview(): Promise<void> {
  const { hasPromptedReview, markReviewPrompted } = useAppPreferencesStore.getState();
  if (hasPromptedReview) return;

  const isAvailable = await StoreReview.isAvailableAsync();
  if (!isAvailable) return;

  await StoreReview.requestReview();
  markReviewPrompted();
}

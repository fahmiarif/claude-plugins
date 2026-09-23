import { z } from 'zod';

/**
 * Validates env vars once at import time instead of letting a missing
 * `EXPO_PUBLIC_API_URL` surface as a confusing runtime bug (e.g. a
 * request silently going to "undefined/endpoint"). Fails loudly and
 * immediately on app start instead.
 *
 * Only `EXPO_PUBLIC_*` vars are available here — Expo inlines them at
 * build time; anything without that prefix is undefined in the app.
 */
const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
  // Only required if the app adopts the optional force-update/OTA banner
  // (templates/src/components/ui/UpdateBanner.tsx) — points at a backend
  // endpoint returning { min_version, latest_version, update_url }.
  EXPO_PUBLIC_VERSION_CHECK_URL: z.string().url().optional(),
  // Only used by the force-update banner's iOS variant, to override the
  // backend's update_url with a direct App Store link.
  EXPO_PUBLIC_IOS_STORE_URL: z.string().url().optional(),
});

export const env = envSchema.parse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_VERSION_CHECK_URL: process.env.EXPO_PUBLIC_VERSION_CHECK_URL,
  EXPO_PUBLIC_IOS_STORE_URL: process.env.EXPO_PUBLIC_IOS_STORE_URL,
});

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
});

export const env = envSchema.parse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});

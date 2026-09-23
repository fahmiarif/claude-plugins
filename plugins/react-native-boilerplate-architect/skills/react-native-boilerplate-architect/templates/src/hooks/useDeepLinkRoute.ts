import { router } from 'expo-router';
import { useCallback } from 'react';

/**
 * Normalizes an incoming URL (custom-scheme deep link OR a universal/App
 * Link https:// URL already matched by app.json's intentFilters/
 * associatedDomains) into an Expo Router path and navigates to it.
 *
 * Extracted from a production pattern that hardcoded one app's custom
 * scheme inline — generalized here to accept the scheme as a parameter so
 * this hook has no per-app knowledge baked in. Get the app's own scheme
 * from `app.json`'s `"scheme"` field (already required for `expo-linking`
 * to construct/parse links at all).
 *
 * Unlike the production pattern this is extracted from — which always
 * handed a matched https:// URL off to `Linking.openURL` (the browser) —
 * this resolves it to an in-app route first, since that's the entire
 * point of configuring `intentFilters`/`associatedDomains` in the first
 * place (open the link IN the app, not bounce back out to a browser).
 */
export function useDeepLinkRoute(scheme: string) {
  const navigate = useCallback(
    (url: string, mode: 'push' | 'replace' = 'push') => {
      try {
        const schemePrefix = `${scheme}://`;
        let path = url;

        if (url.startsWith(schemePrefix)) {
          path = url.slice(schemePrefix.length);
        } else if (url.startsWith('http://') || url.startsWith('https://')) {
          // Universal/App Link case: strip origin, keep only path+query
          // (e.g. "https://example.com/share/abc?x=1" -> "/share/abc?x=1").
          try {
            const parsed = new URL(url);
            path = `${parsed.pathname}${parsed.search}`;
          } catch {
            // Not a parseable URL — fall through and let the leading-slash
            // normalization below handle it as best-effort.
          }
        }

        if (!path.startsWith('/')) {
          path = `/${path}`;
        }

        router[mode](path as never);
      } catch (err) {
        console.error('useDeepLinkRoute: failed to navigate for url', url, err);
      }
    },
    [scheme]
  );

  return { navigate };
}

/**
 * Single seam for all analytics event tracking — call `trackEvent(name,
 * params)` from screens/hooks instead of importing
 * @react-native-firebase/analytics and calling logEvent() inline per call
 * site. This is the fix for a pattern seen in production: every screen did
 * its own `require('@react-native-firebase/analytics')` + `getAnalytics()`
 * + `logEvent()`, which meant no single place to swap providers, add a
 * dev-mode console log, or guard against analytics not being configured yet.
 *
 * Requires `npx expo install @react-native-firebase/analytics
 * @react-native-firebase/app` (see reference/LIBRARIES.md) plus the native
 * Firebase config files (`google-services.json` / `GoogleService-Info.plist`)
 * — until those are in place, every call below safely no-ops instead of
 * crashing the app, which matters because this file gets imported from
 * common code paths (root layout, auth flow) that must work even before
 * analytics is set up.
 */

// Deliberately NOT `typeof import('@react-native-firebase/analytics')` — that
// would make this file fail `tsc` the moment the package isn't installed yet,
// contradicting the "safe to import before configured" point of this file.
// A minimal local shape is enough for what's actually called below.
interface AnalyticsModule {
  getAnalytics(): unknown;
  logEvent(instance: unknown, name: string, params?: Record<string, unknown>): Promise<void>;
}

// Lazily resolved so importing this file never throws if the native module
// isn't linked yet (e.g. Expo Go, or before Firebase config files are added).
let analyticsModule: AnalyticsModule | null | undefined;

function getAnalyticsModule(): AnalyticsModule | null {
  if (analyticsModule !== undefined) return analyticsModule;
  try {
    // A lazy require, not a static import, is the entire point here.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    analyticsModule = require('@react-native-firebase/analytics');
  } catch {
    analyticsModule = null;
  }
  // `require()` returns `any`, so the assignment above resets narrowing on
  // this module-scope variable — coerce a possible `undefined` (e.g. an
  // unexpected shape from `require`) to `null` to match the return type.
  return analyticsModule ?? null;
}

/**
 * Fire-and-forget analytics event. Safe to call unconditionally anywhere in
 * the app — no-ops (with a dev-only console log) if the analytics package
 * isn't installed or Firebase isn't configured for this build yet.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  const analytics = getAnalyticsModule();
  if (!analytics) {
    if (__DEV__) console.log('[analytics:noop]', name, params);
    return;
  }
  try {
    const instance = analytics.getAnalytics();
    analytics.logEvent(instance, name, params).catch((err: unknown) => {
      console.warn('[analytics] logEvent failed', name, err);
    });
  } catch (err) {
    console.warn('[analytics] trackEvent failed', name, err);
  }
}

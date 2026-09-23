# PT PSM React Native — Component & Library Catalog

This is the "which library do I reach for" reference — it exists so
every PT PSM app makes the same choice for the same problem instead of
each developer/agent picking whatever shows up first in a search. These
are **supplementary** to the mandatory core stack in `STANDARD.md`
(routing, TS, TanStack Query, Zustand, RHF+Zod, FlashList, Reanimated,
AsyncStorage, NetInfo, SecureStore) — install on demand when a feature
actually needs one, not speculatively at scaffold time. AsyncStorage,
NetInfo, and SecureStore are the three exceptions already installed at
scaffold time (see `SKILL.md` step 5) because the persisted
`hasSeenOnboarding`/session flags, the global offline banner, and the auth
token respectively depend on them out of the box — they're still listed
below under "Storage, network, device" for completeness, not because
they're optional.

When a need isn't listed here, prefer (in order): an Expo SDK module
(`expo-*`, actively maintained, guaranteed compatible with the installed
SDK) → a library already used elsewhere in PT PSM's apps (check
`meet-manajio-mobile`'s `package.json` for prior art) → a well-maintained
community library installed via `npx expo install` when it's an
Expo-managed native module, or `npm install` otherwise.

## UI components & overlays

| Need | Standard pick | Notes |
|---|---|---|
| Bottom sheet | `@gorhom/bottom-sheet` | De facto standard — built on Reanimated + Gesture Handler, handles snap points/backdrop/keyboard avoidance out of the box. |
| Bottom sheet (native, no JS-rendered UI) | `@expo/ui` | Newer alternative — renders true SwiftUI/Jetpack Compose components from JS. Consider when the sheet is simple and native look/feel matters more than custom styling flexibility. |
| Modal / confirm dialog | React Native core `Modal`, or `react-native-modal` for built-in animations | Build the app's Toast/Dialog components on top of this — never the system `alert()` (banned per `STANDARD.md` §5). |
| Action sheet (iOS-style option list) | `@expo/react-native-action-sheet` | E.g. "Choose from gallery / camera / cancel". |
| Toast / snackbar | `react-native-toast-message` | Pairs with the "no `alert()`" rule — this is what error/success feedback should use instead. |
| Skeleton loader | `moti/skeleton` (if `moti` already in use) or `react-native-skeleton-placeholder` | Pairs with `templates/src/components/ui/QueryState.tsx`'s loading branch — swap the `ActivityIndicator` for a skeleton once the design system has one. |

## Icons, images, media

| Need | Standard pick | Notes |
|---|---|---|
| Icons | `@expo/vector-icons` | Bundled with Expo, no extra native linking. |
| Images (any `<Image>` usage) | `expo-image` | Caching, placeholders, better performance than RN core `Image` — use this by default, not core `Image`. |
| Camera | `expo-camera` | Also handles barcode/QR scanning (`barCodeScannerSettings`) — no separate barcode library needed. |
| Image/document picking | `expo-image-picker`, `expo-document-picker` | |
| Video/audio playback | `expo-video`, `expo-audio` | |
| Lottie animation | `lottie-react-native` | For JSON motion assets (loading states, illustrated empty states) — heavier than a skeleton, use for actual brand/illustration moments, not routine spinners. |
| PDF viewing | `react-native-pdf` | |
| PDF generation | `expo-print` | `Print.printToFileAsync` for generating a PDF from HTML. |

## Animation & gesture

| Need | Standard pick | Notes |
|---|---|---|
| Any animation beyond a simple fade | `react-native-reanimated` (already core) | Runs on UI thread — mandatory per `STANDARD.md`. |
| Declarative animation shorthand | `moti` | Wraps Reanimated with a simpler API (`<MotiView from={} animate={}>`) — reach for this before hand-writing worklets for common cases (fade/slide/scale). |
| Swipeable list rows | Gesture Handler's `Swipeable` (already bundled with `react-native-gesture-handler`) | No separate library needed. |
| Charts | `react-native-gifted-charts` | Lighter-weight than Skia-based alternatives (`victory-native`) — no extra native dependency beyond what's already installed. Reach for Skia-based charting only if a chart type genuinely needs it. |

## Forms & inputs (beyond RHF + Zod core)

| Need | Standard pick | Notes |
|---|---|---|
| OTP / confirmation code input | `react-native-confirmation-code-field` | |
| Phone number input w/ country code | `react-native-phone-number-input` | |
| Date/time picker | `@react-native-community/datetimepicker` | Native picker per platform — wrap in a `Controller` when used with React Hook Form. |

## Storage, network, device

| Need | Standard pick | Notes |
|---|---|---|
| Non-sensitive local storage | `@react-native-async-storage/async-storage` | Client-only cache/preferences (pairs with Zustand's `persist` middleware if a store needs to survive restarts). |
| **Sensitive** storage (auth tokens, credentials) | `expo-secure-store` | **Promoted to core** (see `SKILL.md` step 5/7) — `templates/src/store/useAuthStore.ts` is wired to it by default, not left as a "swap AsyncStorage for this once it matters" suggestion. Never put tokens in plain AsyncStorage. |
| Network/connectivity status | `@react-native-community/netinfo` | **Promoted to core** (see `SKILL.md` step 5/7) — every scaffolded app gets `useNetworkStatus` + a global `OfflineBanner` by default, so a failed request can be told apart from "we're offline" rather than looking like a generic error. |
| Haptic feedback | `expo-haptics` | Light haptic on meaningful taps (not every button — reserve for confirmations/important actions). |
| Biometric auth | `expo-local-authentication` | Face ID / fingerprint gate, e.g. before revealing sensitive data. |
| Deep linking | `expo-linking` | See `templates/src/hooks/useDeepLinkRoute.ts` for the URL-to-route normalization pattern, and `SKILL.md`'s "iOS + Android" section for the `intentFilters`/`associatedDomains` native config. |
| Sharing (native share sheet) | `expo-sharing` | |
| Maps | `react-native-maps` | |
| WebView | `react-native-webview` | |

## Auth, payments, analytics

| Need | Standard pick | Notes |
|---|---|---|
| Google Sign-In | `@react-native-google-signin/google-signin` | |
| Apple Sign-In | `expo-apple-authentication` | Required by App Store guidelines if Google/Facebook sign-in is offered on iOS. |
| In-app purchases / subscriptions | `react-native-iap` | |
| Push notifications (basic) | `expo-notifications` | See `templates/src/hooks/usePushNotifications.ts` + `templates/src/services/api/pushNotifications.ts` for the permission + token-registration + tap/foreground-listener pattern once this is installed — a reference to adapt, not a drop-in (the backend endpoint shape is app-specific). |
| Push notifications (advanced local scheduling, richer Android controls) | `@notifee/react-native` | Reach for this on top of `expo-notifications` when notification requirements outgrow Expo's API (custom channels, advanced triggers). |
| Analytics | `@react-native-firebase/analytics` | See `templates/src/utils/analytics.ts` — call `trackEvent(name, params)` instead of importing the SDK directly per call site (a production pattern this replaces: every screen did its own raw `require`+`getAnalytics`+`logEvent`). |
| Crash reporting | `@react-native-firebase/crashlytics` or Sentry (`@sentry/react-native`) | Pick one per app up front — don't run both. `templates/src/components/ErrorBoundary.tsx`'s `onError` prop is the wiring seam — see `SKILL.md`'s "Optional patterns" → "Crash reporting hook". |

## Updates & versioning

| Need | Standard pick | Notes |
|---|---|---|
| OTA updates + force-update gate | `expo-updates` | See `templates/src/components/ui/UpdateBanner.tsx` and `reference/STANDARD.md` §10 — only relevant once the app actually adopts EAS Update, not part of the default scaffold. |

## Ratings & reviews

| Need | Standard pick | Notes |
|---|---|---|
| In-app review prompt | `expo-store-review` | See `templates/src/utils/requestAppReview.ts` — call `maybePromptForReview()` after a meaningful positive action (not on app open); tracks a persisted once-only flag (`hasPromptedReview`) in `useAppPreferencesStore`. |

## Internationalization

| Need | Standard pick | Notes |
|---|---|---|
| Translations | `react-i18next` + `i18next` | |
| Device locale detection | `expo-localization` | |

Only add i18n at all once the app actually needs more than one language —
don't scaffold translation keys speculatively for a single-language app.

## Testing

| Need | Standard pick | Notes |
|---|---|---|
| Unit/component tests | `jest` (`jest-expo` preset) + `@testing-library/react-native` | **Promoted to core** (see `SKILL.md` step 17) — `templates/jest.config.js` + `templates/src/store/useAppPreferencesStore.test.ts` + `templates/src/components/ui/Button.test.tsx` are the worked examples, not just this recommendation. Test hooks and presentational components; screens usually don't need heavy unit coverage if their logic already lives in hooks (which are tested directly). |
| E2E | Maestro | Simpler YAML-based flows than Detox for most app-level smoke tests; reach for Detox only if a test needs deeper native-level control. |

## What NOT to add speculatively

Don't install any library in this catalog until a feature actually
needs it. A boilerplate's job is to make the *next* choice fast and
consistent, not to pre-install everything an app might eventually want —
that bloats bundle size and gives every new project a pile of unused
dependencies to audit later.

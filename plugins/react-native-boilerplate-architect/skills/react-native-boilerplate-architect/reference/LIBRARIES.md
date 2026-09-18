# PT PSM React Native — Component & Library Catalog

This is the "which library do I reach for" reference — it exists so
every PT PSM app makes the same choice for the same problem instead of
each developer/agent picking whatever shows up first in a search. These
are **supplementary** to the mandatory core stack in `STANDARD.md`
(routing, TS, TanStack Query, Zustand, RHF+Zod, FlashList, Reanimated) —
install on demand when a feature actually needs one, not speculatively
at scaffold time.

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
| **Sensitive** storage (auth tokens, credentials) | `expo-secure-store` | Never put tokens in AsyncStorage (plaintext) — this is the one library substitution that's a security requirement, not a style preference. |
| Network/connectivity status | `@react-native-community/netinfo` | Needed for the "handle the error path gracefully" rule when a request fails due to being offline specifically. |
| Haptic feedback | `expo-haptics` | Light haptic on meaningful taps (not every button — reserve for confirmations/important actions). |
| Biometric auth | `expo-local-authentication` | Face ID / fingerprint gate, e.g. before revealing sensitive data. |
| Deep linking | `expo-linking` | |
| Sharing (native share sheet) | `expo-sharing` | |
| Maps | `react-native-maps` | |
| WebView | `react-native-webview` | |

## Auth, payments, analytics

| Need | Standard pick | Notes |
|---|---|---|
| Google Sign-In | `@react-native-google-signin/google-signin` | |
| Apple Sign-In | `expo-apple-authentication` | Required by App Store guidelines if Google/Facebook sign-in is offered on iOS. |
| In-app purchases / subscriptions | `react-native-iap` | |
| Push notifications (basic) | `expo-notifications` | |
| Push notifications (advanced local scheduling, richer Android controls) | `@notifee/react-native` | Reach for this on top of `expo-notifications` when notification requirements outgrow Expo's API (custom channels, advanced triggers). |
| Analytics | `@react-native-firebase/analytics` | |
| Crash reporting | `@react-native-firebase/crashlytics` or Sentry (`@sentry/react-native`) | Pick one per app up front — don't run both. |

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
| Unit/component tests | `jest` + `@testing-library/react-native` | Test hooks and presentational components; screens usually don't need heavy unit coverage if their logic already lives in hooks (which are tested directly). |
| E2E | Maestro | Simpler YAML-based flows than Detox for most app-level smoke tests; reach for Detox only if a test needs deeper native-level control. |

## What NOT to add speculatively

Don't install any library in this catalog until a feature actually
needs it. A boilerplate's job is to make the *next* choice fast and
consistent, not to pre-install everything an app might eventually want —
that bloats bundle size and gives every new project a pile of unused
dependencies to audit later.

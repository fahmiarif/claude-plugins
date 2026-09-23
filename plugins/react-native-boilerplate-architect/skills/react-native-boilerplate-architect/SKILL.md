---
name: react-native-boilerplate-architect
description: Scaffolds and enforces PT PSM's production-grade React Native (Expo) boilerplate — file-based routing via Expo Router, TypeScript strict mode, mandatory feature-based folders from day one (`/src/features/<feature>/{screens,components,hooks,api,types}`), TanStack Query + Zustand + React Hook Form/Zod (via a reusable FormField component), a first-launch splash/welcome/onboarding flow, session/connectivity handling (SecureStore-backed auth store, 401 redirect, offline banner), an accessibility baseline, a testing baseline (Jest + Testing Library), and team anti-conflict tooling (Prettier + ESLint + Husky + lint-staged pre-commit, Commitlint conventional commits, CI gate on GitHub Actions for iOS/Android). Optional patterns include a crash-reporting seam, an analytics wrapper, deep linking, a force-update/OTA banner, push notifications, an app-review prompt, and a spotlight product tour. Use when starting a new React Native/Expo app, when asked to set up a boilerplate/starter/template for a mobile app, when adding a splash/onboarding/auth/offline-banner/product-tour/form flow, or when auditing an existing RN app against these standards ("bikin boilerplate RN", "setup starter react native", "bikin onboarding/splash screen", "cek project ini udah sesuai standar belum").
metadata:
  author: fahmi
  version: "1.5.0"
---

# React Native (Expo) Boilerplate Architect

## Thesis

Fahmi (PT PSM, fullstack dev) will keep starting new React Native apps.
Without a codified boilerplate, every new app re-derives folder structure,
tooling, and conventions from scratch, and two developers on the same app
drift into different formatting/import/commit habits — which is what
actually causes merge conflicts, not the business logic itself. This skill
is the reusable source of truth: it scaffolds a new Expo app to a known-good
state, and it audits an existing app against the same standard. The
standard here mirrors what's already proven out in the `meet-manajio-mobile`
project's `AGENTS.md`, generalized so it travels across apps, plus the
tooling layer (Prettier/ESLint/Husky/lint-staged/Commitlint/CI) that
project was missing — rules without enforcement don't survive contact with
a deadline.

If the target project already has its own `AGENTS.md`/`CLAUDE.md` with
conflicting rules, **the project's own file wins** — treat this skill as
the default to scaffold *from*, not an override for an established project.

## When to use

- User asks to create a new React Native/Expo app, a "boilerplate", "starter
  template", or "project skeleton".
- User asks to set up team tooling (lint, format, pre-commit hooks, commit
  convention, CI) on an RN project, even without a full new-project ask.
- User asks to audit/review an existing RN project against best practice /
  "standar PT PSM" / consistency across apps.

## Process

### 1. Figure out the starting state

Ask (or infer from the repo) which case applies:
- **Brand new project**: nothing exists yet → run
  `npx create-expo-app@latest <name> --template default` (TypeScript
  template) first, then proceed to scaffold on top of it.
- **Existing Expo project, no tooling yet**: proceed straight to steps
  2–7, adapting to whatever's already there (don't blow away existing
  folders/files — merge in).
- **Audit only**: skip scaffolding, instead diff the project's current
  structure/config against `reference/STANDARD.md` in this skill and
  report gaps (missing hooks, no Prettier, barrel imports, `useState`-driven
  forms, etc.) instead of writing files.

Never overwrite a file that already has real content without telling the
user what would change and confirming first — these are config files a
team may have already customized.

### 2. Folder structure (feature-based by default)

Every scaffolded app is feature-based from day one — there's no
layer-based starting point and no file-count threshold to hit before
migrating. Create (only what's missing) under the project root:

```
/app                    Expo Router routes only — thin, delegates to feature screens
/src/features/<feature>/  One folder per feature — see step 3 for the shape inside
/src/components/ui      Shared design-system primitives (Button, FormField, Screen, QueryState...) — used by more than one feature
/src/hooks              SHARED/cross-cutting hooks only (useTheme, useNetworkStatus...) — feature-specific hooks live inside that feature's folder instead
/src/services/api       The shared Axios client (interceptors, base URL) + any endpoints used by more than one feature
/src/store              Zustand stores (client state only) — often cross-cutting itself (theme, auth session, onboarding flag)
/src/utils              Pure helper functions
/src/types              Shared TypeScript interfaces/types (used across more than one feature)
/src/constants          Colors, config, static strings, theme tokens
```

Read `reference/STANDARD.md` §2 for the full rationale per folder before
generating — it explains what does/doesn't belong in each one (e.g. don't
put form-local state in Zustand, don't fetch data directly in a screen).

### 3. Feature folder shape (mandatory)

Every feature — not just ones that have grown large — gets its own
folder from the start:

```
/src/features/<feature>/
  screens/       container screens for this feature (compose hooks + presentational components)
  components/    feature-local presentational components (not used elsewhere)
  hooks/         feature-local React Query hooks
  api/           feature-local API functions
  types/         feature-local types
```

`templates/src/features/example/` is a full worked example (types → api →
hook → component → screen) — copy that pattern per feature rather than
inventing a new one each time, or reaching for flat `/src/hooks`,
`/src/services/api`, `/src/screens` for anything feature-specific.

Even a brand-new app with a single feature starts this way — the point
isn't "wait until it hurts," it's a consistent per-feature seam from
commit one so two developers never collide in a shared `/src/hooks` file,
and adding feature #2 later is "copy the folder pattern," not a
mid-project restructure. Don't leave a feature split half in `/src/`
layer folders and half in `/src/features/` (pick one per feature, not
per file).

Anything genuinely shared across features (design-system primitives in
`/src/components/ui`, the base Axios client, cross-cutting stores/types)
stays in the layer-based folders from step 2 — that split doesn't go
away, it's just that no feature-specific code lives flat in `/src/hooks`
or `/src/services/api` anymore. App-shell infrastructure that isn't
really "a feature" (onboarding, auth screens, the tour overlay) also
stays in its existing flat location — see steps 6/7 and "Optional
patterns."

### 4. Navigation structure (Expo Router route groups)

Expo Router replaces a hand-rolled `RootNavigator`/`AuthStack`/`MainTabs`
setup with route groups — folders in parentheses that group screens
without adding a URL segment. Use:

```
/app
  _layout.tsx           Root Stack — declares the (auth)/(tabs)/(modals) groups
  (auth)/
    _layout.tsx         Stack for the unauthenticated flow
    login.tsx
  (tabs)/
    _layout.tsx         Tabs for the main authenticated flow
    index.tsx
  (modals)/
    settings.tsx        Anything presented as a modal from anywhere in the app
```

Copy `templates/app/` as the starting skeleton — `_layout.tsx`,
`(auth)/_layout.tsx` + `(auth)/login.tsx`, `(tabs)/_layout.tsx` +
`(tabs)/index.tsx`, `(modals)/settings.tsx`. The route files import
placeholder screens (`@/screens/Auth/LoginScreen`, etc.) — rename to
match the app's actual screens; the point being copied is the group
structure, not the placeholder screen names. The authenticated/
unauthenticated branch in `app/index.tsx` is wired against
`useAuthStore` (step 7) by default — only the actual login API call
that populates that store remains app-specific.

Also copy `templates/app/+not-found.tsx` — Expo Router's reserved
not-found convention file, styled with the same `Screen`/`Button`/
`useTheme()` primitives instead of leaving Expo Router's unstyled
default 404 for unmatched routes/deep links.

### 5. Core dependencies

Install (skip any already present):

```
npm install @tanstack/react-query zustand axios react-hook-form zod @hookform/resolvers date-fns
npm install -D prettier eslint-config-prettier eslint-plugin-simple-import-sort husky lint-staged @commitlint/cli @commitlint/config-conventional
npx expo install @react-native-async-storage/async-storage expo-splash-screen @react-native-community/netinfo expo-secure-store
```

Adjust the exact `expo`/`react-native` aligned versions with
`npx expo install <pkg>` for any Expo-managed native packages instead of
plain `npm install`, so versions stay compatible with the installed Expo
SDK — this is why AsyncStorage, `expo-splash-screen`, NetInfo, and
SecureStore are installed that way above, not via plain `npm install`.
`expo-splash-screen` and gesture handler/safe-area-context are normally
already present from `create-expo-app`'s default template; skip
re-installing if so.

AsyncStorage graduated from "supplementary, install on demand"
(`reference/LIBRARIES.md`) to core here because the onboarding-flag
persistence pattern in step 6 depends on it out of the box — every
scaffolded app needs `hasSeenOnboarding` to survive a restart. NetInfo
graduated the same way — the global offline banner in step 7 depends on
it, and every app that makes API calls benefits identically from being
able to tell "the request failed because we're offline" apart from "the
request failed because the server broke." SecureStore graduated too —
`useAuthStore` (step 7) persists the auth token through it by default now,
not AsyncStorage — see step 7 for why this is no longer a "swap it in
later" caveat.

For anything beyond this core list — bottom sheet, toast, date picker,
charts, secure storage, analytics, etc. — check
`reference/LIBRARIES.md` first instead of picking whatever comes up in a
search. It's the standard pick per common need, kept consistent across
PT PSM apps. Install those on demand when a feature actually needs them,
not speculatively at scaffold time.

### 6. Splash, Welcome & Onboarding flow (new-user first launch)

Every consumer-facing app needs this three-part first-launch sequence, and
skipping it is the most common "feels unfinished" gap in a fresh scaffold:

1. **Splash screen** — the native launch image, held open (not just shown
   momentarily) until the app has actually decided what to show next.
   Copy the pattern already wired into `templates/app/_layout.tsx`:
   `SplashScreen.preventAutoHideAsync()` at module scope, then
   `SplashScreen.hideAsync()` once BOTH persisted stores' `hasHydrated`
   state has loaded — `useAppPreferencesStore` (onboarding) and
   `useAuthStore` (session, step 7). Skipping the hydration wait is the
   bug to avoid here — without it, a returning user can see a one-frame
   flash of the onboarding flow or the login screen before the persisted
   "already seen it" / "already signed in" flags load.
2. **Welcome screen** — a single static branding screen
   (`templates/app/(onboarding)/welcome.tsx` →
   `templates/src/screens/Onboarding/WelcomeScreen.tsx`). No feature
   content here, just logo/tagline + one CTA into the onboarding carousel.
3. **Onboarding carousel** — a swipeable, skippable set of feature-highlight
   slides shown exactly once
   (`templates/app/(onboarding)/onboarding.tsx` →
   `templates/src/screens/Onboarding/OnboardingScreen.tsx`), gated by the
   `hasSeenOnboarding` flag in `templates/src/store/useAppPreferencesStore.ts`
   (persisted via `zustand`'s `persist` middleware + AsyncStorage — an
   in-memory-only flag would replay onboarding every app launch, which
   defeats the point). Slide copy lives in
   `templates/src/constants/onboardingSlides.ts`, not inline in the
   screen, so it's a one-file change to edit or translate.

Wire the route group in: copy
`templates/app/(onboarding)/_layout.tsx` + `welcome.tsx` + `onboarding.tsx`,
add `Stack.Screen name="(onboarding)"` to the root layout (already in
`templates/app/_layout.tsx`), and copy `templates/app/index.tsx` — a boot
router (`<Redirect>`) that sends the user to `(onboarding)/welcome` if
`hasSeenOnboarding` is false, otherwise to `(auth)` or `(tabs)` per the
real `useAuthStore`-backed auth check wired in step 7. Onboarding's "Mulai"
button calls `markOnboardingSeen()` then `router.replace` (not `push`) into
`(auth)` — the carousel must not be reachable via the back button once
finished.

This is scaffolded for every new project — a first-launch experience is
expected in basically every consumer mobile app, same tier as the
feature-folder structure in steps 2/3.

### 7. Auth session store + API session handling

A generic, persisted session shape is core infrastructure every app
needs, even though the actual login screen's API call is app-specific:

- Copy `templates/src/store/useAuthStore.ts` — a `zustand` `persist` store
  (same `hasHydrated` shape as `useAppPreferencesStore`, but backed by
  `expo-secure-store` instead of AsyncStorage via a small adapter, since
  their APIs don't match zustand's `StateStorage` interface directly)
  holding `token`, `isAuthenticated`, and `hasHydrated`, with
  `setSession(token)` and `clearSession()` actions. The login screen
  calls `setSession()` on a successful login response; everything else
  in the scaffold reads from this store instead of inventing its own
  auth state.
- **This is the actual default now, not a swap-in-if-needed caveat.** A
  real production app persisted its auth token in plain AsyncStorage for
  months because "swap to SecureStore once it's sensitive" was left as a
  code comment instead of the default — don't repeat that. Only
  `useAppPreferencesStore` (theme/onboarding/review-prompt flags — never
  sensitive) stays on AsyncStorage; anything holding a session token uses
  SecureStore from the start.
- `templates/src/services/api/client.ts`'s `getAuthToken()` reads
  `useAuthStore.getState().token` for real (no longer a stub), and a new
  response interceptor calls `clearSession()` + `router.replace('/(auth)/login')`
  on any HTTP 401 — an expired/revoked token bounces the user back to
  login instead of leaving a broken authenticated screen on-screen.
- `templates/app/index.tsx`'s boot router reads
  `useAuthStore((state) => state.isAuthenticated)` directly — see step 6.

Also copy `templates/src/hooks/useNetworkStatus.ts` +
`templates/src/components/ui/OfflineBanner.tsx` here (see
`reference/LIBRARIES.md`'s NetInfo entry) — mount `<OfflineBanner />` as
a sibling of `<Toast />` in `app/_layout.tsx`. Both this and the auth
store are about the app reacting to state it doesn't fully control
(server session validity, network reachability) — see
`reference/STANDARD.md` §7 for the shared rationale.

### 8. TypeScript strict mode + path aliases

Ensure `tsconfig.json` extends `expo/tsconfig.base` with `"strict": true`
and a `@/*` → `./src/*` path alias — copy the pattern from
`templates/tsconfig.json` if the project doesn't have one yet. Never
relax `strict` to make errors go away.

### 9. Anti-conflict tooling (this is the part most RN starters skip)

Copy these templates in, adapting names/scopes as needed:
- `templates/eslint.config.js` — flat config, extends `eslint-config-expo`,
  adds `simple-import-sort` (kills "who's on top of the import block"
  conflicts) and bans default/barrel re-exports.
- `templates/.prettierrc.json` + `templates/.prettierignore`
- `templates/.editorconfig`

Add to `package.json` scripts: `"format": "prettier --write .",
"typecheck": "tsc --noEmit"`.

**Why this matters**: with no enforced formatter, every PR carries
whitespace/quote-style noise on top of the real diff, which is what
actually produces conflicts and unreviewable PRs on a team — not the
business logic.

### 10. Pre-commit gate (Husky + lint-staged)

```
npx husky init
```

Then write `templates/.husky/pre-commit` and `templates/.lintstagedrc.json`
into place — pre-commit runs `lint-staged` (prettier --write + eslint --fix
on staged files only, fast) and `tsc --noEmit` on the whole project.

### 11. Commit convention + branch naming

- Write `templates/commitlint.config.js` and `templates/.husky/commit-msg`.
- Copy `templates/CONTRIBUTING.md` — documents Conventional Commits
  (`feat:`, `fix:`, `chore:`...) and branch naming
  (`feature/<ticket>-slug`, `fix/<ticket>-slug`).

This is what makes `git log` and blame useful across many apps over time,
and gives CI something structured to gate on later if needed.

### 12. CI gate (GitHub Actions)

Copy `templates/.github/workflows/ci.yml` — runs `npm ci`, `npm run
typecheck`, `npm run lint`, and `npm run test` on every PR. This is what
actually blocks a broken PR from merging, not just a local hook a
developer can skip with `--no-verify`. Unconditional now, not
`--if-present` — step 17 means a freshly scaffolded app always has a test
script, so CI no longer needs to silently skip a step that should exist.

### 13. Project-level AGENTS.md

Copy `templates/AGENTS.md` into the new project's root (renamed to fit,
`CLAUDE.md` can just be `@AGENTS.md` per the existing pattern in
`meet-manajio-mobile`) so future AI-assisted work in that repo follows the
same standard without needing this skill re-invoked every time.

### 14. Theming & design tokens

Copy `templates/src/constants/theme.ts` (colors, spacing, typography as
plain objects — light/dark palettes) and `templates/src/hooks/useTheme.ts`
(reads `useColorScheme()`, returns the active palette + tokens). Components
pull colors/spacing from `useTheme()` instead of hardcoding hex values —
this is what makes a rebrand or a dark-mode pass a one-file change instead
of a grep-and-replace across every screen.

Don't reach for a heavier theming library (styled-components,
react-native-paper's ThemeProvider) unless the project already needs one
of those for other reasons — plain objects + a hook cover the actual
requirement (centralized tokens) without adding a dependency.

### 15. Loading / empty / error state pattern

Copy `templates/src/components/ui/QueryState.tsx` — wraps a React Query
list result so every screen renders the same three non-happy-path states
(loading spinner, error + retry, empty message) instead of each screen
reinventing its own `if (isLoading)` branching. Pairs with the existing
"no full-screen blocking spinner" rule — swap the loading branch for a
skeleton once the design system has one.

Also copy `templates/src/components/ui/Screen.tsx` — a `SafeAreaView` +
padding wrapper every screen uses instead of repeating that layout
boilerplate per file.

Also copy `templates/src/components/ui/PermissionPrimer.tsx` — a generic
permission-priming card (icon, title, description, `onAllow`/`onDismiss`).
Reused for camera/microphone/notification asks by passing different copy
and wiring `onAllow` to the actual native permission request; the
component itself has no opinion on which permission it's for.

### 16. Example code (only for brand-new projects)

Copy `templates/src/features/example/` wholesale — this IS the worked
example now that feature folders are mandatory from step 2/3, not an
optional migration demo. It walks the full chain a real feature needs:
`types/` → `api/` → `hooks/` (one React Query hook) →
`components/` (one presentational component) →
`screens/ExampleFormScreen.tsx` (one RHF+Zod form screen). Also copy the
shared `templates/src/services/api/client.ts` (the base Axios client this
feature's `api/` file imports) and one presentational `ui` component with
colocated `StyleSheet`. Delete/rename `example` to the actual first
feature instead of leaving it in place.

The RHF+Zod example is composed from `templates/src/components/ui/FormField.tsx`
— the reusable field (`Controller` + themed `TextInput` + label + inline
error) every form should use instead of hand-rolling `Controller`+`TextInput`+error
text per field. This is the single highest-leverage file for actually
getting the RHF+Zod mandate followed on a deadline: a login/register
screen becomes a handful of declarative `<FormField>` lines instead of a
wall of repeated boilerplate. Keep new `ui/` components (like `FormField`
and `Button`, both copied in this step) consistent with the accessibility
baseline in `reference/STANDARD.md` §9 — `accessibilityRole`/`accessibilityLabel`,
44×44 touch targets — rather than treating accessibility as an afterthought
pass.

### 17. Testing baseline

`reference/LIBRARIES.md` already names `jest` + `jest-expo` +
`@testing-library/react-native` as the standard pick — this step makes
that concrete instead of leaving it a recommendation nobody points to.
Comes before the final sanity check (step 18) deliberately, not after —
the tsconfig change below must land before that step's `tsc` run, or
typecheck fails on every test file's `describe`/`it`/`expect` global.

Install as dev dependencies:

```
npm install -D jest jest-expo @testing-library/react-native test-renderer @types/jest
```

`test-renderer` (no `react-` prefix) is the current lightweight
replacement for the now-deprecated `react-test-renderer`, and
`@testing-library/react-native` v12.4+ has built-in Jest matchers — don't
also add `@testing-library/jest-native`, it's officially deprecated and
redundant. This kind of testing-tooling churn moves fast; re-check
current peer dependencies (`npm view @testing-library/react-native peerDependencies`)
if this install fails on a future Expo SDK.

Add `"jest"` to `tsconfig.json`'s `compilerOptions.types` array
(`"types": ["jest"]`) — `@types/jest`'s ambient globals
(`describe`/`it`/`expect`/`jest.fn()`) aren't picked up automatically on
every TS/Expo SDK combination; confirmed via `tsc --listFiles` that
without this, `tsc` fails with "Cannot find name 'describe'" across every
`.test.ts(x)` file even with `@types/jest` installed. This is why this
step exists before the sanity check, not after — `templates/tsconfig.json`
(copied in step 8) deliberately does NOT bake `"types": ["jest"]` in by
default, since that would break typecheck for any project between step 8
and this step, before `@types/jest` is even installed.

Copy `templates/jest.config.js` (the `jest-expo` preset handles the
RN/Expo-specific transform + native-module mocks a stock Jest config would
need to hand-reproduce) **and** `templates/jest.setup.js`, and add
`"test": "jest"` to `package.json` scripts — step 12's CI workflow already
runs it unconditionally. `jest.setup.js` is not optional: AsyncStorage's
native module is unavailable under Jest, so any test importing
`useAppPreferencesStore`/`useAuthStore` (or anything that transitively
imports either) fails immediately with `[@RNC/AsyncStorage]: NativeModule:
AsyncStorage is null` without it.

Copy the two worked examples as the pattern every new test should follow,
not reinvent:
- `templates/src/store/useAppPreferencesStore.test.ts` — testing a
  Zustand store directly via `getState()`, resetting state in
  `beforeEach` (stores are module singletons; state leaks across tests
  otherwise).
- `templates/src/components/ui/Button.test.tsx` — testing a
  presentational component with `@testing-library/react-native`'s
  `render`/`fireEvent`, including the "disabled/loading state suppresses
  onPress" case — exactly the kind of non-obvious interaction logic worth
  a regression test instead of only being caught by manual QA. Note this
  version of `@testing-library/react-native` makes `render()` return a
  Promise (React 19 concurrent-rendering support) — always `await render(...)`
  before querying `screen`, or `screen.getByText(...)` throws "`render`
  function has not been called" even though it was.

Business-logic hooks in `/src/hooks` (React Query hooks, custom hooks)
are the next-highest-value thing to test as the app grows — screens
usually don't need heavy coverage if their logic already lives in a
tested hook.

### 18. Sanity check

Run `npm run typecheck`, `npm run lint`, and `npm run test` after
scaffolding and report results to the user — don't declare the
boilerplate done without confirming it actually passes clean, including
the test suite from step 17, not just typecheck/lint.

## Optional patterns

Unlike the numbered steps above, these are judgment calls — copy one in
only when the app actually needs it, the same way EAS setup or i18n are
already treated as "once it's ready/needed," not scaffolded by default.

### Crash reporting hook

`templates/src/components/ErrorBoundary.tsx` always accepts an optional
`onError?: (error, info) => void` prop — this ships in the core template
as a no-op-safe seam, not gated behind an install, since it costs nothing
when unused. Wire an actual reporter once one is chosen (pick exactly one
per `reference/LIBRARIES.md`'s Crash reporting row):
- Sentry: `npx expo install @sentry/react-native`, then
  `onError={(error, info) => Sentry.captureException(error, { extra: info })}`
  where `<ErrorBoundary>` is mounted in `app/_layout.tsx`.
- Firebase Crashlytics: `npx expo install @react-native-firebase/crashlytics`,
  then `onError={(error) => crashlytics().recordError(error)}`.

Also wire the same reporter's global handler for errors outside the React
tree (unhandled promise rejections, native crashes) — that's each SDK's
own top-level init call (e.g. `Sentry.init(...)` in `app/_layout.tsx`
before the component tree mounts), not something `ErrorBoundary` can catch
since it only catches render-phase errors in its own subtree.

### Analytics wrapper

Copy `templates/src/utils/analytics.ts` once the app needs event tracking,
after `npx expo install @react-native-firebase/analytics @react-native-firebase/app`
(the standard pick per `reference/LIBRARIES.md`) and adding the native
Firebase config files. Call `trackEvent(name, params)` from screens/hooks
instead of importing the Firebase SDK directly per call site — the
wrapper resolves the native module lazily and no-ops safely (with a
dev-only console log) if it isn't installed/configured yet, so it's safe
to sprinkle `trackEvent(...)` calls into shared code paths (e.g. the root
layout's sign-up flow) before analytics is fully wired for a given build.
Swapping providers later means editing this one file, not every call
site.

### Deep linking

Only relevant once the app needs universal links / App Links or in-app
navigation from a custom-scheme URL (share links, push-notification
taps). Two independent halves:

1. **Native config** — see "iOS + Android" below for the `app.json`
   `intentFilters` (Android) / `associatedDomains` (iOS) entries.
2. **Route resolution** — copy `templates/src/hooks/useDeepLinkRoute.ts`.
   Call `useDeepLinkRoute(scheme).navigate(url)` from wherever a URL
   arrives (a push-notification tap handler, `Linking.addEventListener`,
   or a deep-link button inside the app) — it strips the app's own custom
   scheme prefix or a matched universal-link origin, normalizes to a
   leading `/`, and calls `router.push`/`router.replace`. Pass the app's
   own scheme (the same string as `app.json`'s `"scheme"` field) — this
   hook has no scheme hardcoded.

### Force update + OTA update banner

Only relevant once an app actually uses EAS Update (see "iOS + Android"
below). Copy `templates/src/components/ui/UpdateBanner.tsx` and add
`EXPO_PUBLIC_VERSION_CHECK_URL` (and, for iOS, `EXPO_PUBLIC_IOS_STORE_URL`)
to `env.ts`'s zod schema, after `npx expo install expo-updates`. The file
covers two independently-deletable concerns: a blocking, non-dismissable
force-update gate (compares the installed version against a `min_version`
fetched from the version-check endpoint) and a dismissable OTA-reload
prompt (`Updates.useUpdates()`). Delete the OTA half if the app only wants
the force-update gate without adopting EAS Update. See
`reference/STANDARD.md` §11 for the full rationale.

### Push notification hook

Copy `templates/src/hooks/usePushNotifications.ts` +
`templates/src/services/api/pushNotifications.ts` only after
`npx expo install expo-notifications` (which itself stays supplementary
per `reference/LIBRARIES.md` — not every app needs push). The hook
requests permission, registers the Expo push token to the backend once
`useAuthStore` shows the user as authenticated, and wires the two
listeners every push integration needs: tap-to-navigate (deep link via
`router.push`) and foreground arrival. Treat it as a reference pattern to
adapt, not a drop-in — the backend endpoint shape is app-specific.

### In-app review prompt helper

Copy `templates/src/utils/requestAppReview.ts` after
`npx expo install expo-store-review`. Call `maybePromptForReview()` after
a meaningful positive user action (not on every app open) — it checks
`StoreReview.isAvailableAsync()` and only ever prompts once, tracked via
the `hasPromptedReview` flag already added to
`templates/src/store/useAppPreferencesStore.ts`.

### Product tour (spotlight coach-marks)

A guided walkthrough that spotlights real UI elements across screens
("tap here to start a recording"), unlike splash/onboarding which are
near-universal — a tour is a UX judgment call that needs real per-app step
content to be worth anything; a placeholder tour left unedited is actively
confusing, unlike harmless placeholder onboarding copy. Add this only when
asked for a "product tour", "coach marks", "guided walkthrough", or
"spotlight tutorial".

If adopted, copy in:
- `templates/src/constants/tourSteps.ts` — the `TourStep` interface +
  `TOUR_STEPS` placeholder array. Replace the placeholder steps with the
  app's real screens/target ids.
- `templates/src/store/useTourStore.ts` — persisted `completed` flag +
  in-memory `isActive`/`currentStepIndex`/`targets`, mirroring
  `useAppPreferencesStore`'s persist pattern.
- `templates/src/hooks/useTourTarget.ts` + `templates/src/components/ui/TourTarget.tsx`
  — wrap any element that should be spotlight-able with
  `<TourTarget id="some-id">...</TourTarget>`, then reference that same id
  in a `TOUR_STEPS` entry's `targetId`.
- `templates/src/components/Tour/TourOverlay.tsx` — mount once as a
  sibling to `<Toast />` in `app/_layout.tsx` (a two-line diff to add only
  when this pattern is adopted — not baked into the base template).

**Starting the tour**: call `useTourStore.getState().start()` exactly once,
after splash + onboarding + auth have all resolved — starting it earlier
risks spotlighting a target on a screen the user hasn't reached yet.
There's no template file for this trigger since it depends on each app's
own auth/session flow; replicate this shape (seen in production):

```ts
useEffect(() => {
  if (isAuthenticated && !isStillLoading && !showOnboarding && !tourCompleted && !tourIsActive) {
    startTour();
  }
}, [isAuthenticated, isStillLoading, showOnboarding, tourCompleted, tourIsActive, startTour]);
```

**Dynamic-target steps**: if a step's target only exists once the user has
some data (e.g. "point at their first item"), give that step a
`resolveScreen: () => string | null` function instead of hardcoding the
resolution inside `TourOverlay` — return `null` if the step doesn't apply
yet and `TourOverlay` auto-skips to the next step.

**Target matching**: steps are matched to the current screen via Expo
Router's `usePathname()`; `TourOverlay` calls `router.push(...)` when the
current pathname doesn't match the active step's resolved target screen —
the tour drives navigation, not the other way around.

See `reference/STANDARD.md` §12 for the full rationale (continuous
measurement, spotlight geometry, why this stays opt-in).

## iOS + Android

Everything above is Expo-managed, so both platforms are covered by
default (`expo run:ios` / `expo run:android`, EAS Build/Update for
release). Two things worth flagging to the user on a brand-new app if
not already decided:
- **EAS**: copy `templates/eas.json` and set up `eas build`/`eas submit`
  profiles (`development`, `preview`, `production`) once they're ready to
  build native binaries — don't set this up speculatively before it's
  needed. Once EAS Update is actually adopted, also copy the force-update
  + OTA update banner — see "Optional patterns" above.
  `templates/eas.json` already demonstrates the per-profile `env` block
  pattern — each profile sets its own `EXPO_PUBLIC_API_URL` (local IP for
  development, staging URL for preview, production URL for production) so
  `eas build --profile preview` bakes in the right API URL at build time
  without touching `.env` files per environment. Add more
  `EXPO_PUBLIC_*` keys to each profile's `env` block as the app needs them
  (e.g. `EXPO_PUBLIC_VERSION_CHECK_URL` if the force-update banner is
  adopted) — keep each profile's block in sync with
  `src/constants/env.ts`'s zod schema so a missing var fails loudly at
  import time rather than silently at request time.
- **Config**: for apps with per-environment values (dev/staging/prod API
  URLs, bundle IDs), prefer `app.config.ts` over static `app.json` so
  config is typed and can branch on `process.env` — only worth the extra
  step once there's actually more than one environment.
- **Deep linking**: for universal/App Links, add BOTH platforms' config to
  `app.json`, not just Android (a common half-finished state):
  ```json
  {
    "expo": {
      "scheme": "yourapp",
      "ios": { "associatedDomains": ["applinks:example.com"] },
      "android": {
        "intentFilters": [
          {
            "action": "VIEW",
            "autoVerify": true,
            "data": [{ "scheme": "https", "host": "example.com", "pathPrefix": "/share" }],
            "category": ["BROWSABLE", "DEFAULT"]
          }
        ]
      }
    }
  }
  ```
  `autoVerify: true` on Android and the `applinks:` prefix on iOS are both
  required for the OS to open the app directly instead of showing a
  disambiguation prompt — this also requires hosting an
  `apple-app-site-association` file (iOS) and a
  `.well-known/assetlinks.json` file (Android) at the domain root, which
  is out of scope for this skill (backend/infra work, not app code) but
  worth flagging so it isn't missed. See "Optional patterns" → "Deep
  linking" above for the in-app route-resolution half
  (`useDeepLinkRoute.ts`).

## Files in this skill

- `reference/STANDARD.md` — the full standard with rationale (read before
  auditing an existing project or explaining *why* a rule exists)
- `reference/LIBRARIES.md` — catalog of standard library picks for common
  needs beyond the core stack (bottom sheet, toast, charts, secure
  storage, auth, analytics, testing...) — check before recommending or
  installing a library not already in the core stack
- `templates/` — copy-ready config/template files referenced above,
  including `templates/app/` (route-group navigation skeleton, including
  the `(onboarding)` group, `+not-found.tsx`, and boot-time `index.tsx`
  router), `templates/src/screens/Onboarding/` (Welcome + Onboarding
  carousel screens — app-shell, not a "feature"), `templates/src/features/example/`
  (the mandatory-by-default feature folder shape — types → api → hooks →
  components → screens — step 2/3), `templates/src/store/useAuthStore.ts` +
  `templates/src/components/ui/OfflineBanner.tsx` (core session/
  connectivity handling, step 7), `templates/src/components/ui/PermissionPrimer.tsx`
  (step 15), `templates/src/components/ui/FormField.tsx` (step 16),
  `templates/jest.config.js` + `templates/jest.setup.js` + `templates/src/store/useAppPreferencesStore.test.ts`
  + `templates/src/components/ui/Button.test.tsx` (step 17, testing
  baseline), and the optional-pattern files under
  `templates/src/components/ErrorBoundary.tsx`'s `onError` seam,
  `templates/src/utils/analytics.ts`, `templates/src/hooks/useDeepLinkRoute.ts`,
  `templates/src/components/ui/UpdateBanner.tsx`,
  `templates/src/hooks/usePushNotifications.ts`,
  `templates/src/utils/requestAppReview.ts`, and
  `templates/src/components/Tour/` + `templates/src/constants/tourSteps.ts`
  (product tour) — see "Optional patterns" for when to copy those in

# PT PSM React Native Boilerplate — Standard & Rationale

This is the long-form version of the rules in `SKILL.md`. Use it when
auditing an existing project (to explain *why* something is a gap, not
just that it's missing) or when a developer asks "kenapa harus begini?".

## 1. Core stack

| Concern | Choice | Why |
|---|---|---|
| Routing | Expo Router (file-based, `/app`) | Matches Expo's own direction; avoids hand-rolled navigation config that drifts from the folder structure. |
| Language | TypeScript, `strict: true` | Catches integration bugs (wrong prop, undefined access) before runtime, which matters more on a team than solo. |
| Server state | TanStack Query | Caching, retries, and loading/error states are handled once, centrally — not re-implemented per screen with `useEffect` + `useState`. |
| Client state | Zustand | Minimal boilerplate global state for things like theme/session flags. Not a dumping ground for server data or form state. |
| Forms | React Hook Form + Zod, via `templates/src/components/ui/FormField.tsx` | Uncontrolled-by-default form state avoids re-render storms on every keystroke; Zod gives one schema shared between validation and TS types. `FormField` is what makes the mandate practical to actually follow — a production app skipped RHF entirely and hand-rolled every form because there was nothing concrete to compose from. |
| Styling | `StyleSheet.create` colocated at bottom of the same `.tsx` file | A component and its styles are one unit of change — splitting them means every style tweak touches two files, which increases merge-conflict surface for no benefit (unless NativeWind/Tailwind is the project's chosen system). |
| Lists | FlashList (fallback: FlatList) | `ScrollView` for dynamic lists causes FPS drops and is a recurring code-review flag; catch it at scaffold time instead. |
| Animation | react-native-reanimated | Runs on UI thread, avoids JS-thread jank for anything more than a fade. |
| Testing | Jest (`jest-expo` preset) + `@testing-library/react-native` | See `SKILL.md` step 17 for the worked examples — a recommendation with no concrete example next to it doesn't survive contact with a deadline any better than an unenforced format rule does. |

## 2. Folder structure — what belongs where

Feature-based from day one — see §2b. Every piece of feature-specific
code (a screen, a hook, an API call, a component only that feature uses)
lives in `/src/features/<feature>/`, not flat in `/src/hooks`,
`/src/services/api`, or `/src/screens`. The layer folders below are for
what's genuinely shared across more than one feature, or app-shell
infrastructure that isn't really "a feature" (onboarding, auth screens,
the splash/tour overlay):

- **`/app`**: routing only. A route file should import a feature screen
  from `/src/features/<feature>/screens/` (or an app-shell screen from
  `/src/screens/` — e.g. onboarding, §6) and render it, plus wire up
  route params / layout. If a route file has business logic in it, that
  logic escaped its proper home — move it to a hook or the screen
  component.
- **`/src/components/ui`**: shared design-system primitives (Button,
  FormField, Card, Modal shell, `Screen`, `QueryState`) used by more than
  one feature. Presentational, reusable, ideally prop-driven with no
  direct data-fetching.
  - *Optional future evolution*: once `/src/components/ui` has enough
    primitives that flat is getting hard to navigate, some teams split it
    into an atomic-design tier (`atoms/` → `molecules/` → `organisms/`).
    Valid, but don't start there — it's structure for a problem
    (navigating a large design system) that a small/new app doesn't have
    yet. Introduce it only once the flat `ui/` folder is actually painful.
- **`/src/hooks`**: SHARED/cross-cutting hooks only (`useTheme`,
  `useNetworkStatus`) — a hook specific to one feature's data lives in
  that feature's own `hooks/` folder instead (§2b). This is still the
  seam that lets two developers work on the same screen's UI and its data
  logic without touching the same lines; it's just scoped per-feature by
  default now instead of one shared bucket every feature's hooks pile
  into.
- **`/src/services/api`**: the shared Axios instance (interceptors, base
  URL, auth header injection) plus any endpoint used by more than one
  feature. Feature-specific endpoints live in that feature's own `api/`
  folder and import this shared client. Screens and hooks never call
  `axios` directly.
- **`/src/store`**: Zustand stores. If you're tempted to put server data
  (a list fetched from an API) here, it belongs in React Query instead —
  Zustand is for client-only state that has no "source of truth on a
  server" (theme, onboarding-seen flag, active tab). `useAuthStore` (see
  §7) is the canonical example of a session *shape* that's client-only
  even though it's populated by a server response — the store just holds
  the last-known token/flag, it isn't the source of truth for whether
  that token is still valid server-side.

### 2a. State management — three categories, not two

Every piece of state falls into exactly one of these; putting it in the
wrong bucket is the most common review flag on RN codebases:

| Category | Lives in | Examples |
|---|---|---|
| Local | `useState`/`useReducer` inside the component | a text input's draft value, whether a dropdown is open, form state (via React Hook Form) |
| Global (client) | Zustand (`/src/store`) | theme, active tab, onboarding-seen flag, feature flags read at runtime |
| Server | TanStack Query (a feature's `hooks/`, or `/src/hooks` if genuinely shared) | anything fetched from an API — lists, profiles, any data whose source of truth is the backend |

If a value can be derived from server state or local state, don't
duplicate it into Zustand "for convenience" — that's the shape of bug
where two copies of the same fact drift out of sync.
- **`/src/utils`**: pure functions, no React, no side effects.
- **`/src/types`**: shared interfaces/types used across more than one
  feature. Type used in exactly one feature stays colocated in that
  feature's own `types/` folder.
- **`/src/constants`**: colors, spacing, static config values, string
  tables.

### 2b. Feature folders are the default, not a later migration

Every feature — including the very first one in a brand-new app — gets
its own folder from the start:
`/src/features/<feature>/{screens,components,hooks,api,types}` (same
layer names as the shared folders above, just nested per-feature). See
`templates/src/features/example/` for the full worked example (types →
api → hooks → components → screens).

This is a deliberate change from treating feature folders as an
optional, app-size-dependent upgrade: waiting for a threshold ("migrate
once a feature's files outnumber 2–3 each") means every app spends its
early life on the layer-based structure this section used to describe as
the default, and the migration itself becomes a chore nobody schedules.
Starting feature-based avoids the migration entirely — adding feature #2
is "copy the folder pattern," not a restructure — at the cost of a bit
more up-front folder nesting for a one-feature app, which is a cheap
trade.

Don't leave a feature split half in `/src/` layer folders and half in
`/src/features/` — pick the feature folder for anything specific to that
feature, and reserve the layer folders in §2 strictly for what's shared
across more than one feature or is app-shell infrastructure (splash,
onboarding, auth screens, the product tour) rather than a business
feature.

### 2c. Navigation — route groups as the file-based RootNavigator

Expo Router's route groups (`(auth)`, `(tabs)`, `(modals)` — folders in
parentheses that don't add a URL segment) are the file-based equivalent
of a hand-rolled `RootNavigator` with an `AuthStack`/`MainTabs` split:
same concept (separate the unauthenticated flow, the main tabbed flow,
and modal presentations), but there's no separate navigation-config file
that can drift out of sync with the actual screens — the folder
structure *is* the navigation structure. See `templates/app/` for the
skeleton (`_layout.tsx` per group + a root `_layout.tsx` that declares
all three).

`app/+not-found.tsx` is a sibling of these route groups — Expo Router's
reserved convention file for any URL/deep link that doesn't match a
route, styled with the app's own `Screen`/`Button`/`useTheme()` instead
of the framework's unstyled default.

### 2d. Enforcing feature isolation with ESLint

§2b makes feature folders mandatory, but a folder *convention* alone
doesn't stop a developer from reaching into another feature's internals
under deadline pressure — exactly the point at which social conventions
tend to erode. `templates/eslint.config.js` enforces it at lint time via
`eslint-plugin-boundaries`'s `boundaries/dependencies` rule: a file
inside `src/features/<feature>/` may import from its own feature or any
shared layer folder (§2), but not from inside a *different* feature
folder — that's a lint error, not a code-review nitpick someone has to
remember to raise.

The same-vs-different-feature comparison uses the rule's `captured`
value (`{{ from.element.captured.feature }}`, interpolated from the
`feature` element's `capture: ['feature']` pattern), not a hardcoded
per-feature allow-list — the rule needs zero edits as features are added
or removed, unlike a naive path-based restriction that would need one
new entry per feature. `boundaries/dependencies` only governs
dependencies *between the declared internal element types*
(`feature`/`shared`/`app`); an unconfigured `boundaries/external` means
node_modules imports are unaffected.

Requires `eslint-import-resolver-typescript` alongside
`eslint-plugin-boundaries` so the plugin can resolve the `@/*` → `./src/*`
path alias when classifying an import target — without it, aliased
imports don't get matched against `boundaries/elements`' patterns and the
rule silently under-enforces.

## 3. Anti-conflict tooling — what each piece actually prevents

- **Prettier (enforced via pre-commit, not just "please format your
  code")**: eliminates whitespace/quote-style diffs, which is the single
  biggest source of noisy, hard-to-review PRs and false merge conflicts
  on a multi-developer repo.
- **ESLint + `simple-import-sort`**: two developers adding imports to the
  same file at different times naturally produce import-order conflicts;
  auto-sorting removes the judgment call entirely.
- **No barrel imports (`index.ts` re-export files)**: barrel files become
  a single file everyone edits when adding any new component, which is a
  concentrated conflict point and also bloats the JS bundle. Import
  directly from source.
- **Husky pre-commit + lint-staged**: catches formatting/lint issues
  before they're committed, so they never reach a PR at all. Runs only
  on staged files, so it stays fast.
- **Commitlint (Conventional Commits)**: `feat:`, `fix:`, `chore:`,
  `refactor:` prefixes make `git log`/changelogs meaningful across many
  repos over time, and are a prerequisite if this ever needs automated
  changelogs or semantic versioning.
- **Branch naming (`feature/<ticket>-slug`, `fix/<ticket>-slug`)**: makes
  it obvious what a branch is for without opening it, and keeps PR titles
  consistent.
- **CI gate (typecheck + lint on every PR)**: a local pre-commit hook can
  be skipped with `--no-verify`; CI is the backstop that can't be
  bypassed by an individual developer, which matters once more than one
  person can push.

## 4. Theming & Styling

### 4a. Design tokens

Colors, spacing, and typography live in `/src/constants/theme.ts` as
plain objects (light/dark palettes), read through a `useTheme()` hook
(`/src/hooks/useTheme.ts`) rather than hardcoded per component. This is
the difference between a rebrand/dark-mode pass being a one-file change
versus a grep-and-replace across every screen. See
`templates/src/constants/theme.ts` and `templates/src/hooks/useTheme.ts`.
Don't add a full theming library (styled-components, a `ThemeProvider`
from a UI kit) unless the project already pulls one in for other
reasons — plain objects + a hook are enough for the actual requirement.

### 4b. Styling patterns

- **Colocation**: `StyleSheet.create({...})` at the bottom of the same
  `.tsx` file as the component, not in a separate `.styles.ts`. A
  component and its styles are one unit of change — splitting them means
  every style tweak touches two files, which increases merge-conflict
  surface for no benefit. Every template in this skill follows this
  (`Button.tsx`, `OfflineBanner.tsx`, `FormField.tsx`...); don't introduce
  a separate styles-file convention partway through a project.
- **Variant/conditional styling via style arrays**, not template
  literals or a `classnames`-style helper: `style={[styles.base,
  isActive && styles.active, disabled && styles.disabled]}`.
  `RN`'s `StyleSheet` flattens an array at render time and falsy entries
  are simply skipped, so this composes cleanly without a library. See
  `templates/src/components/ui/Button.tsx` (`pressed && styles.pressed`)
  and `templates/src/components/ui/FormField.tsx` (`error ? colors.danger
  : colors.border`) for the pattern in practice — one static `styles.x`
  per visual state, composed at the call site, not a giant conditional
  object built inline.
- **Type style props as `StyleProp<ViewStyle>` / `StyleProp<TextStyle>`**
  (not `ViewStyle` alone) on any reusable component that accepts a
  `style` override — `StyleProp` is what allows the caller to pass an
  array (`[styles.card, customStyle]`), not just a single object. See
  `templates/src/components/ui/Screen.tsx`'s `style?: ViewStyle` for a
  case where a single object is deliberately enough (it's an internal
  merge point, not exposed for external array composition) versus a
  component meant to be styled from outside, which should widen to
  `StyleProp`.
- **Don't build a style object inline inside `renderItem`** (or any
  per-item render function) — a fresh object every render defeats
  `StyleSheet.create`'s one-time-registration optimization and creates
  unnecessary props diffing. Reference static `styles.x` from a
  `StyleSheet.create` call declared outside the render function, same
  rule as "no inline function in `renderItem`" already covers for
  callbacks.
- **`NativeWind`/Tailwind is a per-project choice, not a default** — this
  skill's own templates use plain `StyleSheet.create` + theme tokens
  throughout, and that's sufficient for most PT PSM apps. Reach for
  NativeWind specifically when: the team already writes Tailwind daily on
  a companion web app and wants one mental model across both, or the app
  leans heavily on utility-class-style rapid layout iteration (lots of
  one-off spacing/flex tweaks) where `StyleSheet.create` boilerplate
  genuinely slows iteration down. Don't adopt it just because it's
  popular — once adopted, apply it consistently across the whole app
  (mixing `StyleSheet.create` and `className` per-screen is worse than
  either alone, since a reviewer can no longer assume one styling
  mental model app-wide).

## 5. UI/UX & error handling

- No blocking full-screen spinners — skeleton loaders or per-button
  `isPending` states, so the rest of the UI stays interactive.
- Every screen that renders a fetched list handles three explicit states —
  loading, error (with retry), empty — the same way, via
  `templates/src/components/ui/QueryState.tsx`, instead of each screen
  ad-hoc branching on `isLoading`/`isError`/`data.length`. An unhandled
  empty state is what makes an app look broken/unfinished even when
  nothing has actually crashed.
- Every screen wraps its content in `templates/src/components/ui/Screen.tsx`
  (`SafeAreaView` + standard padding) instead of repeating that layout
  boilerplate per screen.
- No system `alert()` — a custom Toast/Snackbar component so error/success
  feedback matches the app's own visual language and can be styled/queued.
- Wrap risky trees in Error Boundaries; API calls always handle the error
  path (via React Query's `isError`/`onError`), never assume the happy
  path only. `ErrorBoundary`'s `onError` prop is a no-op-safe seam for
  wiring a crash reporter (Sentry/Crashlytics) once one is chosen — see
  "Optional patterns" → "Crash reporting hook" in `SKILL.md`.
- Ask for a permission with context first, not cold — a native permission
  dialog shown with zero explanation has a lower accept rate than one
  preceded by a short "here's why we need this" screen/card. Use
  `templates/src/components/ui/PermissionPrimer.tsx` (icon, title,
  description, `onAllow`/`onDismiss`) for this — it takes no opinion on
  *which* permission, so the same component serves camera, microphone,
  and notification asks by passing different copy and wiring `onAllow` to
  the actual `expo-camera`/`expo-audio`/`expo-notifications` request.

## 6. Splash, Welcome & Onboarding

Every consumer-facing app has a first-launch sequence: a native splash
screen, a static welcome screen, and a skippable onboarding carousel
introducing the app's value before the user reaches auth. This is a
required part of the scaffold, not an optional add-on — an app with no
onboarding still needs a splash-hold pattern so it doesn't flash the wrong
screen at launch.

- **Splash screen**: `expo-splash-screen`'s `preventAutoHideAsync()` is
  called at module scope in `app/_layout.tsx`, before the component tree
  even renders, and `hideAsync()` is only called once the app has actually
  decided what's behind it — not on a fixed timer. Concretely, that means
  holding it until **both** `useAppPreferencesStore` and `useAuthStore`
  (§7) have finished rehydrating from AsyncStorage (see below). A splash
  screen hidden before that decision is made is what causes the classic
  bug where a returning user sees onboarding — or the login screen,
  before their session loads — flash for one frame before snapping to
  their real destination. Adding a second persisted store later (as this
  scaffold does for auth) means updating this hold condition too; it's
  not a one-time wire-up.
- **Welcome screen**: one static screen (logo, tagline, single CTA) — no
  feature content, no logic beyond navigating into onboarding. Feature
  highlights belong in the carousel, not here; conflating the two makes
  both harder to edit independently.
- **Onboarding carousel**: a swipeable, skippable set of slides, shown
  **exactly once** per install. "Shown once" is a persistence requirement,
  not just a UI detail — the `hasSeenOnboarding` flag lives in Zustand
  (`/src/store`, per the state-category table in §2a: it's client-only,
  no server source of truth) but must be wrapped in `persist` +
  `createJSONStorage(() => AsyncStorage)`, not left as plain in-memory
  Zustand state. An unpersisted flag resets to `false` on every cold start,
  which means onboarding replays every launch — a bug that's easy to miss
  in dev (where the app rarely fully restarts) and obvious in production.
- **Finishing onboarding**: call `markOnboardingSeen()` then
  `router.replace(...)` (not `push`) into the auth/main flow. Using
  `replace` means the onboarding route is no longer in the stack, so the
  hardware/gesture back button can't return to it — consistent with the
  general back-stack-behavior rule in `AGENTS.md` §C.
- **Boot-time routing**: `app/index.tsx` reads `hasSeenOnboarding` and
  `useAuthStore`'s `isAuthenticated` (§7) and issues a `<Redirect>` to
  exactly one of `(onboarding)/welcome`, `(auth)/login`, or `(tabs)` — this
  replaces a hand-rolled "which screen do I show first" check that would
  otherwise live awkwardly inside a screen component.
- A 3-slide onboarding carousel is a short, fixed-length list — rendering
  it with `FlatList`/`Animated.FlatList` does not conflict with the
  "FlashList for long lists" rule in §1; that rule targets long/dynamic
  data, not a handful of static slides.
- Animate the dot indicator by driving a Reanimated shared value off
  scroll position (`useAnimatedScrollHandler` + `useAnimatedStyle`) instead
  of re-rendering a JS `useState` index on every scroll frame — this is
  the concrete case the `react-native-reanimated` rule in §1 is protecting
  against.

See `templates/app/(onboarding)/`, `templates/src/screens/Onboarding/`,
`templates/src/constants/onboardingSlides.ts`, and the updated
`templates/src/store/useAppPreferencesStore.ts` /
`templates/app/_layout.tsx` / `templates/app/index.tsx` for the full
worked pattern.

## 7. Session & Connectivity

Two related concerns that are both about the app reacting to state it
doesn't fully control — server-side session validity, and network
reachability — rather than state it owns outright:

- **Auth session store**: `templates/src/store/useAuthStore.ts` holds a
  generic, persisted session shape (`token`, `isAuthenticated`,
  `hasHydrated`) using the same `persist` + `hasHydrated` pattern as
  `useAppPreferencesStore` (§6), but a **different storage backend** —
  `expo-secure-store` (iOS Keychain / Android Keystore, encrypted at rest)
  via a small adapter, not AsyncStorage. This is scaffolded by default now
  — a *shape* to hold a session in is infrastructure every app needs, even
  though the actual login screen's API call (what hits the backend, what
  the request/response payload looks like) stays entirely app-specific and
  out of scope. The login screen's only job, once wired, is calling
  `setSession(token)` on success.
  - Don't conflate this with `useAppPreferencesStore`, which correctly
    stays on AsyncStorage — theme/onboarding/review-prompt flags have
    nothing sensitive in them. A token does, which is the entire reason
    the two stores use different backends despite sharing the same
    `persist`/`hasHydrated` shape. This isn't a hypothetical risk: a real
    production app persisted its token in plain AsyncStorage for months
    because the SecureStore swap was left as a "do this once it matters"
    code comment instead of the actual default — treat that as the
    cautionary case for why this default exists.
- **401 → clear session → redirect**: `templates/src/services/api/client.ts`'s
  Axios response interceptor calls `useAuthStore.getState().clearSession()`
  and `router.replace('/(auth)/login')` on any HTTP 401. Clearing the
  session without redirecting (a partial fix seen in practice) leaves a
  broken authenticated screen on-screen with no valid token behind it —
  the redirect is the half that actually resolves the situation for the
  user.
- **Global offline banner**: `templates/src/hooks/useNetworkStatus.ts` +
  `templates/src/components/ui/OfflineBanner.tsx`, mounted once in the root
  layout next to `<Toast />`. This is an *ambient* signal, not a
  replacement for per-request error handling — a screen's own `QueryState`
  error branch (§5) still fires on a failed request regardless of whether
  the banner is showing; the banner just answers "why is everything
  failing right now" at a glance instead of leaving the user to guess
  whether it's their connection or the server.
- Both patterns persist only what's safe to keep across a restart
  (`token`/`isAuthenticated` via `partialize`, not the full auth state) and
  both gate the splash-hold in §6 — see that section for why a second
  persisted store changes the hold condition, not just adds a new file.

## 8. Naming

- Components/screens: `PascalCase.tsx`
- Hooks/utils: `camelCase.ts` (hooks always prefixed `use`)
- Constants: `UPPER_SNAKE_CASE`
- Branches: `feature/`, `fix/`, `chore/` + short kebab-case slug

## 9. Accessibility

Baseline rules every screen/component should follow — not exhaustive WCAG
compliance, but the handful of rules that cost near-nothing to apply from
the start and are expensive to retrofit later:

- **Icon-only interactive elements require `accessibilityLabel`.** A
  `Pressable`/`TouchableOpacity` wrapping only an icon (no visible text)
  is silent to a screen reader without one — e.g. a tab bar icon, a header
  back button, a trailing show/hide-password toggle. Text-labeled buttons
  (`Button.tsx`) don't strictly need an explicit one since the label text
  itself is read, but should still expose `accessibilityRole="button"` so
  assistive tech announces them as actionable, not just static text.
- **Minimum 44×44 touch target** (iOS HIG / Android accessibility
  guidance converge on this number). A visually small icon button (say
  24×24) should still have at least a 44×44 hit area via `hitSlop` or
  padding — don't shrink the tappable area to match the visual icon size.
- **Don't disable `allowFontScaling`.** Respect the user's OS-level text
  size setting by default; only cap scaling with `maxFontSizeMultiplier`
  on layouts that would genuinely break (rare), never disable it outright
  just to keep a design pixel-perfect — that actively harms low-vision
  users who rely on larger system text.
- **Screen-reader-friendly error/state announcements.** A validation error
  that only appears as new text below a field (as in `FormField.tsx`, §1)
  should carry `accessibilityLiveRegion="polite"` so it's announced
  automatically when it appears, not just visually rendered — a
  screen-reader user tabbing past the field before the error renders would
  otherwise never hear about it. Same for the global `OfflineBanner` (§7)
  — its appearance/disappearance is itself the kind of ambient state
  change that should be announced, not just animated in. Note
  `accessibilityLiveRegion` is Android-strong/iOS-partial — VoiceOver's
  real equivalent is `AccessibilityInfo.announceForAccessibility`, so this
  is a partial cross-platform improvement, not full parity.

`Button.tsx`, `PermissionPrimer.tsx`, and `OfflineBanner.tsx` already carry
these baseline props — keep new custom components added to `/src/components/ui`
consistent with them rather than treating accessibility as a separate pass
at the end. See §11's audit checklist for what to flag when auditing an
existing project against this section.

## 10. Performance

### 10a. Measure before optimizing — the rule this section leads with

Don't suggest memoization (`useMemo`/`useCallback`/`React.memo`), a
re-render fix, or any other performance change speculatively — only after
profiling has actually located the specific component/render causing a
reported problem. Concretely, don't:
- Wrap a component in `React.memo` or a value in `useMemo` "just in case"
  when nothing has been measured. Every `useMemo`/`useCallback` has a cost
  too (a dependency-array comparison every render) — for a cheap
  computation or a component that rarely re-renders, the "optimization"
  can net slower, not faster, while definitely adding complexity for a
  problem that doesn't exist yet.
- Treat component tree depth, prop-drilling depth, or "this looks
  expensive" as performance evidence on its own. None of these correlate
  reliably with an actual dropped frame or slow interaction.
- Recommend a broad change (adopting the React Compiler, restructuring
  state, splitting a context) in response to a vague "app terasa
  lambat" report — first reproduce it, then profile, then fix the
  specific thing the profile points at.

The actual workflow when a real performance complaint comes in: **measure
→ fix the one thing the measurement points at → re-measure → confirm the
fix actually helped** before moving to the next thing. React DevTools'
Profiler tab (or Flipper's React DevTools plugin) is the first tool to
reach for — it shows which component actually re-rendered and why, which
is almost always more specific and more correct than guessing from
reading the component tree.

### 10b. Native-level profiling (rare, for Expo-managed apps)

Xcode Instruments (Time Profiler, Allocations) and Android Studio's
Profiler are for once JS-level profiling has already ruled out a JS-side
cause and the suspicion is native — this should be uncommon for an
Expo-managed app that isn't shipping custom native modules. Don't reach
for native-level profiling first; it's a much higher-effort tool for a
narrower class of problem than most reported slowness turns out to be.

### 10c. Bundle size

The barrel-import ban (§3) has a second justification beyond merge
conflicts: a barrel file (`index.ts` re-exporting a whole folder) also
defeats tree-shaking, since a bundler can't always statically prove which
re-exported members a given import site actually uses, and ends up
including more of the folder than necessary. Importing directly from the
source file avoids this in addition to the conflict-surface reason
already given.

Apply the same measure-first principle to bundle size specifically —
don't guess what's bloating the bundle. Run `npx expo export` then
inspect the output with `source-map-explorer` (or
`react-native-bundle-visualizer`) to see actual composition before
removing/replacing a dependency on suspicion alone.

### 10d. React Compiler & concurrent React

The React Compiler (stable with React 19 / enabled via
`experiments.reactCompiler` in `app.json` on Expo SDK versions that
support it) auto-memoizes components and values, which reduces how often
manual `useMemo`/`useCallback` is actually needed. Check whether the
project's Expo SDK/React version already has it enabled before manually
optimizing re-renders component-by-component — it may already be handled.

For keeping input responsive during an expensive re-render (e.g.
filtering a long list while the user is still typing in a search field),
`useTransition`/`useDeferredValue` are the current, built-in alternative
to hand-rolling a debounce — reach for these before adding a debounce
utility dependency for this specific case.

## 11. Auditing an existing project against this standard

When asked to audit, check for (and report as gaps, don't silently fix
without confirming):
1. Does `tsconfig.json` have `strict: true` and a `@/*` path alias?
2. Is there a Prettier config, and is it actually wired into a pre-commit
   hook (not just present but unused)?
3. Does ESLint run with import sorting, and are there barrel `index.ts`
   re-export files that shouldn't exist?
4. Is there a Husky `pre-commit` and `commit-msg` hook installed
   (`.husky/` directory), or just documented conventions nobody enforces?
5. Is there a CI workflow gating PRs on lint/typecheck/test?
6. Do screens under `/app` (or the routing folder) contain business logic
   that should have moved to a feature's `hooks/`/`screens/` (or
   `/src/hooks` for genuinely shared logic)?
7. Is server state living in Zustand instead of React Query anywhere (or
   vice versa — form-local state pushed into Zustand)?
8. Any manual `useState`-driven complex forms that should be
   React Hook Form + Zod? If RHF is used but every field still hand-rolls
   its own `Controller`+`TextInput`+error text, flag that `FormField.tsx`
   isn't being used either — that's the same anti-pattern one level down.
9. Any `ScrollView` rendering a long/dynamic list that should be
   FlashList/FlatList?
10. Any `alert()` calls that should be a Toast/Snackbar?
11. Are colors/spacing hardcoded per-component instead of read from a
    centralized theme?
12. Do list screens handle loading/error/empty explicitly, or do they
    silently render nothing (looks broken) on an empty/error response?
13. Is feature-specific code (hooks, API calls, components, screens)
    living flat in `/src/hooks`, `/src/services/api`, or `/src/screens`
    instead of `/src/features/<feature>/`? Per §2/§2b this is the default
    from day one now, not an app-size-dependent upgrade — flag it as a
    gap regardless of how small the app is, not just as a suggestion.
    Also check for `eslint-plugin-boundaries` (§2d) — is it actually
    installed and configured, or does the feature-folder convention rely
    entirely on developers remembering not to cross-import?
14. Does the app hold the splash screen until app-ready state (e.g.
    persisted-store hydration) instead of hiding it on a fixed timer or
    immediately on mount? Is there a welcome/onboarding flow at all for
    first-time users, and if so, is `hasSeenOnboarding` actually persisted
    (AsyncStorage-backed `persist` middleware) rather than plain in-memory
    Zustand state that would replay onboarding every launch?
15. Does a 401 response actually redirect to login (not just clear stored
    credentials and leave a broken authenticated screen on-screen)? Is
    there a global offline banner reflecting connectivity state, or does
    the app only handle failed-request errors per-screen with no ambient
    signal of *why* requests are failing?
16. Is the auth token stored via `expo-secure-store`, or plain AsyncStorage
    (or worse, a raw in-memory-only fallback)? Is there a jest config plus
    at least one real test, or does the app only have `LIBRARIES.md`'s
    testing recommendation sitting unused with nothing to point at?
17. Any icon-only touchable missing an `accessibilityLabel`? Any touch
    target visually or actually under 44×44? Any `allowFontScaling={false}`
    without a specific justification comment? (See §9.)
18. Any `useMemo`/`useCallback`/`React.memo` in the codebase with no
    comment or evidence tying it to an actual measured problem? Per §10,
    flag speculative memoization the same way an unjustified premature
    abstraction would be flagged — it's added complexity, not a free win.
    Has bundle size ever actually been inspected (`source-map-explorer`
    or similar), or is "the bundle is probably fine" an assumption nobody
    has checked?

## 12. Force update & OTA updates (EAS Update apps only) — optional

Only relevant once an app actually uses EAS Update — see `SKILL.md`'s
"Optional patterns" section for when to add it, and the "iOS + Android"
section below for the EAS Build/Update decision itself.

- **Two independent concerns, one file**: `templates/src/components/ui/UpdateBanner.tsx`
  covers a blocking, non-dismissable force-update gate (the installed
  version is below a `min_version` the backend returns) and a
  dismissable OTA-reload prompt (`expo-updates`'s `Updates.useUpdates()`
  has fetched a new JS bundle). They're deliberately kept as two separate
  blocks in one file rather than merged, so an app that only wants the
  force-update gate (no EAS Update at all) can delete just the OTA half.
- **Parameterized, not hardcoded**: the version-check endpoint is a new
  `EXPO_PUBLIC_VERSION_CHECK_URL` entry in `env.ts`'s zod schema — same
  "validate once at import time" rationale as the existing
  `EXPO_PUBLIC_API_URL` entry. Store URLs/IDs are env vars too, never
  hardcoded app-store IDs baked into the template.
- **Force-update is blocking on purpose** (no dismiss) — a user below the
  minimum supported version genuinely cannot be allowed to continue,
  unlike the OTA-reload prompt, which is dismissable since "restart to get
  new features" isn't equally urgent.
- **Re-checks on foreground**, not just app launch — `AppState`'s `change`
  listener re-runs the version check whenever the app returns to the
  foreground, so a force-update pushed while the app was backgrounded is
  caught without requiring a full relaunch.

## 13. Product tour (spotlight coach-marks) — optional

Unlike splash/onboarding/auth (§6/§7), a guided in-app tour that
spotlights real UI elements is an opt-in pattern, not part of the default
scaffold — see `SKILL.md`'s "Optional patterns" section for when to add
it. Adopt this only when there's an actual per-screen walkthrough worth
building; a placeholder tour with generic steps is worse than no tour,
unlike placeholder onboarding slides, which are harmless generic copy.

The pattern, when adopted:

- **Store** (`useTourStore`): only the `completed` flag is persisted (via
  `persist` + AsyncStorage, same as `hasSeenOnboarding` in §6) —
  `isActive`/`currentStepIndex`/`targets` are in-memory only, because the
  tour always restarts from step 0 rather than resuming mid-tour.
- **Continuous measurement, not measure-once**: `useTourTarget` re-measures
  a target's on-screen position every 150ms for up to 4s while it's the
  active step's target, instead of measuring once on layout. A screen
  transition animation can still be moving very slowly near its end, so
  two consecutive reads can look identical while the element hasn't
  actually settled — continuous measurement self-corrects until it has.
- **Dynamic targets via `resolveScreen`**: a step whose target depends on
  runtime data (e.g. "the user's first item," which may not exist yet)
  should NOT hardcode that resolution logic inside `TourOverlay` — that
  couples a generic overlay component to one app's data model. Instead
  give that step a `resolveScreen: () => string | null` function on its
  `TourStep` entry; `TourOverlay` calls it each render and treats `null` as
  "this step doesn't apply right now," auto-advancing past it. Steps
  without `resolveScreen` just use their static `screen` field.
- **Navigation follows the tour, not vice versa**: `TourOverlay` reads the
  current route via Expo Router's `usePathname()`, compares it against the
  active step's resolved target screen, and calls `router.push` when they
  differ — the tour drives the user to each step's screen automatically
  rather than requiring the user to already be there.
- **Starting the tour**: there's no template file for exactly when to call
  `useTourStore.getState().start()`, because it depends on each app's own
  auth/session flow — the guidance is to start it once, after splash +
  onboarding + auth have all resolved to their final state (see
  `SKILL.md`'s worked example). Starting earlier risks spotlighting a
  screen the user can't reach yet.
- **Geometry**: the spotlight rect is clamped to screen bounds, and the
  tooltip card is placed above or below the target based on available
  space (never overlapping it) with its max height capped to whatever
  space is actually available on the chosen side — see
  `templates/src/components/Tour/TourOverlay.tsx` for the exact math.

Colors, spacing, and copy in the tour overlay pull from `useTheme()` and
plain string constants (`templates/src/constants/tourSteps.ts`) — same
theming approach as everywhere else in this boilerplate (§4), not a
separate one-off styling system.

## 14. Monorepo (multiple apps / shared packages) — optional

Solves a different problem than the feature-folder structure in §2b —
that's about organizing code *within* one app; a monorepo is about
sharing code *across* more than one app. Don't reach for this until
there's a genuine second app (or package consumer) — a single growing
app stays inside its own repo with the feature-folder structure, no
matter how large it gets.

- **Workspace tool: npm workspaces**, not pnpm/Yarn/a dedicated
  task-runner, by default — this boilerplate is already an `npm install`
  shop, and workspaces need zero additional tooling beyond what's already
  there. pnpm's default isolated-install strategy (strict, non-hoisted
  `node_modules` via symlinks) has a live, currently-unresolved friction
  point with some React Native libraries' autolinking, which expects a
  flatter `node_modules` shape; `nodeLinker: hoisted` in
  `pnpm-workspace.yaml` is the workaround if a team prefers pnpm anyway
  for other reasons.
- **Metro no longer needs manual monorepo config** on current Expo SDKs
  (52+) — this used to require hand-editing `metro.config.js` with
  `watchFolders`/`nodeModulesPaths`/`disableHierarchicalLookup` to make
  Metro resolve packages hoisted to the workspace root; `expo/metro-config`
  now does this automatically. Treat any of those three options found in
  an existing project's `metro.config.js` as legacy cruft to remove, not
  a pattern to copy into a new one.
- **Structure**: `apps/<app-name>/` per Expo app (this boilerplate's
  existing steps 1-18 scaffold each one, unchanged), `packages/<name>/`
  per genuinely-shared package. The bar for moving something into
  `packages/` is a *second* real consumer, not "this might be reused
  someday" — the same anti-speculation principle that governs everything
  else in this standard (LIBRARIES.md's "don't install/add anything
  speculatively," feature folders not migrating preemptively, etc.)
  applies here too. `useAuthStore` is the common case worth calling out
  explicitly: even across two apps hitting the same backend, each app
  usually has its own session lifecycle (a consumer app and an internal
  admin tool don't typically share a login session), so it stays
  app-local unless there's a concrete reason two apps need to share one
  session.
- **Turborepo/Nx are a "once it hurts" upgrade, not a default** — for a
  small number of apps and one team, plain `npm run` scripts across
  workspaces (invoked directly, or via a root script that loops over
  `apps/*`) are enough. Turborepo earns its keep once CI is repeatedly
  re-typechecking/re-linting/re-testing packages that didn't change on a
  given PR and the wasted time is actually noticeable — its build cache
  and task graph solve exactly that. Nx is a bigger step (generators,
  a deeper affected-graph model) worth it only once a team wants that
  machinery specifically, not as a default "more tooling is more
  professional" choice.

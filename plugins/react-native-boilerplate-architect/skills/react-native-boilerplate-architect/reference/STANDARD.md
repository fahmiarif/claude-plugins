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
| Forms | React Hook Form + Zod | Uncontrolled-by-default form state avoids re-render storms on every keystroke; Zod gives one schema shared between validation and TS types. |
| Styling | `StyleSheet.create` colocated at bottom of the same `.tsx` file | A component and its styles are one unit of change — splitting them means every style tweak touches two files, which increases merge-conflict surface for no benefit (unless NativeWind/Tailwind is the project's chosen system). |
| Lists | FlashList (fallback: FlatList) | `ScrollView` for dynamic lists causes FPS drops and is a recurring code-review flag; catch it at scaffold time instead. |
| Animation | react-native-reanimated | Runs on UI thread, avoids JS-thread jank for anything more than a fade. |

## 2. Folder structure — what belongs where

- **`/app`**: routing only. A route file should import a screen from
  `/src/screens` and render it, plus wire up route params / layout. If a
  route file has business logic in it, that logic escaped its proper
  home — move it to a hook or the screen component.
- **`/src/screens/<Feature>`**: the container. Calls hooks from
  `/src/hooks`, passes data down to presentational components. This is
  where "what does this screen do" logic lives — not in `/app`.
- **`/src/components`**: presentational, reusable, ideally prop-driven
  with no direct data-fetching. `/src/components/ui` specifically for
  primitives shared app-wide (Button, Input, Card, Modal shell, `Screen`,
  `QueryState`).
  - *Optional future evolution*: once `/src/components/ui` has enough
    primitives that flat is getting hard to navigate, some teams split it
    into an atomic-design tier (`atoms/` → `molecules/` → `organisms/`).
    Valid, but don't start there — it's structure for a problem
    (navigating a large design system) that a small/new app doesn't have
    yet. Introduce it only once the flat `ui/` folder is actually painful.
- **`/src/hooks`**: one file per concern
  (`useMeetingList.ts`, `useAuthSession.ts`). React Query hooks live here,
  not inline in components — this is the seam that lets two developers
  work on the same screen's UI and its data logic without touching the
  same lines.
- **`/src/services/api`**: the Axios instance (interceptors, base URL,
  auth header injection) plus one file per resource
  (`meetings.ts`, `auth.ts`) exporting typed request functions. Screens
  and hooks never call `axios` directly.
- **`/src/store`**: Zustand stores. If you're tempted to put server data
  (a list fetched from an API) here, it belongs in React Query instead —
  Zustand is for client-only state that has no "source of truth on a
  server" (theme, onboarding-seen flag, active tab).

### 2a. State management — three categories, not two

Every piece of state falls into exactly one of these; putting it in the
wrong bucket is the most common review flag on RN codebases:

| Category | Lives in | Examples |
|---|---|---|
| Local | `useState`/`useReducer` inside the component | a text input's draft value, whether a dropdown is open, form state (via React Hook Form) |
| Global (client) | Zustand (`/src/store`) | theme, active tab, onboarding-seen flag, feature flags read at runtime |
| Server | TanStack Query (`/src/hooks`) | anything fetched from an API — lists, profiles, any data whose source of truth is the backend |

If a value can be derived from server state or local state, don't
duplicate it into Zustand "for convenience" — that's the shape of bug
where two copies of the same fact drift out of sync.
- **`/src/utils`**: pure functions, no React, no side effects.
- **`/src/types`**: shared interfaces/types used across more than one
  file. Type used in exactly one file stays colocated in that file.
- **`/src/constants`**: colors, spacing, static config values, string
  tables.

Once an app grows past a handful of features, group by feature instead
of by layer where it reduces cross-team file contention, e.g.:
`/src/features/meetings/{components,hooks,api,types}` — same layer
names, just nested per-feature. Don't do this on day one; it's premature
structure for a small app and adds navigation overhead with no payoff yet.
Migrate one feature at a time, when its files in the layer folders
outnumber 2–3 each *and* more than one developer regularly touches them —
not the whole app preemptively. See `templates/src/features/example/` for
the worked example of what a migrated feature looks like.

### 2b. Navigation — route groups as the file-based RootNavigator

Expo Router's route groups (`(auth)`, `(tabs)`, `(modals)` — folders in
parentheses that don't add a URL segment) are the file-based equivalent
of a hand-rolled `RootNavigator` with an `AuthStack`/`MainTabs` split:
same concept (separate the unauthenticated flow, the main tabbed flow,
and modal presentations), but there's no separate navigation-config file
that can drift out of sync with the actual screens — the folder
structure *is* the navigation structure. See `templates/app/` for the
skeleton (`_layout.tsx` per group + a root `_layout.tsx` that declares
all three).

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

## 4. Theming & design tokens

Colors, spacing, and typography live in `/src/constants/theme.ts` as
plain objects (light/dark palettes), read through a `useTheme()` hook
(`/src/hooks/useTheme.ts`) rather than hardcoded per component. This is
the difference between a rebrand/dark-mode pass being a one-file change
versus a grep-and-replace across every screen. See
`templates/src/constants/theme.ts` and `templates/src/hooks/useTheme.ts`.
Don't add a full theming library (styled-components, a `ThemeProvider`
from a UI kit) unless the project already pulls one in for other
reasons — plain objects + a hook are enough for the actual requirement.

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
  path only.

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
  holding it until `useAppPreferencesStore`'s persisted state has
  rehydrated from AsyncStorage (see below). A splash screen hidden before
  that decision is made is what causes the classic bug where a returning
  user sees onboarding flash for one frame before snapping to their real
  destination.
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
- **Boot-time routing**: `app/index.tsx` reads `hasSeenOnboarding` (and,
  once wired, the real auth/session state) and issues a `<Redirect>` to
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

## 7. Naming

- Components/screens: `PascalCase.tsx`
- Hooks/utils: `camelCase.ts` (hooks always prefixed `use`)
- Constants: `UPPER_SNAKE_CASE`
- Branches: `feature/`, `fix/`, `chore/` + short kebab-case slug

## 8. Auditing an existing project against this standard

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
   that should have moved to `/src/hooks` or `/src/screens`?
7. Is server state living in Zustand instead of React Query anywhere (or
   vice versa — form-local state pushed into Zustand)?
8. Any manual `useState`-driven complex forms that should be
   React Hook Form + Zod?
9. Any `ScrollView` rendering a long/dynamic list that should be
   FlashList/FlatList?
10. Any `alert()` calls that should be a Toast/Snackbar?
11. Are colors/spacing hardcoded per-component instead of read from a
    centralized theme?
12. Do list screens handle loading/error/empty explicitly, or do they
    silently render nothing (looks broken) on an empty/error response?
13. If the app has more than a couple of features and multiple
    developers, are any single features' hooks/api/components growing
    past the point where `/src/features/<feature>` would reduce
    collisions? (Flag as a suggestion, not a required fix.)
14. Does the app hold the splash screen until app-ready state (e.g.
    persisted-store hydration) instead of hiding it on a fixed timer or
    immediately on mount? Is there a welcome/onboarding flow at all for
    first-time users, and if so, is `hasSeenOnboarding` actually persisted
    (AsyncStorage-backed `persist` middleware) rather than plain in-memory
    Zustand state that would replay onboarding every launch?

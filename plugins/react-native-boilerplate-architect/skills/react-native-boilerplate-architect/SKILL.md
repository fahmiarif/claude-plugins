---
name: react-native-boilerplate-architect
description: Scaffolds and enforces PT PSM's production-grade React Native (Expo) boilerplate — file-based routing via Expo Router, TypeScript strict mode, TanStack Query + Zustand + React Hook Form/Zod, feature-based modular folders, and team anti-conflict tooling (Prettier + ESLint + Husky + lint-staged pre-commit, Commitlint conventional commits, CI gate on GitHub Actions for iOS/Android). Use when starting a new React Native/Expo app, when asked to set up a boilerplate/starter/template for a mobile app, or when auditing an existing RN app against these standards ("bikin boilerplate RN", "setup starter react native", "cek project ini udah sesuai standar belum").
metadata:
  author: fahmi
  version: "1.0.0"
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

### 2. Folder structure

Create (only what's missing) under the project root:

```
/app                    Expo Router routes only — thin, delegates to hooks/screens
/src/screens/<Feature>   Container screens (compose hooks + presentational components)
/src/components         Reusable presentational UI (subfolder per feature once it grows)
/src/components/ui      Design-system primitives (Button, Input, Card, Screen, QueryState...)
/src/hooks              Custom hooks — business logic & data-fetching live here, not in screens
/src/services/api       Axios/fetch client + endpoint definitions
/src/store              Zustand stores (client state only)
/src/utils              Pure helper functions
/src/types              Shared TypeScript interfaces/types
/src/constants          Colors, config, static strings, theme tokens
```

Read `reference/STANDARD.md` for the full rationale per folder before
generating — it explains what does/doesn't belong in each one (e.g. don't
put form-local state in Zustand, don't fetch data directly in a screen).

### 3. Feature-based folder structure (optional upgrade)

Layer-based (step 2) is the default for a new/small app. Once the app has
several independent features and developers keep colliding in the same
`/src/hooks` or `/src/services/api` files, migrate to grouping by feature
instead:

```
/src/features/<feature>/
  components/    feature-local presentational components (not used elsewhere)
  hooks/         feature-local React Query hooks
  api/           feature-local API functions
  types/         feature-local types
```

`templates/src/features/example/` is a full worked example (types → api →
hook → component) showing exactly how the layer-based files from step 2
map into this shape — copy that pattern per feature rather than
inventing a new one each time.

Rule of thumb for when to migrate a given feature: once its files in
`/src/hooks`, `/src/services/api`, and `/src/components` outnumber
2–3 each AND more than one developer regularly touches them, move that
one feature — don't migrate the whole app preemptively, and don't leave
a single feature split half in `/src/` layers and half in
`/src/features/` (pick one per feature, not per file).

Anything genuinely shared across features (design-system primitives in
`/src/components/ui`, the base Axios client, cross-cutting types) stays
in the layer-based folders regardless of how many features have migrated.

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
structure, not the placeholder screen names. Wire the real
authenticated/unauthenticated branch (redirect based on session state)
once there's an actual auth hook to check — don't stub that logic
speculatively.

### 5. Core dependencies

Install (skip any already present):

```
npm install @tanstack/react-query zustand axios react-hook-form zod @hookform/resolvers date-fns
npm install -D prettier eslint-config-prettier eslint-plugin-simple-import-sort husky lint-staged @commitlint/cli @commitlint/config-conventional
```

Adjust the exact `expo`/`react-native` aligned versions with
`npx expo install <pkg>` for any Expo-managed native packages instead of
plain `npm install`, so versions stay compatible with the installed Expo
SDK.

### 6. TypeScript strict mode + path aliases

Ensure `tsconfig.json` extends `expo/tsconfig.base` with `"strict": true`
and a `@/*` → `./src/*` path alias — copy the pattern from
`templates/tsconfig.json` if the project doesn't have one yet. Never
relax `strict` to make errors go away.

### 7. Anti-conflict tooling (this is the part most RN starters skip)

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

### 8. Pre-commit gate (Husky + lint-staged)

```
npx husky init
```

Then write `templates/.husky/pre-commit` and `templates/.lintstagedrc.json`
into place — pre-commit runs `lint-staged` (prettier --write + eslint --fix
on staged files only, fast) and `tsc --noEmit` on the whole project.

### 9. Commit convention + branch naming

- Write `templates/commitlint.config.js` and `templates/.husky/commit-msg`.
- Copy `templates/CONTRIBUTING.md` — documents Conventional Commits
  (`feat:`, `fix:`, `chore:`...) and branch naming
  (`feature/<ticket>-slug`, `fix/<ticket>-slug`).

This is what makes `git log` and blame useful across many apps over time,
and gives CI something structured to gate on later if needed.

### 10. CI gate (GitHub Actions)

Copy `templates/.github/workflows/ci.yml` — runs `npm ci`, `npm run
typecheck`, `npm run lint`, and tests (if a test script exists) on every
PR. This is what actually blocks a broken PR from merging, not just a
local hook a developer can skip with `--no-verify`.

### 11. Project-level AGENTS.md

Copy `templates/AGENTS.md` into the new project's root (renamed to fit,
`CLAUDE.md` can just be `@AGENTS.md` per the existing pattern in
`meet-manajio-mobile`) so future AI-assisted work in that repo follows the
same standard without needing this skill re-invoked every time.

### 12. Theming & design tokens

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

### 13. Loading / empty / error state pattern

Copy `templates/src/components/ui/QueryState.tsx` — wraps a React Query
list result so every screen renders the same three non-happy-path states
(loading spinner, error + retry, empty message) instead of each screen
reinventing its own `if (isLoading)` branching. Pairs with the existing
"no full-screen blocking spinner" rule — swap the loading branch for a
skeleton once the design system has one.

Also copy `templates/src/components/ui/Screen.tsx` — a `SafeAreaView` +
padding wrapper every screen uses instead of repeating that layout
boilerplate per file.

### 14. Example code (only for brand-new projects)

Copy the illustrative pattern files from `templates/src/` — one Zustand
store, one React Query hook, one RHF+Zod form example, one Axios client,
one presentational `ui` component with colocated `StyleSheet` — so the
first PR in a new repo has a concrete pattern to copy instead of
reinventing one. Delete/adapt naming to the actual feature.

### 15. Sanity check

Run `npm run typecheck` and `npm run lint` after scaffolding and report
results to the user — don't declare the boilerplate done without
confirming it actually passes clean.

## iOS + Android

Everything above is Expo-managed, so both platforms are covered by
default (`expo run:ios` / `expo run:android`, EAS Build/Update for
release). Two things worth flagging to the user on a brand-new app if
not already decided:
- **EAS**: copy `templates/eas.json` and set up `eas build`/`eas submit`
  profiles (`development`, `preview`, `production`) once they're ready to
  build native binaries — don't set this up speculatively before it's
  needed.
- **Config**: for apps with per-environment values (dev/staging/prod API
  URLs, bundle IDs), prefer `app.config.ts` over static `app.json` so
  config is typed and can branch on `process.env` — only worth the extra
  step once there's actually more than one environment.

## Files in this skill

- `reference/STANDARD.md` — the full standard with rationale (read before
  auditing an existing project or explaining *why* a rule exists)
- `templates/` — copy-ready config/template files referenced above,
  including `templates/app/` (route-group navigation skeleton) and
  `templates/src/features/example/` (feature-based folder worked example)

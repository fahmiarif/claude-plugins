# {{App Name}}

_Replace this line with a one-paragraph description of what the app does._

## Prerequisites

- Node.js LTS + npm
- [EAS CLI](https://docs.expo.dev/eas/) for builds/submits/OTA updates: `npm install -g eas-cli`
- Xcode (macOS only, for iOS builds/simulator) and/or Android Studio (for Android builds/emulator) if building locally instead of via EAS

## Setup

```sh
npm install
cp .env.example .env   # fill in real values — see src/constants/env.ts
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` to launch an emulator/simulator.

## Development scripts

```sh
npm run typecheck     # tsc --noEmit
npm run lint           # eslint . (add -- --fix to auto-fix)
npm run format         # prettier --write .
npm run test           # jest (unit tests)
npm run e2e            # maestro test .maestro (if E2E is set up — see below)
```

Pre-commit hooks already run lint/format/typecheck on staged files — see
`CONTRIBUTING.md` for the full commit/branch convention.

## Building (development / preview / production)

`eas.json` defines three build profiles:

- **development** — dev client, for local development with any custom
  native modules.
- **preview** — internal distribution, installable directly (an APK, not
  a Play Store bundle) for sharing with QA/stakeholders.
- **production** — for submitting to the Play Store / App Store.

```sh
eas login

# Installable APK for QA/internal testing
eas build --platform android --profile preview

# Production builds (Android App Bundle + iOS build, ready to submit)
eas build --platform android --profile production
eas build --platform ios --profile production
```

`eas build` produces a Play Store `.aab` (App Bundle) by default, not an
installable `.apk` — the **preview** profile in `eas.json` already sets
`"android": { "buildType": "apk" }` so that profile's output can be
installed directly on a device without going through the Play Store.

## Submitting to the stores

```sh
eas submit --platform android --profile production
eas submit --platform ios --profile production
```

## OTA updates (EAS Update)

Ship a JS-only change (logic, styling, non-native) without a new store
release or App Store review:

```sh
# Once, if this project hasn't run it before — configures runtimeVersion
# + updates.url in app.json and the matching channel in eas.json:
eas update:configure

# Publish an update to everyone on the "production" channel:
eas update --channel production --message "fix: describe the change" --environment production
```

Each build profile in `eas.json` only receives updates published to its
own `channel` (`preview` builds get `--channel preview` updates,
`production` builds get `--channel production` updates) — publishing to
the wrong channel silently reaches nobody.

**OTA updates are JS-only.** A native change (new permission, new native
module, an Expo SDK upgrade) always needs a real `eas build`, not an OTA
update — `eas update` can't ship those. If this app has adopted the
force-update banner pattern (`src/components/ui/UpdateBanner.tsx`), a
build below the required minimum version gets blocked from continuing
until the user updates through the store, independent of OTA.

## Environment variables

Every env var is validated with Zod in `src/constants/env.ts` — a
missing variable fails loudly at app startup with a clear error, instead
of silently breaking at the exact request that needed it. Add any new
variable to that schema too, not just to `.env`.

For EAS builds, each profile in `eas.json` overrides its own values via
an `env` block (development points at a local IP, preview at staging,
production at the real API) — keep that in sync with the schema in
`env.ts` when adding a variable.

## Project structure

This app is feature-based from the start — each feature lives in
`src/features/<feature>/{screens,components,hooks,api,types}`. See
`AGENTS.md` for the full structure/coding-standard reference (this is
also what an AI coding assistant reads first in this repo).

## Testing

- **Unit tests**: `npm run test` (Jest + `@testing-library/react-native`)
- **E2E tests**: `npm run e2e` (Maestro, if `.maestro/` has been set up)
  — requires a dev client or build first; flows don't run against plain
  Expo Go.

## Contributing

See `CONTRIBUTING.md` for commit message and branch naming conventions.

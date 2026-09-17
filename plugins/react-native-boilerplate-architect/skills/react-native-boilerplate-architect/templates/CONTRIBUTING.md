# Contributing

## Branch naming

`<type>/<short-slug>`, e.g. `feature/meeting-recording`, `fix/login-crash`,
`chore/upgrade-expo-sdk`.

Types: `feature`, `fix`, `chore`, `refactor`, `docs`.

## Commit messages (Conventional Commits)

```
<type>(optional-scope): <short summary>
```

Examples:
- `feat(auth): add Google sign-in`
- `fix(recordings): prevent crash on empty transcript`
- `chore: bump expo sdk to 56`

Allowed types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`,
`perf`, `build`, `ci`, `revert`. Enforced by commitlint on every commit via
a `commit-msg` git hook — a rejected commit means the message needs
reformatting, not `--no-verify`.

## Before opening a PR

Pre-commit hooks already run lint/format/typecheck on staged files, but
before pushing, run the full check once:

```
npm run typecheck
npm run lint
```

CI re-runs these on every PR and blocks merge on failure — a local skip
doesn't get you past it.

## PR checklist

- [ ] Tested on both iOS and Android (or noted why one wasn't applicable)
- [ ] No new `ScrollView` used for a dynamic/long list (use FlashList/FlatList)
- [ ] No new `alert()` (use the app's Toast/Snackbar)
- [ ] Business logic lives in a hook, not inline in a screen or route file

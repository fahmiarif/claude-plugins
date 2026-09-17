# claude-plugins

Private Claude Code plugin marketplace for PT PSM. Internal, reusable
tooling/standards packaged as installable plugins.

## Install

```
/plugin marketplace add fahmi/claude-plugins
/plugin install react-native-boilerplate-architect@claude-plugins
```

## Plugins in this repo

### react-native-boilerplate-architect

Scaffolds a new React Native/Expo app to PT PSM's standard (Expo Router,
TypeScript strict, TanStack Query, Zustand, React Hook Form + Zod,
colocated styles, FlashList) and sets up team anti-conflict tooling
(Prettier + ESLint + Husky pre-commit + lint-staged, Commitlint,
GitHub Actions CI gate). Can also audit an existing RN project against
the same standard.

Trigger it by asking Claude Code things like:
- "buatkan boilerplate react native baru nama project X"
- "setup tooling anti-conflict di project ini"
- "cek project ini udah sesuai standar PT PSM belum"

## Updating

After pushing changes to a plugin, bump its `version` in both
`plugins/<plugin>/.claude-plugin/plugin.json` and the matching entry in
`.claude-plugin/marketplace.json` — installed users only get the update
once the version string changes.

Users pull updates with:

```
/plugin marketplace update
/plugin update react-native-boilerplate-architect@claude-plugins
```

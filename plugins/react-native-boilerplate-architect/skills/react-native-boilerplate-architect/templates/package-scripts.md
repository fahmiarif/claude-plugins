# package.json — scripts & devDependencies to merge in

Add these scripts (merge with existing `scripts`, don't overwrite `start`/`android`/`ios`/`web`):

```json
{
  "scripts": {
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "prepare": "husky"
  }
}
```

`"prepare": "husky"` makes hooks reinstall automatically after `npm install`
on a fresh clone — required so a new team member gets the hooks without a
manual step.

devDependencies to have present (see SKILL.md step 3 for the install
command):

```
prettier
eslint-config-prettier
eslint-plugin-simple-import-sort
husky
lint-staged
@commitlint/cli
@commitlint/config-conventional
```

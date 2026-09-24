// @ts-check
const boundaries = require('eslint-plugin-boundaries');
const expoConfig = require('eslint-config-expo/flat');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

module.exports = [
  ...expoConfig,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Auto-sorted imports remove the "who edited the import block last"
      // conflict entirely — order is deterministic, not a judgment call.
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Barrel files (index.ts re-exporting a folder) become a single
      // hotspot everyone edits and bloat the JS bundle — import directly
      // from source instead.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "ExportAllDeclaration",
          message:
            'Avoid barrel re-exports (export * from ...) — import directly from the source file.',
        },
      ],
    },
  },
  {
    // Enforces feature-folder isolation (STANDARD.md §2d): a feature can
    // import its own files and the shared layer folders, but never
    // reach into another feature's internals. The same-vs-different
    // comparison is done via `captured.feature` (the value each
    // `feature` element's pattern captures from its own path), not a
    // hardcoded per-feature list — this rule needs no edits as features
    // are added or removed.
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
      },
      'boundaries/elements': [
        { type: 'feature', pattern: 'src/features/*/**', capture: ['feature'] },
        {
          type: 'shared',
          pattern: 'src/{components,hooks,services,store,utils,types,constants}/**',
        },
        { type: 'app', pattern: 'app/**' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'feature' } },
              allow: {
                to: [
                  // same feature only — captured value must match
                  {
                    element: {
                      type: 'feature',
                      captured: { feature: '{{ from.element.captured.feature }}' },
                    },
                  },
                  { element: { type: 'shared' } },
                ],
              },
            },
            {
              from: { element: { type: ['app', 'shared'] } },
              allow: { to: { element: { type: ['feature', 'shared'] } } },
            },
          ],
        },
      ],
    },
  },
  {
    // Node-context tooling config, not app source — jest.setup.js in
    // particular uses the `jest` global, which app-source rules don't
    // know about and shouldn't need to.
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'jest.config.js', 'jest.setup.js'],
  },
];

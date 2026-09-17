// @ts-check
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
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
];

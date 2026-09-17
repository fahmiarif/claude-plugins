module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // feat, fix, chore, refactor, docs, style, test, perf, build, ci, revert
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'refactor',
        'docs',
        'style',
        'test',
        'perf',
        'build',
        'ci',
        'revert',
      ],
    ],
  },
};

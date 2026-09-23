/**
 * jest-expo handles the RN/Expo-specific transform + native-module mock
 * setup that a stock ts-jest/babel-jest config would need to hand-reproduce.
 * Add `"test": "jest"` (and `"test:watch": "jest --watch"`) to
 * package.json scripts once this is copied in — the CI workflow (step 12)
 * runs `npm run test` unconditionally.
 */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Mocks AsyncStorage's native module — see jest.setup.js for why this is
  // required, not optional, the moment any test imports a persisted store.
  setupFiles: ['<rootDir>/jest.setup.js'],
};

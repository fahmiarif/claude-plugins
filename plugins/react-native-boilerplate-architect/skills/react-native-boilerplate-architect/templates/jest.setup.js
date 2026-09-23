// AsyncStorage's native module is unavailable under Jest — every persisted
// Zustand store (useAppPreferencesStore, useAuthStore) imports it at module
// load time, so any test importing one of those stores fails with
// "[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null" without this.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

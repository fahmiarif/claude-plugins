import { useAppPreferencesStore } from './useAppPreferencesStore';

/**
 * Reference pattern for testing a Zustand store: reset to a known state
 * before each test (zustand stores are module singletons, so state leaks
 * across tests otherwise), then call actions directly via `getState()` and
 * assert against `getState()` again — no React rendering needed for a pure
 * store test like this one.
 */
describe('useAppPreferencesStore', () => {
  beforeEach(() => {
    useAppPreferencesStore.setState({
      theme: 'light',
      hasSeenOnboarding: false,
      hasHydrated: false,
      hasPromptedReview: false,
    });
  });

  it('marks onboarding as seen', () => {
    expect(useAppPreferencesStore.getState().hasSeenOnboarding).toBe(false);
    useAppPreferencesStore.getState().markOnboardingSeen();
    expect(useAppPreferencesStore.getState().hasSeenOnboarding).toBe(true);
  });

  it('marks review as prompted exactly once (idempotent)', () => {
    useAppPreferencesStore.getState().markReviewPrompted();
    useAppPreferencesStore.getState().markReviewPrompted();
    expect(useAppPreferencesStore.getState().hasPromptedReview).toBe(true);
  });
});

export interface TourStep {
  id: string;
  /** Expo Router pathname this step's target lives on, e.g. '/(tabs)'. */
  screen: string;
  /** Matches the `id` passed to <TourTarget id="..."> on the target screen. */
  targetId: string;
  title: string;
  description: string;
  /**
   * Escape hatch for steps whose target depends on runtime data (e.g.
   * "point at the user's first item" rather than a fixed route). Return
   * the actual pathname to navigate to, or `null` if the step isn't
   * applicable right now (e.g. the user has no items yet) — TourOverlay
   * skips to the next step when this returns null. Leave undefined for
   * steps that always resolve to the static `screen` above.
   *
   * Example (per-app, not implemented here):
   *   resolveScreen: () => {
   *     const items = useSomeStore.getState().items;
   *     return items[0] ? `/items/${items[0].id}` : null;
   *   }
   */
  resolveScreen?: () => string | null;
}

/**
 * Placeholder tour — replace with the app's actual first-run walkthrough.
 * Each step's `targetId` must match a <TourTarget id="..."> wrapping the
 * real element on `screen` (or wherever `resolveScreen` navigates to).
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'home-primary-action',
    screen: '/(tabs)',
    targetId: 'home-primary-action-btn',
    title: 'Mulai di sini',
    description: 'Tombol ini adalah aksi utama yang paling sering kamu pakai.',
  },
  {
    id: 'home-search',
    screen: '/(tabs)',
    targetId: 'header-search-btn',
    title: 'Cari dengan cepat',
    description: 'Ketuk ikon ini untuk mencari apa saja di dalam aplikasi.',
  },
];

import { useColorScheme } from 'react-native';

import { palette, spacing, typography } from '@/constants/theme';

/**
 * Follows system light/dark by default. If the app later adds a
 * manual override (e.g. from `useAppPreferencesStore`), read that here
 * instead of `useColorScheme()` directly — this is the single seam to
 * change, not every screen that renders a color.
 */
export function useTheme() {
  const systemScheme = useColorScheme();
  const mode = systemScheme === 'dark' ? 'dark' : 'light';

  return {
    mode,
    colors: palette[mode],
    spacing,
    typography,
  };
}

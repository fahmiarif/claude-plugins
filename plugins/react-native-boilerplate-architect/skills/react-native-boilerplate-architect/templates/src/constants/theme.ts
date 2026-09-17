/**
 * Centralized design tokens. Components read colors/spacing/typography
 * from here (via `useTheme`) instead of hardcoding hex values or magic
 * numbers — the point isn't dark mode specifically, it's that a rebrand
 * or design tweak is a one-file change, not a grep-and-replace.
 */
export const palette = {
  light: {
    background: '#ffffff',
    surface: '#f3f4f6',
    text: '#111827',
    textMuted: '#6b7280',
    primary: '#2563eb',
    danger: '#dc2626',
    border: '#d1d5db',
  },
  dark: {
    background: '#0b0f19',
    surface: '#1f2937',
    text: '#f9fafb',
    textMuted: '#9ca3af',
    primary: '#3b82f6',
    danger: '#f87171',
    border: '#374151',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  heading: { fontSize: 24, fontWeight: '700' as const },
  subheading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};

export type ThemeMode = keyof typeof palette;
export type ThemeColors = (typeof palette)[ThemeMode];

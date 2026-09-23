export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
}

/**
 * Slide copy lives here, not inline in the screen, so translating it (i18n)
 * or swapping it per app is a one-file change. Replace with the app's
 * actual feature highlights — this is placeholder content.
 */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    title: 'Selamat datang',
    description: 'Kelola semua kebutuhanmu dalam satu aplikasi yang simpel dan cepat.',
  },
  {
    id: 'slide-2',
    title: 'Semua dalam genggaman',
    description: 'Akses fitur utama kapan saja, di mana saja, tanpa ribet.',
  },
  {
    id: 'slide-3',
    title: 'Siap mulai?',
    description: 'Yuk buat akun atau masuk untuk mulai menggunakan aplikasi.',
  },
];

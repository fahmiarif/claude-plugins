# Panduan AI (Agent) untuk Project React Native (Expo) — PT PSM

File ini berisi panduan, aturan, dan standar struktur project untuk membantu AI (dan developer baru) memahami kebiasaan dan arsitektur aplikasi ini. Selalu rujuk aturan ini sebelum menulis atau memodifikasi kode.

## 1. Versi & Teknologi Inti
- **Expo:** Selalu baca dokumentasi versi yang spesifik di https://docs.expo.dev/versions/latest/ sebelum menulis kode yang berkaitan dengan fitur native.
- **Routing:** Gunakan **Expo Router** berbasis file system (`/app`). Hindari React Navigation manual.
- **Bahasa:** Selalu gunakan **TypeScript** (`strict: true`). Dilarang menggunakan `any` sebisa mungkin; selalu gunakan `interface`/`type` untuk semua props, state, dan response API.

## 2. Struktur Direktori
- `/app` : Routing only (Expo Router). Setipis mungkin — import screen dari `/src/screens` lalu render.
- `/src/screens/<Feature>` : Container screen — memanggil hooks, compose presentational components.
- `/src/components` : Komponen UI reusable. `/src/components/ui` khusus primitives (Button, Input, Card).
- `/src/hooks` : Business logic & data-fetching (React Query hooks di sini).
- `/src/services/api` : Axios client + endpoint per resource.
- `/src/store` : Zustand — client state saja, bukan server data.
- `/src/utils` : Pure helper functions.
- `/src/types` : Interface/type yang dipakai lintas file.
- `/src/constants` : Warna, config statis, string.

Kalau app sudah besar, kelompokkan per fitur: `/src/features/<feature>/{components,hooks,api,types}`.

## 3. Standar Penulisan Kode

### A. Komponen & Logika Bisnis
- Functional Components + Arrow Functions.
- Container/Presentational: halaman di `/app` → screen di `/src/screens` (pakai hook) → komponen presentational di `/src/components`.

### B. State, Data Fetching & Form
- `@tanstack/react-query` untuk server state — sentralisasi di `/src/hooks`.
- **Zustand** untuk client state ringan saja (tema, status login lokal). Jangan simpan data server atau state form lokal di sini.
- **Form:** `react-hook-form` + `zod`. Jangan `useState` manual untuk form kompleks.

### C. Navigasi
- `<Link>` / `router.push()` dari expo-router.
- Perhatikan back-stack behavior — hindari fallback rute hardcoded.

### D. Styling & Performa
- Style di bagian bawah file `.tsx` yang sama via `StyleSheet.create({...})` (colocation). Kecuali project pakai NativeWind/Tailwind.
- Hindari inline function/object ke child component — pakai `useCallback`/`useMemo`.

### E. Dokumentasi & Komentar
- JSDoc di atas fungsi/komponen/hook yang kompleks.
- Komentar inline hanya untuk logika bisnis yang tidak jelas dari nama variabel.
- Penamaan jelas > komentar berlebihan.

## 4. UI/UX dan Error Handling
- Jangan pakai full-screen spinner blocking — skeleton loader / `isPending` per tombol.
- Jangan pakai `alert()` bawaan — pakai Toast/Snackbar kustom.
- Error Boundary + error handling graceful di semua request API.

## 5. Naming
- Komponen & Screen: `PascalCase.tsx`
- Hooks/Utils: `camelCase.ts`
- Konstanta: `UPPER_SNAKE_CASE`
- Branch: `feature/`, `fix/`, `chore/` + slug singkat

## 6. Optimasi Lanjutan
- Hindari barrel imports (`index.ts` re-export) — import langsung dari sumber file.
- `FlashList`/`FlatList` untuk list panjang, jangan `ScrollView`.
- Uncontrolled input (`ref`) untuk TextInput yang sangat kompleks.
- `react-native-reanimated` untuk animasi (UI thread, bukan JS thread).

## 7. Tooling Tim (Anti-Conflict) — WAJIB aktif, bukan sekadar didokumentasikan
- Prettier + ESLint (`simple-import-sort`) jalan otomatis via **Husky pre-commit + lint-staged** sebelum commit — bukan manual "tolong diformat dulu".
- Commit message wajib **Conventional Commits**, ditegakkan via commitlint di `commit-msg` hook. Lihat `CONTRIBUTING.md`.
- Branch naming: `feature/<slug>`, `fix/<slug>`, `chore/<slug>`.
- CI (GitHub Actions) menjalankan typecheck + lint di setiap PR — ini backstop yang tidak bisa di-skip developer individual (beda dengan git hook lokal).

Lihat `CONTRIBUTING.md` untuk detail lengkap alur kontribusi.

## 8. Library Pendukung (Bottom Sheet, Toast, dll.)
Untuk kebutuhan umum di luar stack inti (bottom sheet, toast/snackbar, action sheet, date picker, chart, secure storage, dll.), jangan asal pilih library dari hasil pencarian — cek daftar pilihan standar berikut supaya konsisten antar aplikasi PT PSM:

- **Bottom sheet:** `@gorhom/bottom-sheet` (atau `@expo/ui` untuk versi native SwiftUI/Jetpack Compose)
- **Modal/Dialog custom:** `Modal` bawaan RN atau `react-native-modal` — pengganti `alert()` yang dilarang
- **Toast/Snackbar:** `react-native-toast-message`
- **Action sheet:** `@expo/react-native-action-sheet`
- **Skeleton loader:** `moti/skeleton` atau `react-native-skeleton-placeholder`
- **Image:** `expo-image` (bukan `Image` bawaan RN)
- **Animasi deklaratif ringan:** `moti` (di atas Reanimated)
- **Date/time picker:** `@react-native-community/datetimepicker`
- **Chart:** `react-native-gifted-charts`
- **Storage sensitif (token/auth):** `expo-secure-store` — **jangan** simpan token di AsyncStorage
- **Network status:** `@react-native-community/netinfo`
- **Haptic feedback:** `expo-haptics`

Instal hanya saat benar-benar dibutuhkan fitur, bukan speculative di awal project. Daftar lengkap + rasional tiap pilihan ada di `reference/LIBRARIES.md` pada skill `react-native-boilerplate-architect`.

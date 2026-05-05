# Haptic Feedback untuk Swipe Navigation

## Perubahan
`src/components/SubPageLayout.tsx` — import `hapticLight` dari `@/utils/native/haptics` dan panggil dalam `handleDragEnd` tepat sebelum setiap navigation berjaya:

- Edge-swipe → Back: `hapticLight()` sebelum `handleBack()`
- Swipe kiri → Next: `hapticLight()` sebelum `navigate(nextRoute.path)`
- Swipe kanan → Prev: `hapticLight()` sebelum `navigate(prevRoute.path)`

Snap-back (swipe tak cukup threshold) **tidak** trigger haptic.

## Kenapa `hapticLight`
- iOS native pop gesture guna light impact — paling sesuai dan tak menggangu.
- Fungsi sedia auto no-op pada web (`Capacitor.isNativePlatform()` check), jadi tiada kesan pada PWA/desktop.

## Files
- `src/components/SubPageLayout.tsx` — 1 import + 3 panggilan haptic.

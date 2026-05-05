# iOS-Style Swipe Gestures untuk SubPageLayout

## Tujuan
Tambah gesture swipe ala iOS:
- **Swipe kanan dari kiri-edge** → Back (macam iOS interactive pop)
- **Swipe kiri** → Next sibling (kalau ada)
- **Swipe kanan (bukan dari edge)** → Prev sibling (kalau ada)

Conflict resolution: kalau page ada siblings, edge-swipe kekal jadi Back; swipe biasa di tengah jadi Prev/Next.

## Implementation

### `src/components/SubPageLayout.tsx` — tambah gesture layer
Guna `framer-motion` `motion.div` dengan `drag="x"` pada wrapper content (motion.main yang sedia ada).

**Gesture rules:**
- `drag="x"` dengan `dragConstraints={{ left: 0, right: 0 }}` + `dragElastic={0.25}`
- `onDragEnd` baca `info.offset.x` dan `info.velocity.x`:
  - **Back trigger** (edge-swipe): `info.point.x` start < 30px DAN `offset.x > 80` → `handleBack()`
  - **Next trigger**: `offset.x < -80` ATAU `velocity.x < -500` → navigate `nextRoute`
  - **Prev trigger**: `offset.x > 80` ATAU `velocity.x > 500` (bukan edge) → navigate `prevRoute`
- Track `dragStartX` via `onDragStart` untuk decide edge vs middle.

**Visual feedback:**
- Semasa drag, content ikut jari (built-in motion drag).
- Animate exit slide ke arah opposite swipe (350ms, iOS easing) dengan `AnimatePresence`.

**Touch-action CSS:**
- Set `touch-action: pan-y` pada motion.main supaya vertical scroll page kekal lancar; horizontal swipe dikuasai gesture handler.

### Edge cases
- **Inputs/dialogs/sliders**: drag handler letak hanya pada main wrapper, bukan pada `headerRight`. Charts (`Recharts`) dan scrollable lists masih boleh swipe — `pan-y` benarkan vertical scroll lulus.
- **Tiada siblings**: hanya edge-swipe-back yang aktif, swipe lain kembali ke posisi (snap-back).
- **Desktop**: framer-motion `drag` support pointer events, jadi mouse drag pun jalan (bonus). Boleh disabled bila `window.matchMedia('(hover: hover)')` kalau perlu — default biarkan jalan.

### Animation polish
- Drag elastic 0.25 (rasa "rubber band" ala iOS).
- Snap-back pakai spring `{ stiffness: 400, damping: 35 }`.
- Threshold consistent dengan iOS Mail (80px atau velocity 500).

## Files yang Diubah
- `src/components/SubPageLayout.tsx` — tambah drag handlers + gesture logic pada `motion.main`

## Files Yang TIDAK Disentuh
- Semua sub-page (Budget, Savings, Dakwah, Health, dll.) — props API tak berubah, gesture auto apply.

Approve untuk laksana.

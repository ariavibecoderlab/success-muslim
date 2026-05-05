# Pindah Navigation ke Kiri ala iOS/Android

## Masalah Sekarang
`SubPageLayout.tsx` letak butang **Back / Prev / Next** di **bawah skrin** (sticky bottom pill). Ini bukan pattern standard mobile app. iOS & Android letak butang back di **kiri atas header**.

## Apa Yang Akan Diubah

### 1. `src/components/SubPageLayout.tsx` — Refactor Total
**Header (top) — iOS/Android style:**
- Butang **Back** di kiri (chevron `<`) — iOS guna `ChevronLeft` besar + label optional, Android guna `ArrowLeft`. Aku pakai `ChevronLeft` (lebih iOS-like, universal).
- Tajuk page rata-tengah (centered), bukan kiri.
- `headerRight` kekal di kanan.
- Tinggi header dinaikkan sikit (h-12 → standard 44pt iOS feel).

**Bottom — Buang sticky bottom bar:**
- Buang sepenuhnya bottom Back button.
- Prev/Next sibling navigation dipindah jadi **swipe area atau segmented pill di bawah content** (opsional, bila ada siblings) — atau buang terus dan pindah Prev/Next ke header kanan sebagai dua chevron kecil. **Cadangan:** letak Prev/Next sebagai dua chevron halus di sebelah kanan header (bila ada siblings), supaya satu tempat saja.

**Layout final:**
```text
┌─────────────────────────────────────┐
│ <  Budget          ‹ ›   [right]    │  ← header (sticky top)
├─────────────────────────────────────┤
│                                     │
│         page content                │
│                                     │
└─────────────────────────────────────┘
```

### 2. iOS-like Page Transition Animation
Guna `framer-motion` `AnimatePresence` mode `wait` dengan slide-from-right:
- Enter: `x: 100%, opacity: 0.6` → `x: 0, opacity: 1`
- Exit: `x: 0` → `x: -30%, opacity: 0.5` (parallax ala iOS push)
- Easing: `[0.32, 0.72, 0, 1]` (iOS standard cubic-bezier)
- Duration: 350ms

Diletakkan dalam `SubPageLayout` itself supaya semua sub-page (Budget, Savings, Dakwah, Health subpages, dll.) auto dapat animation tanpa ubah setiap page.

### 3. Butang Back Animation
- `whileTap={{ scale: 0.92 }}` 
- Hover: subtle background fade `hover:bg-secondary/60`
- Bulat 44x44 touch target (Apple HIG compliant)

## Files Yang Diubah
- `src/components/SubPageLayout.tsx` — refactor (back-button ke header kiri, buang bottom bar, tambah page transition)

## Files Yang TIDAK Disentuh
- Semua page yang guna `SubPageLayout` (BudgetTracker, SavingsGoals, DailyDakwah, Health subpages, dll.) — props API kekal sama (`title`, `backTo`, `siblingRoutes`, `currentPath`, `headerRight`), tak perlu diubah.

## Soalan Cepat
Adakah Prev/Next sibling chevrons (untuk swipe antara Budget ↔ Savings) kamu nak:
- **(A)** Letak kecil di header kanan (sebelah `headerRight`)
- **(B)** Buang terus — user navigate dari Wealth hub saja
- **(C)** Kekal di bawah dalam pill kecil tapi center

Default aku cadang **(A)** — paling iOS-like (macam Mail app prev/next email). Kalau kamu OK terus, approve plan ni.

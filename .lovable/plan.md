

## Pixel-Perfect Dashboard Redesign — Match Reference Image

Comparing the reference screenshot against the current code, here are the precise changes needed for each component:

---

### 1. `HeroPrayerCard.tsx` — Major layout overhaul

**Current vs Reference differences:**
- **"NEXT PRAYER" label**: Add uppercase label at top-left (currently missing)
- **Prayer name**: Much larger — `text-3xl font-bold` instead of `text-lg`
- **Time**: Large `text-3xl font-bold` on the right side (currently small `text-sm`)
- **Countdown**: Show as "in 8 hours 47 minutes" with a small clock icon, not "dalam 8h 8m"
- **Decorative moon**: Add a large semi-transparent crescent moon circle in the top-right corner (CSS `w-24 h-24 rounded-full bg-white/10 -top-6 -right-6 absolute`)
- **Progress bar**: Full-width white bar with text "3 of 5 prayers done today" below it (not above)
- **Remove**: The 5 small prayer pill indicators (Subuh/Zuh/Asa/Mag/Isy row)
- **Buttons**: TWO side-by-side buttons at bottom:
  - Left: "Log [Prayer]" — white bg, dark text, with checkmark icon
  - Right: "Remind me" — semi-transparent bg (`bg-white/20`), with bell icon
- **Card**: Larger padding `p-5`, more rounded (`rounded-2xl`)

### 2. `RamadanBanner.tsx` — Richer layout

**Current vs Reference differences:**
- **Header row**: "Ramadan Day 21 of 30" on left, fire emoji + "21 day streak" badge on right (badge style: `bg-white/20 rounded-full px-3 py-1`)
- **Main text**: Bold large text "10 Malam Terakhir — Cari Laylatul Qadr" with star emoji — currently small `text-[11px]`, needs `text-base font-bold`
- **Subtitle**: "Iftar dalam 2j 14m · Perbanyak ibadah malam ini" as secondary line
- **Decorative crescent**: Large semi-transparent moon shape in bottom-right corner (similar to prayer card)
- **Bottom**: "70% of Ramadan complete" text with progress bar below
- **Gradient**: Darker brown/amber — `from-amber-700 to-orange-800` instead of current `from-amber-500 to-orange-600`
- **Padding**: Increase to `p-5`, more rounded `rounded-2xl`

### 3. `DailyCheckinCard.tsx` — Match reference styling

**Current vs Reference differences:**
- **Title**: "Daily Check-in" with sparkle emoji (✨) — larger, `text-base font-semibold`
- **Remove**: The icon box wrapper around sparkles, make it inline with text
- **7-day circles**: Larger circles (`w-8 h-8`), completed ones use dark green (`bg-emerald-800 text-white`), current day has blue/emerald ring, future days are gray (`bg-gray-200`)
- **Point labels**: Below each circle, slightly larger `text-[9px]`
- **Claim button**: Orange/amber colored (`bg-amber-500 hover:bg-amber-600 text-white`), positioned on the right side of the row (not below), shows "Claim +15"
- **Layout**: Circles and button on same row — `flex items-center justify-between`
- **Card**: White background, `rounded-2xl`, `p-4`

### 4. `LifeScoreCard.tsx` — Minor tweaks

**Current vs Reference differences:**
- **Section header**: "LIFE SCORE" as a section label ABOVE the card (like "QUICK LOG"), not inside the card
- **Card label**: "OVERALL SCORE" uppercase inside card top-left
- **Score display**: "42/100" with `/100` as smaller subscript text inline (not on separate line)
- **Subtitle**: "Getting Started" below the label (currently `getScoreLabel` — this exists, just ensure placement)
- **Pillar bars**: Slightly thicker (`h-2` instead of `h-1.5`), with score values right-aligned

### 5. `QuickLogGrid.tsx` — Minor styling

**Current vs Reference differences:**
- **Edit button**: Shows "Edit" text with pencil icon (currently just pencil icon alone)
- **Circle size**: Slightly larger `w-12 h-12` (currently `w-10 h-10`)
- **Labels**: Slightly larger text

### 6. `Dashboard.tsx` — Spacing

- Increase gap between cards slightly — some cards in reference have more breathing room
- Remove section header for Life Score from LifeScoreCard, add it in Dashboard layout

---

### Files to modify:
1. **`src/components/dashboard/HeroPrayerCard.tsx`** — Complete redesign to match reference
2. **`src/components/dashboard/RamadanBanner.tsx`** — Richer layout with decorative elements
3. **`src/components/dashboard/DailyCheckinCard.tsx`** — Larger circles, orange claim button, horizontal layout
4. **`src/components/dashboard/LifeScoreCard.tsx`** — Section header outside, score inline
5. **`src/components/dashboard/QuickLogGrid.tsx`** — "Edit" text label, larger circles
6. **`src/pages/Dashboard.tsx`** — Add "LIFE SCORE" section header, spacing adjustments


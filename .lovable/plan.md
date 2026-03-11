

## Polish All /iman Subpages — Align with Dashboard Design

The dashboard now uses a premium design language: dark orange gradient cards, `rounded-xl` with `shadow-sm`, tactile `active:scale-[0.98]` interactions, colored icon containers with `ring-1` glow, and consistent section headers. The /iman subpages still use default card styling. Here's the plan to align them.

### Design Tokens to Apply Consistently

- **Cards**: `rounded-xl border-0 shadow-sm` (remove default border)
- **Interactive cards**: Add `hover:shadow-md active:scale-[0.98] transition-all duration-200`
- **Hero/summary cards** (top of each page): Use `bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 rounded-xl shadow-md` — matching the For You cards
- **Icon containers**: `w-10 h-10 rounded-xl ring-1 ring-black/5 dark:ring-white/10` with colored bg
- **Section headers**: `text-xs font-semibold uppercase tracking-wider text-muted-foreground`
- **Status buttons/chips**: `rounded-lg` instead of default

### Files to Modify (13 files)

**1. `src/components/SubPageLayout.tsx`**
- Add `backdrop-blur-xl` to the sticky nav header (already has it, confirm)
- No major changes needed — layout is clean

**2. `src/pages/deen/SalahLog.tsx`**
- Prayer cards: Add `rounded-xl border-0 shadow-sm` + `active:scale-[0.98]`
- Active prayer card: Use orange accent `bg-orange-50 dark:bg-orange-950/20` instead of `border-primary/20`
- Status buttons: `rounded-lg`

**3. `src/pages/deen/PrayerTimes.tsx`**
- Hero prayer card at top: Apply orange gradient `from-orange-600 to-orange-700 text-white`
- All cards: `rounded-xl border-0 shadow-sm`
- Settings dialog cards: `rounded-xl`

**4. `src/pages/deen/QuranReader.tsx`**
- Stats/progress cards: `rounded-xl border-0 shadow-sm`
- Surah list cards: Add `active:scale-[0.98]` + `rounded-xl`
- Target selector cards: Orange gradient for selected state

**5. `src/pages/deen/SurahReader.tsx`**
- Keep parchment aesthetic (special case), but ensure navigation elements use `rounded-xl`

**6. `src/pages/DhikrCounter.tsx`**
- Main counter area: Keep the large tap circle
- Preset cards: `rounded-xl border-0 shadow-sm active:scale-[0.98]`
- Stats summary: Orange gradient hero card for daily total

**7. `src/pages/SunnahTracker.tsx`**
- Checklist items: `rounded-xl border-0 shadow-sm`
- Streak/progress card at top: Orange gradient hero card
- Category headers: Consistent section header style

**8. `src/pages/deen/DeenFasting.tsx`**
- Calendar card: `rounded-xl border-0 shadow-sm`
- Suhoor/Iftar info card: Orange gradient
- Fasting type selector: `rounded-xl` pills

**9. `src/pages/deen/SadaqahTracker.tsx`**
- Summary stat cards: Orange gradient `from-orange-600 to-orange-700 text-white`
- Monthly goal card: `rounded-xl border-0 shadow-sm`
- Donation list items: `rounded-xl border-0 shadow-sm`

**10. `src/pages/ZakatCalculator.tsx`**
- Result card: Orange gradient hero
- Input card: `rounded-xl border-0 shadow-sm`
- History items: `rounded-xl`

**11. `src/pages/deen/QiyamPlanner.tsx`**
- Tonight's plan card: Orange gradient hero
- Log entries: `rounded-xl border-0 shadow-sm`

**12. `src/pages/deen/RamadanOptimizer.tsx`**
- Daily summary card: Orange gradient hero
- Checklist cards: `rounded-xl border-0 shadow-sm active:scale-[0.98]`

**13. `src/pages/deen/HajjUmrahPlanner.tsx`**
- Step cards: `rounded-xl border-0 shadow-sm`
- Progress bar card: Orange gradient hero
- Collapsible dua sections: `rounded-xl`

**14. `src/pages/deen/DailyDakwah.tsx`**
- Poster card: `rounded-xl border-0 shadow-md`
- Action buttons: `rounded-lg`

### Summary of Pattern

Each subpage gets:
1. **One orange gradient hero card** at the top (summary/stats)
2. **All other cards** → `rounded-xl border-0 shadow-sm`
3. **Interactive cards** → `hover:shadow-md active:scale-[0.98] transition-all duration-200`
4. **Section headers** → `text-xs font-semibold uppercase tracking-wider text-muted-foreground`
5. **Icon containers** → `w-9+ h-9+ rounded-xl` with colored bg and `ring-1`

No logic changes — purely visual polish to match the dashboard's premium, warm aesthetic.


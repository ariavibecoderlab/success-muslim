

## Polish Dashboard to Match Iman Page Style

### Key Iman Page Patterns to Adopt
- Gradient icon backgrounds (`bg-gradient-to-br from-X-400/80 to-X-500/80` with white icons)
- Stagger animations on grid items (`staggerContainer` + `staggerItem`)
- Interactive quote banner with tap-to-rotate and dot indicators
- Cards with `hover:shadow-md active:scale-[0.98]` micro-interactions
- Section headers: `text-xs font-semibold text-muted-foreground uppercase tracking-wider`
- Quote card: `border-0 shadow-sm` with subtle gradient

---

### Changes

#### 1. QuickLogGrid -- Gradient Icons + Stagger Animation
Replace flat pastel icon backgrounds with gradient pill icons matching Iman's spiritual tools style. Add stagger animation to each grid item.

| Item | Gradient |
|------|----------|
| Prayer | `from-emerald-400/80 to-emerald-500/80` |
| Quran | `from-amber-400/80 to-amber-500/80` |
| Dhikr | `from-pink-400/80 to-rose-500/80` |
| Fast | `from-orange-400/80 to-orange-500/80` |
| Water | `from-blue-400/80 to-blue-500/80` |
| Sleep | `from-indigo-400/80 to-indigo-500/80` |
| Tasks | `from-rose-400/80 to-rose-500/80` |
| Habits | `from-teal-400/80 to-teal-500/80` |

Icon class changes to `text-white`. Cards get `hover:shadow-md active:scale-[0.98]`. Grid items wrapped in `motion.div` with stagger variants.

#### 2. LifeScoreCard -- Border-0, Shadow
Update card to use `border-0 shadow-md` (matching Iman hero card feel). Keep the existing gradient background. The pillar icon backgrounds already use gradient -- no change needed.

#### 3. DailyQuoteCard -- Tap-to-Rotate with Dot Indicators
Match Iman's quote banner exactly:
- Add `useState` for quote index, click-to-rotate with `AnimatePresence`
- Add dot indicators below quote
- Change card to `border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20`
- Expand QUOTES array to 7 items (matching Iman's richer set)

#### 4. constants.ts -- Add Stagger Variants
Add `staggerContainer` and `staggerItem` animation variants (matching Iman page) so QuickLogGrid and other components can use them.

#### 5. WidgetGrid -- Micro-interactions
No structural changes, but widgets already have their own styling. Ensure consistent `hover:shadow-md` on widget cards.

---

### Files Modified (4)

| File | Change |
|------|--------|
| `src/components/dashboard/constants.ts` | Add `staggerContainer` and `staggerItem` variants |
| `src/components/dashboard/QuickLogGrid.tsx` | Gradient icons, white text, stagger animation, `hover:shadow-md active:scale-[0.98]` |
| `src/components/dashboard/DailyQuoteCard.tsx` | Tap-to-rotate quotes, AnimatePresence, dot indicators, Iman-matching gradient |
| `src/components/dashboard/LifeScoreCard.tsx` | `border-0 shadow-md` styling |

### Technical Notes
- All patterns directly copied from the proven Iman page implementation
- No new dependencies (framer-motion already imported in all components)
- Dark mode support added via `dark:from-emerald-950/20 dark:to-teal-950/20` on quote card
- Purely visual -- no data/behavioral changes


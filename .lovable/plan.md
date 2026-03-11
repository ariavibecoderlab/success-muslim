

## Fix Green-on-Orange Readability Issues

After reviewing all modified files, I found **green text/elements rendering on orange backgrounds** in two files. The CSS variable `--primary` resolves to green (`120 61% 24%`), so any `text-primary`, `bg-primary`, or `hsl(var(--primary))` inside orange gradient cards will show unreadable green.

### Issues Found

**1. `src/pages/SunnahTracker.tsx`** — Hero card (lines 136–199) has 5 problems:

| Line | Current (Green) | Fix (White) |
|------|----------------|-------------|
| 144 | `bg-primary/10` (celebration overlay) | `bg-black/20` |
| 147 | `text-primary` (Trophy icon) | `text-white` |
| 148 | `text-primary` ("All Done!" text) | `text-white` |
| 149 | `text-muted-foreground` (subtitle) | `text-white/60` |
| 158 | SVG stroke `hsl(var(--secondary))` (ring bg) | `rgba(255,255,255,0.2)` |
| 161 | SVG stroke `hsl(var(--primary))` (ring progress) | `white` |
| 188–192 | Week dots: `bg-primary`, `bg-primary/30`, `text-primary`, `bg-primary/10`, `bg-secondary` | `bg-white`, `bg-white/30`, `text-white`, `bg-white/10`, `bg-white/15` |
| 195 | Week labels: `text-muted-foreground` | `text-white/50` |

**2. `src/pages/deen/RamadanOptimizer.tsx`** — Line 292: `<Progress>` component inside orange hero card renders a green bar. Replace with a custom white progress bar: `<div className="h-1.5 mt-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${(ramadanDay/30)*100}%` }} /></div>`.

### Files Modified
- `src/pages/SunnahTracker.tsx` — Replace all `primary`/`secondary`/`muted-foreground` references inside the orange hero card with white-based equivalents
- `src/pages/deen/RamadanOptimizer.tsx` — Replace `<Progress>` with white custom bar inside orange card

All other orange cards (PrayerTimes, QiyamPlanner, HajjUmrah, DailyDakwah, SadaqahTracker, ZakatCalculator, DeenFasting) already use `text-white` and `text-white/70` correctly — no issues there.


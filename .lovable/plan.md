

## Polish Ramadhan Qada Track & Fidyah to Match Iman Design

The Iman page uses specific design patterns: uppercase tracking-wider section headers, gradient icon containers, stagger/fadeUp animations, compact card padding (p-3.5/p-4), `text-[10px]`/`text-[13px]` typography, and subtle shadows. Both sub-pages currently look generic by comparison.

### Changes

**1. `RamadhanQadaTrack.tsx` — Redesign**
- Add fadeUp + stagger animation variants (matching Iman)
- Replace plain progress card with a gradient hero card (orange theme, matching the Ramadhan tracker card on /iman) showing completed/total, percentage ring, streak, and remaining
- Section headers → `text-xs font-semibold text-muted-foreground uppercase tracking-wider`
- Day list items → tighter padding (p-2.5), smaller rounded icons (w-7 h-7), `text-[13px]` font for date, `text-[10px]` for status labels
- Add streak display with Flame icon in the hero card
- Wrap sections in motion.div with stagger animations

**2. `Fidyah.tsx` — Redesign**
- Add fadeUp + stagger animation variants
- Replace title section with a gradient hero card (emerald theme, matching the Fidyah card on /iman) containing the calculator icon and description
- Section headers → uppercase tracking-wider style
- Currency selector → smaller pills (`text-[10px]`, `px-2.5 py-1`)
- Input labels → `text-xs font-medium`
- Result card → keep gradient bg but use tighter padding and match typography scale
- History section → card-wrapped list with gradient icon prefix, matching the Active Trackers card style from /iman
- Educational card → tighter padding (p-4), smaller icon, `text-[10px]` body text
- Wrap sections in motion.div with stagger animations

**3. Shared patterns applied to both pages**
- Import and use same animation variants (`fadeUp`, `staggerContainer`, `staggerItem`) as Iman
- Use gradient icon containers (`w-8 h-8 rounded-lg bg-gradient-to-br`) consistently
- Progress bars use `h-1.5` (matching Iman trackers) instead of `h-3`
- Cards use `hover:shadow-md transition-shadow` pattern


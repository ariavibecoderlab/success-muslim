

## Polish Fidyah Page to Align with Iman Design

The current Fidyah page has basic card layouts but lacks the refined visual density and polish of the Iman (Deen) page. Here's what needs to change:

### Changes to `src/pages/Fidyah.tsx`

**1. Richer Hero Card** — Replace the simple icon+text hero with a gradient card similar to the Iman prayer hero: emerald-to-teal gradient background, white text, `border-0 shadow-md`, with a pulsing icon container (`bg-white/15 backdrop-blur-sm`).

**2. Calculator Card Polish** — Tighten spacing, add section header (`text-xs font-semibold uppercase tracking-wider`), use `border-0 shadow-sm` card style. Currency pills get active state with `bg-primary text-primary-foreground` instead of just border highlight.

**3. Result Card Enhancement** — Add a scale-in animation, use the same `border-0 shadow-md` gradient style. Add a breakdown row showing days × cost formula in muted text.

**4. Educational Card** — Match the Iman quote banner style: `border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20`.

**5. History Section** — Add section header matching Iman's "Today's Progress" style. History items get tighter layout with `text-[11px]` dates, proper dividers, and gradient icon containers.

**6. Animation Alignment** — Use `fadeUp` with custom delay indices (matching Iman's `custom={1}`, `custom={2}` pattern) instead of just `staggerItem` for top-level sections. Keep `staggerContainer` for list items.

**7. Overall Styling** — Remove `hover:shadow-md` (Iman doesn't use it), use `border-0 shadow-sm` for regular cards and `border-0 shadow-md` for hero/accent cards. Match the `space-y-5` rhythm and `px-5 py-6` container padding from Iman.


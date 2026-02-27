

## Polish /iman Page to Match /health Design Language

Aligning the Iman page with the Health page's colorful, energetic "Apple Health meets Islamic wellness" aesthetic.

### Key Design Gaps

| Element | Health (current) | Iman (current) |
|---------|-----------------|----------------|
| Hero card | Gradient bg (emerald/orange), border-0, shadow-lg, animated icon | Flat primary/10 bg, standard border |
| Stats strip | Animated SVG StatsRings with colors | Plain cards, no rings, no color |
| Feature grid | Gradient icon badges + ChevronRight arrows | Monochrome primary/10 icons, no arrows |
| Quote banner | Rotating Islamic quotes with dots | None |
| Quick actions | 6 colorful gradient circle buttons | None |
| Animations | staggerContainer + staggerItem variants | Basic fadeUp only |

### Changes to `src/pages/Deen.tsx`

**1. Prayer Hero Card -- gradient treatment**
- Change from `bg-gradient-to-br from-primary/10 via-primary/5` to a rich gradient like `from-emerald-600 to-teal-700 text-white border-0 shadow-lg`
- Add animated icon wrapper (pulsing scale like Health's Timer)
- White text styling for prayer names and countdown

**2. Add Iman Quote Banner**
- Add a rotating Islamic/spiritual quote section (tap to cycle) matching Health's quote card
- Quotes focused on iman, salah, Quran

**3. Iman Summary Strip -- use StatsRings**
- Replace plain cards with 4 animated StatsRings (Salah, Dhikr, Quran, Sunnah)
- Each ring gets a unique color (green, pink, amber, purple)
- Reuse the same StatsRing component from Health

**4. Spiritual Tools Grid -- colorful gradient icons + ChevronRight**
- Give each tool card a unique gradient for the icon badge (e.g., Quran = amber, Dhikr = pink, Sunnah = purple, Prayer Times = blue, Zakat = emerald, Sadaqah = rose, Qiyam = indigo, Ramadan = orange, Hajj = teal, Da'wah = violet)
- Add `ChevronRight` arrow on each card (matching Health's feature cards)
- Use compact `p-3.5` padding with horizontal layout like Health

**5. Add stagger animations**
- Import and use `staggerContainer` + `staggerItem` variants for the tools grid
- Consistent timing with Health (0.06s stagger, 0.4s duration)

**6. Active Trackers section -- add gradient icon badges**
- Give Qada, Ramadhan, Fidyah tracker cards gradient icon badges instead of flat primary/10

### Files Modified
- `src/pages/Deen.tsx` (single file, all changes)

### What stays the same
- All data logic, hooks, and calculations unchanged
- Prayer times strip layout (already good)
- Active tracker progress bars
- Bottom setup actions grid


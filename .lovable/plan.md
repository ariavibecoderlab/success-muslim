

## Redesign /health Page — "Apple Health Meets Islamic Wellness"

### PROGRESS.md Update
- Update date to 2026-02-21
- Add new row: `IF End-Fast Review Screen | ✅ | Summary with total time, stats grid, weight input, notes, save/discard`
- Add new row: `IF Onboarding Polish | ✅ | Consistent font-black headers, subtitles on all steps`
- Add new row: `Health Hub Redesign | ✅ | Colorful Apple Health-style layout, IF Timer hero, gradient feature cards, animated rings`

### Health Page Redesign (src/pages/Health.tsx)

**1. IF Timer Hero Card at Top**
- Large prominent card at the very top (replaces the generic Heart hero)
- When inactive: gradient background (green-to-teal), large Timer icon with breathing animation, "Start a Fast" CTA button, last fast summary text
- When active: live countdown ring, elapsed time, pulsing green dot, progress bar, "View Fast" button linking to /health/if-timer
- This makes IF the flagship feature of the wellness page

**2. Colorful Stats Ring Section**
- Replace the flat 4-column grid with larger, color-coded circular progress rings (Apple Health style)
- Each ring gets a distinct vibrant color:
  - Water: blue (#3B82F6)
  - Steps: orange (#F97316)
  - Sleep: indigo (#6366F1)
  - BMI: emerald (#10B981)
- Rings are bigger (size 56px) with bold center values
- Arranged in a 2x2 grid with labels below each ring

**3. Gradient Feature Cards**
- Each feature card gets a unique gradient icon background matching its theme:
  - BMI: emerald gradient
  - Weight: amber gradient
  - Hydration: blue gradient
  - Sleep: indigo gradient
  - Steps: orange gradient
  - Sunnah Fasting: purple gradient
- Remove IF Timer from the feature grid (it's now the hero)
- Cards get slightly rounded icon containers with gradient fills
- Arrow/chevron indicator on each card for tap affordance

**4. Sunnah Reminder Enhancement**
- Warmer gradient background (amber/yellow tones) instead of plain secondary
- Moon icon with subtle glow effect
- Slightly larger text with encouraging tone

**5. Animation Polish**
- All existing framer-motion staggered animations retained
- IF Hero card gets a scale-in entrance
- Stats rings animate their stroke-dashoffset on mount (countUp effect)
- Feature cards keep staggered fadeUp

### Technical Details
- Single file change: `src/pages/Health.tsx`
- Plus `PROGRESS.md` update
- No new dependencies
- Features array reduced from 7 to 6 (IF Timer removed from grid)
- MiniRing component upgraded with larger default size and animated offset


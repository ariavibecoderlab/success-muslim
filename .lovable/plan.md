

## UX Audit: /iman Page Layout

### Current State (from screenshot)

The page stacks **two large orange gradient blocks** (Ramadan Banner + Prayer Hero Card) back-to-back, followed by a date strip, stats rings, score bar, and two list sections. Total: 7 vertical zones requiring significant scroll.

### Issues Found

| Element | Problem | Recommendation |
|---------|---------|----------------|
| **Ramadan Banner** | Takes ~200px of prime real estate. Shows day count, streak, motivational text, progress bar — all separate from the prayer card below | **Merge into Prayer Hero Card** — add a compact "Day 22/30" badge + progress bar inside the prayer card during Ramadan. Eliminates one entire section |
| **Date + Location strip** | Floats awkwardly between two sections. It's contextual to prayer times but visually orphaned | **Move into Prayer Hero Card** as a subtle bottom line (hijri date + city). Saves one section |
| **Prayer Times in Spiritual Tools** | The hero card already links to `/iman/prayer-times`. Having it again in the tools list is redundant | **Remove** from `spiritualTools` array |
| **Salah Log missing** | Stats ring shows "1/5 Salah" but there's no tool row to log salah. Users see status but can't act | **Add** "Salah Log" row to Spiritual Tools pointing to `/iman/salah-log` |
| **Loading state** | "Loading prayer times..." renders a full-size orange card — wastes space before data arrives | **Make compact** — show a slim skeleton placeholder instead of the full card layout |

### Plan

#### `src/pages/Deen.tsx`

1. **Remove standalone RamadanBanner** — instead, when `isRamadan`, show inside the prayer hero card:
   - Small badge: `Ramadan Day {ramadanDay}/30` in top-left
   - Slim progress bar at bottom of the card (white/alpha)
   - Remove the `<RamadanBanner>` import and usage

2. **Move Date + Location into Prayer Hero Card** — add as a subtle line below the 5-prayer strip:
   ```text
   22 Ramadhan 1447 H · Banjararum
   ```
   White/70 text. Remove the separate date section (lines 296-310).

3. **Remove Prayer Times from `spiritualTools`** array (line 98) — already represented by the hero card

4. **Add Salah Log** to `spiritualTools`:
   ```ts
   { icon: Target, title: 'Salah Log', path: '/iman/salah-log' }
   ```
   With description showing `${salahCount.logged}/5 logged today`

5. **Compact loading state** — replace the full-card "Loading prayer times..." with a slim skeleton bar (h-16 rounded-xl with pulse animation)

### Result
- Removes 2 vertical sections (Ramadan Banner, Date strip)
- Eliminates 1 redundant tool row
- Adds 1 missing action (Salah Log)
- Net: shorter page, less scroll, better information density

### Files Modified
- `src/pages/Deen.tsx` — merge Ramadan + date into hero card, update tools list, compact loading


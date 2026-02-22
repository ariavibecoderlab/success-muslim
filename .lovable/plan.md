

## Fix Qada Solat Tracker

### Problems and Root Causes

1. **"43,867 remaining"** -- The calculation is mathematically correct (e.g., 18 years x 365 days x 65% missed x 5 prayers = ~21k). The number may seem unrealistic but is accurate based on user input. The real issue is users can't edit their total if they entered wrong values.

2. **"Est. 2 March 2050"** -- The completion estimate shows an absolute date far in the future. For long timelines, "~24 years at current pace" is more useful than a specific date.

3. **Progress bar at 0%** -- `Math.round()` rounds tiny percentages (e.g., 25/43867 = 0.057%) to 0%. The progress bar needs a minimum visible value when any progress exists.

### Changes

#### 1. `src/pages/QadaSolatTrack.tsx` -- Main tracker page

- Add "Edit" button (Settings2 icon) next to "Overall Progress" heading
- Add Dialog to edit `totalPrayers` and `dailyTarget` -- saves via `saveQadaSetup()`
- Replace `estimateCompletionDate()` with `formatYearsMonths(estimateCompletionDays())` for human-friendly display
- Add minimum progress bar value: `Math.max(pct, progress.totalCompleted > 0 ? 0.5 : 0)` so any progress shows a visible sliver
- Upgrade encouragement messages:
  - Streak >= 5: "5 day streak -- MashaAllah!"
  - Streak >= 3: "Keep it up! X day streak"
  - Any progress today: "Every prayer counts. Keep going"
  - No progress: "Bismillah, start your qada"
- Format remaining with `toLocaleString()` (already done) and add "~X years at current pace" below

#### 2. `src/pages/Deen.tsx` -- Iman page (Qada Solat card)

- Line 416: Replace `Est. {estimateCompletionDate(...)}` with `~{formatYearsMonths(estimateCompletionDays(...))} left`
- Line 421: Replace `Math.round(...)` with logic that shows at least `<1%` when progress > 0 but rounds to 0
- Line 424: Add minimum progress bar value (same `Math.max` pattern)

#### 3. `src/lib/storage.ts` -- Add `updateQadaSetup` export

- Add function to update setup fields (totalPrayers, dailyTarget, totalByPrayer) without resetting progress
- Re-export `saveQadaSetup` is sufficient since it already exists; the tracker page will modify setup fields and call `saveQadaSetup()`

#### 4. `PROGRESS.md` -- Update with fix details

### Technical Details

**Edit Dialog fields:**
- "Total Qada Prayers" -- number input, pre-filled with current `setup.totalPrayers`
- "Daily Target" -- number input, pre-filled with current `setup.dailyTarget`
- On save: update `setup.totalPrayers`, recalculate `totalByPrayer` (divide evenly by 5), call `saveQadaSetup()`

**Progress bar minimum:**
```typescript
const displayPct = progress.totalCompleted > 0 ? Math.max(pct, 0.5) : 0;
```

**Completion estimate format:**
```typescript
// Before: "Est. 2 March 2050"
// After:  "~24 years at current pace"
const completionDays = estimateCompletionDays(setup, progress.totalCompleted);
const completionText = completionDays > 0 
  ? `~${formatYearsMonths(completionDays)} at current pace`
  : 'Done!';
```

**Encouragement logic:**
```typescript
const encouragement = dayTotal >= setup.dailyTarget
  ? "Alhamdulillah! Target reached! 🌟"
  : progress.currentStreak >= 5
  ? `${progress.currentStreak} day streak — MashaAllah! 🔥`
  : progress.currentStreak >= 3
  ? `${progress.currentStreak} day streak — keep it up! 💪`
  : dayTotal > 0
  ? "Every prayer counts. Keep going 💪"
  : "Bismillah, start your qada";
```


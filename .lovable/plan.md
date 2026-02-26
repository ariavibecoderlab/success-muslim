

## Fix IF Timer Active Card on /health Homepage

### Problem Analysis

The IF Timer hero card on `/health` (Health.tsx, lines 160-210) displays **remaining time** (`ifRemaining`), not elapsed time. When a fast exceeds its target duration (e.g., user fasts 17h on a 16h plan), remaining = 0 and progress = 100%, making the card appear stuck.

### Root Cause

- Line 210: `{formatCountdown(ifRemaining)}` shows remaining time, not elapsed
- When `elapsed > total`, `ifRemaining` = `Math.max(0, total - elapsed)` = 0
- Progress: `Math.min((elapsed / total) * 100, 100)` = 100%
- This is technically correct for "remaining" but unhelpful -- user wants to see how long they've been fasting

### Changes

#### 1. `src/pages/Health.tsx` -- Fix hero card display

- Calculate `ifElapsed` alongside existing values
- Replace `formatCountdown(ifRemaining)` with `formatCountdown(ifElapsed)` to show elapsed time
- Change label from "Fasting Active" to show elapsed context (e.g., "Fasting -- Xh Ym")
- Keep progress ring working as-is (it correctly shows % toward goal, capped at 100%)

**Specific code changes:**
- Add `ifElapsed` variable: `const elapsed = now - start; const ifElapsed = elapsed;`
- Change display line 210 from `formatCountdown(ifRemaining)` to `formatCountdown(ifElapsed)`
- The `formatCountdown` function already handles ms-to-hours/minutes conversion correctly

#### 2. `PROGRESS.md` -- Add entry for this fix

### Technical Details

```text
Files changed:
  src/pages/Health.tsx     -- Show elapsed time instead of remaining on hero card
  PROGRESS.md              -- Log fix
```

The timer interval (1-second update via `setInterval`) and progress ring calculation are already correct. The only bug is displaying the wrong metric (remaining vs elapsed).


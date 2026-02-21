

# Fasting Stages Feature — Implementation Plan

## Overview
Add 11 fasting stages with scientific + Islamic framing to the IF Timer page and enhance the existing dashboard widget to show the current fasting level. No database changes needed — stages are static reference data stored as a TypeScript constant.

---

## 1. Create Fasting Stages Data: `src/lib/fasting-stages.ts`

A new file containing:
- `FASTING_STAGES` array with all 11 levels (level, startHours, endHours, name, description, islamicFraming, iconName using Lucide icon names)
- `getCurrentStage(elapsedHours: number)` helper — returns current stage based on elapsed hours
- `getNextStage(elapsedHours: number)` helper — returns next stage + time remaining to reach it
- `getStageProgress(elapsedHours: number)` — returns progress within current stage (0-100%)

No database table needed — this is immutable reference data.

---

## 2. Update IF Timer Page: `src/pages/health/HealthIFTimer.tsx`

### Current Stage Card (below timer ring, when fast is active)
- Level badge (e.g., "Lv.4")
- Stage name in large text
- Lucide icon for the stage
- Scientific description text
- Islamic framing in green/emerald text
- Mini progress bar showing "Next: Ketosis Starts in 2h 15m"

### Stages Timeline (below the current stage card)
- Horizontal scrollable row of 11 circles/dots
- Completed stages filled with primary color
- Current stage highlighted and pulsing (animate-pulse)
- Future stages greyed out
- Tap any stage to show a preview dialog/card with that stage's info

### Custom Fast Timer Fix
- Add two options when starting custom fast:
  - **Option A — Set Duration**: Quick-pick buttons (12h, 14h, 16h, 18h, Custom input) — stores `fastingHours` so timer counts DOWN
  - **Option B — Set End Time**: Time picker — calculates duration from now to end time, stores as `fastingHours`
- Both use the existing `startTime` saved in localStorage for resilience across app restarts
- Remove the current open-ended `fastingHours=0` approach — all fasts now have a known duration for proper stage tracking

---

## 3. Enhance IF Fasting Widget: `src/components/widgets/IFFastingWidget.tsx`

Update the active-fast display to include:
- Current level badge + stage name (e.g., "Lv.4 Fat Burning")
- Time remaining countdown
- Progress bar
- "Next level in: Xh Ym" text
- "Break Fast" button (already exists)
- Link to full IF Timer on tap
- When no fast active: "Start a fast today" with link to IF Timer

The widget is already registered in the widget registry as `if_fasting` — no changes needed there.

---

## 4. Update PROGRESS.md and plan.md

Add entries for:
- Fasting Stages (11 levels with scientific + Islamic framing)
- Custom Fast Timer fix (duration/end-time options)
- Enhanced IF widget with level display

---

## Files Changed

| File | Action |
|------|--------|
| `src/lib/fasting-stages.ts` | **Create** — 11 stages data + helper functions |
| `src/pages/health/HealthIFTimer.tsx` | **Modify** — Add stage card, timeline, fix custom fast |
| `src/components/widgets/IFFastingWidget.tsx` | **Modify** — Show current level + next level countdown |
| `PROGRESS.md` | **Modify** — Add fasting stages row |
| `.lovable/plan.md` | **Modify** — Update with completion notes |

## Technical Notes

- All 11 stages stored as a TypeScript constant — no DB migration needed
- Stage calculation is purely based on elapsed hours from `startTime`
- Timer resilience: recalculates from persisted `startTime` on app reopen
- Custom fast now always has a duration, enabling proper stage tracking and countdown
- Icons use Lucide React (Utensils, TrendingDown, Zap, Flame, Brain, BicepsFlexed, Recycle, Dumbbell, Sparkles, HeartPulse, Shield) — no emojis in UI
- The existing `IFActive` interface gains no new fields — stage is computed on the fly from elapsed time



# Daily Steps Tracker — Implementation Plan

## Overview
Add a full-featured manual steps tracker to the `/health` module, following the existing patterns (localStorage write-through, DB sync, widget registry, SubPageLayout).

---

## 1. Database Setup (2 migrations)

### Table: `steps_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, gen_random_uuid() |
| user_id | uuid | NOT NULL |
| date | date | NOT NULL |
| steps | integer | NOT NULL |
| activity_type | text | DEFAULT 'walking' |
| distance_meters | numeric | calculated |
| calories_burned | numeric | calculated |
| logged_at | timestamptz | DEFAULT now() |
| source | text | DEFAULT 'manual' (future: healthkit, googlefit, smartwatch) |
| created_at | timestamptz | DEFAULT now() |

RLS: standard user_id CRUD policies.

### Table: `steps_preferences`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | UNIQUE, NOT NULL |
| daily_target | integer | DEFAULT 10000 |
| stride_length_cm | numeric | DEFAULT 76.2 |
| reminder_enabled | boolean | DEFAULT false |
| reminder_time | text | nullable |
| created_at / updated_at | timestamptz | |

RLS: standard user_id CRUD policies.

---

## 2. Storage Layer: `src/lib/steps-storage.ts`

Follow the exact pattern of `health-storage.ts`:
- LocalStorage keys: `health_steps_logs`, `health_steps_prefs`
- Functions: `getStepsToday()`, `addStepLog()`, `deleteStepLog()`, `getStepsPrefs()`, `setStepsTarget()`, `getStepsHistory(7)`, `getStepsStreak()`, `getTotalStepsAllTime()`
- Distance calc: `steps * strideCm / 100` meters
- Calorie calc: `steps * 0.04` kcal (rough estimate)
- Each function calls a corresponding db-sync function

---

## 3. DB Sync additions in `src/lib/db-sync.ts`

Add sync functions:
- `syncStepLog(date, steps, activityType, distanceMeters, caloriesBurned, loggedAt)`
- `syncStepLogDelete(id)`
- `syncStepsPrefs(dailyTarget, strideLengthCm, reminderEnabled, reminderTime)`

---

## 4. Main Page: `src/pages/health/HealthSteps.tsx`

Full-featured page using `SubPageLayout` (same as Hydration/Sleep):

- **Hero Ring**: Large circular progress ring (steps / target), green when hit, amber when below
- **Log Steps Button**: Opens a dialog/card with number input + activity type selector (Walking, Running, Hiking, Others) + optional time
- **Today's Summary**: Total steps, estimated distance, estimated calories, list of all logs today with time + steps + activity
- **Stats Row**: 3 cards — Today's steps, Weekly average, Best day this week
- **Weekly Bar Chart**: 7-day recharts BarChart with target dotted reference line, green bars for target-met days
- **Target Setting**: Quick-pick buttons (5000, 7500, 10000, 12500, Custom) with WHO context
- **Streak and Milestones**: Consecutive days hitting target, milestone badges (1 day, 7-day, 30-day, 100K total, 1M total)
- **Sunnah Nudge**: Motivational message after hitting target
- **Coming Soon Banner**: "Connect your smartwatch or phone to auto-sync steps -- coming soon"

Sibling routes updated to include Steps.

---

## 5. Health Hub Integration: `src/pages/Health.tsx`

- Add `Footprints` icon entry to the features array: `{ icon: Footprints, title: 'Steps Tracker', desc: 'Daily step count & goals', path: '/health/steps' }`
- Add a Steps card to the quick stats grid showing today's steps vs target

---

## 6. Router: `src/App.tsx`

- Import `HealthSteps` and add route: `/health/steps`

---

## 7. Dashboard Widget: `src/components/widgets/StepsWidget.tsx`

- Small: shoe icon + steps count
- Medium: progress bar + steps/target + streak
- Register in `widget-registry.ts` as `steps_today`, module `health`

---

## 8. Update Sibling Routes

All health sub-pages' `HEALTH_SIBLINGS` array gets a new entry: `{ path: '/health/steps', label: 'Steps' }`

---

## 9. Documentation Updates

- **PROGRESS.md**: Add "Steps Tracker" row under Wellness Module
- **.lovable/plan.md**: Clear old plan, note Steps Tracker completion

---

## Technical Notes

- Activity types stored as: `'walking' | 'running' | 'hiking' | 'others'`
- `source` field defaults to `'manual'` — no code changes needed when smartwatch integration is added later, just a new source value
- Multiple logs per day are summed for the ring and stats
- Streak counts consecutive days where total steps >= daily target
- All icons use Lucide React (`Footprints`, `TrendingUp`, `Flame`, etc.) — no emojis in UI


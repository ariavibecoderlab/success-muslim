

# Health & Wellness Module - Full Implementation

This plan transforms the Health "Coming Soon" placeholder into a fully functional wellness hub with 6 interactive tools, all using localStorage for data persistence (matching the existing Deen module pattern).

---

## Overview

The Health page becomes a dashboard (like Deen) with quick stats at the top and links to 6 sub-pages:

1. **BMI Calculator** - Weight, height, BMI result with category, plus calorie recommendation (Mifflin-St Jeor formula)
2. **Weight Tracker** - Log daily weight, view trend chart (recharts line chart), set goal weight
3. **Hydration Tracker** - Track daily water intake (glasses/cups), daily goal, visual progress ring
4. **Sleep Tracker** - Log bedtime and wake time, calculate duration, track consistency
5. **Sunnah Fasting Calendar** - Calendar view showing Monday, Thursday, White Days (13-15th); tap to mark fasted
6. **Intermittent Fasting Timer** - Choose mode (16:8, 20:4, 24h), start/stop timer with countdown

---

## File Structure

### New Files to Create

```text
src/lib/health-storage.ts        -- localStorage helpers for all health data
src/pages/health/HealthBMI.tsx         -- BMI calculator + calorie recommendation
src/pages/health/HealthWeight.tsx      -- Weight log + trend chart
src/pages/health/HealthHydration.tsx   -- Daily water intake tracker
src/pages/health/HealthSleep.tsx       -- Sleep/wake log
src/pages/health/HealthFasting.tsx     -- Sunnah fasting calendar
src/pages/health/HealthIFTimer.tsx     -- Intermittent fasting timer
```

### Files to Modify

```text
src/pages/Health.tsx     -- Replace "Coming Soon" with dashboard hub
src/App.tsx              -- Add 6 new routes under /health/*
```

---

## Detailed Feature Specs

### 1. BMI Calculator (`/health/bmi`)
- Input: weight (kg), height (cm), age, gender
- Output: BMI value, category (underweight/normal/overweight/obese), color-coded badge
- Calorie section: TDEE using Mifflin-St Jeor formula with activity level selector (sedentary/light/moderate/active)
- Results saved to localStorage for reuse
- Clean card-based UI with the SubPageLayout wrapper

### 2. Weight Tracker (`/health/weight`)
- "Add Weight" button opens a simple input (kg, date defaults to today)
- Line chart (recharts) showing weight over time
- Goal weight input with a horizontal line on chart
- Stats: current weight, highest, lowest, change from start
- Data stored as array of `{ date: string, weight: number }` in localStorage

### 3. Hydration Tracker (`/health/hydration`)
- Visual: circular progress ring showing cups consumed vs daily goal
- Tap "+" to add a glass (250ml default)
- Daily goal configurable (default 8 glasses)
- History: last 7 days shown as small bar chart
- Auto-resets each day

### 4. Sleep Tracker (`/health/sleep`)
- Input: bedtime and wake time (time pickers)
- Calculates duration automatically
- Shows sleep quality indicator (< 6h = poor, 6-7h = fair, 7-9h = good, > 9h = too much)
- Weekly average display
- Last 7 days mini bar chart

### 5. Sunnah Fasting Calendar (`/health/fasting`)
- Monthly calendar grid
- Recommended days highlighted: Monday (blue), Thursday (blue), White Days 13-15 (gold)
- Tap a day to toggle "fasted" (green check)
- Monthly summary: X days fasted, X recommended days hit
- Streak counter for consecutive recommended days

### 6. Intermittent Fasting Timer (`/health/if-timer`)
- Mode selector: 16:8, 18:6, 20:4, 24h, 36h, custom
- Big circular countdown timer (CSS animated)
- Start/Stop/Reset buttons
- Shows fasting window and eating window times
- History of completed fasts (last 10)

---

## Health Dashboard (`/health` - Hub Page)

Replaces the "Coming Soon" page with:

1. **Hero card** - "Body is an Amanah" tagline with today's quick stats (current BMI, water intake, sleep last night)
2. **Quick stats row** - 3 cards: BMI value, glasses today, sleep hours last night
3. **Feature cards** - 6 navigable cards (like Deen's "Spiritual Tools" section) linking to each sub-page
4. **Sunnah reminder** - Small card: "The Prophet (SAW) fasted Mondays and Thursdays" if today is Mon/Thu

---

## Data Storage (`src/lib/health-storage.ts`)

All data persisted in localStorage with these keys:

```text
health_bmi         -> { weight, height, age, gender, activityLevel, bmi, tdee, date }
health_weight_log  -> [{ date, weight }]
health_weight_goal -> number
health_hydration   -> { [dateKey]: { cups, goal } }
health_sleep       -> [{ date, bedtime, wakeTime, duration }]
health_fasting     -> { [dateKey]: boolean }  (sunnah fasting)
health_if_sessions -> [{ mode, startTime, endTime, completed }]
health_if_active   -> { mode, startTime } | null
```

---

## Routing

New routes added to `App.tsx` inside the AuthGuard block (same pattern as Deen sub-pages):

```text
/health/bmi        -> HealthBMI
/health/weight     -> HealthWeight
/health/hydration  -> HealthHydration
/health/sleep      -> HealthSleep
/health/fasting    -> HealthFasting
/health/if-timer   -> HealthIFTimer
```

All sub-pages use `SubPageLayout` with `backTo="/health"` and sibling route navigation between features.

---

## Technical Notes

- All calculations are client-side (no backend needed for MVP)
- localStorage-only persistence (matches existing Deen pattern)
- Recharts used for weight trend and sleep charts (already installed)
- framer-motion for animations (already installed)
- date-fns for date operations (already installed)
- SubPageLayout component reused for consistent nav and swipe between health sub-pages
- Responsive design matching existing app style (max-w-md, cards, rounded corners)


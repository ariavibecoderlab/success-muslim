

## Enhance Productivity Module — Advanced Features, Easy UX

### Overview
Transform the productivity hub from a simple navigation page into an interactive command center, and add powerful features to each sub-page while keeping interactions dead simple.

---

### 1. Productivity Hub (`src/pages/Productivity.tsx`) — Complete Redesign

**Today's Focus Board** (replaces plain stats + nav list):
- **Inline MIT cards** — show today's 3 MITs directly on the hub with tap-to-toggle. No need to navigate to Daily Tasks just to check off an MIT
- **Habit quick-row** — horizontal row of habit circles, tap to toggle done/undone right from the hub
- **Weekly sparkline** — tiny 7-day bar chart showing daily completion % (tasks + habits combined)
- **Productivity Score** — single number (0-100) combining MIT completion (40%), habit consistency (30%), life area average (30%), shown in a circular ring
- Keep nav cards to sub-pages at bottom, but as compact pills

**New data helper**: Add `getWeeklyCompletionData()` to `productivity-storage.ts` that returns last 7 days of task + habit completion percentages.

---

### 2. Daily Tasks (`src/pages/productivity/DailyTasks.tsx`) — Focus Timer + Subtasks

**Pomodoro Focus Mode**:
- Each task gets a small "play" button. Tapping it starts a 25-min focus timer shown as a top banner with countdown ring
- Timer persists in component state (no DB needed). Break timer (5 min) auto-starts after
- Simple start/pause/stop controls

**Task Notes** (lightweight subtasks):
- Tap a task row to expand it, showing a small text area for notes/subtasks
- Stored in localStorage alongside the task object (add `notes?: string` to `Task` type)
- No DB migration needed — just extend the localStorage JSON

**Swipe to complete/delete**:
- Add swipe-right gesture (via framer-motion drag) to toggle complete
- Swipe-left to reveal delete button

**Files**: Modify `src/pages/productivity/DailyTasks.tsx`, extend `Task` type in `src/lib/productivity-storage.ts`

---

### 3. Habit Streaks (`src/pages/productivity/HabitStreaks.tsx`) — Frequency + Progress Ring

**Habit Frequency**:
- When adding a habit, user can pick: Daily / Weekdays / Custom (pick specific days)
- Shown as tiny day pills (M T W T F S S) under the habit name
- Extend `Habit` type with `frequency?: 'daily' | 'weekdays' | number[]`
- Streak calculation respects frequency (skip non-scheduled days)

**Individual Habit Detail Sheet**:
- Tap a habit to open a bottom drawer showing: current streak, longest streak, completion rate (last 30 days), mini calendar heatmap for just that habit
- Computed from existing `HabitLog` data, no new DB tables

**Celebration animation**:
- When a habit hits 7, 30, 100 day streaks, show a confetti burst using CSS animation

**Files**: Modify `src/pages/productivity/HabitStreaks.tsx`, extend `Habit` type in `src/lib/productivity-storage.ts`, extend `useAddHabit` in `src/hooks/useHabitsQuery.ts`

---

### 4. Life Areas (`src/pages/productivity/LifeAreas.tsx`) — Trend + Insights

**Month-over-month comparison**:
- Overlay previous month's radar as a dashed line on the same chart
- Show delta arrows (+0.5 / -1.2) next to each slider

**AI-generated insight** (optional, lightweight):
- Based on lowest 2 scores, show a static tip card (e.g., "Your Health score dropped — try adding a daily walk habit")
- No API call needed — just pattern-match on scores to show relevant suggestions from a static tips map

**Files**: Modify `src/pages/productivity/LifeAreas.tsx`

---

### 5. Storage & Type Extensions

**`src/lib/productivity-storage.ts`**:
- Add `notes?: string` to `Task` interface
- Add `frequency?: 'daily' | 'weekdays' | number[]` to `Habit` interface
- Add `getWeeklyCompletionData()` helper
- Add `getLongestStreak(habitId)` helper

**`src/hooks/useHabitsQuery.ts`**:
- Pass `frequency` through `useAddHabit`

**`src/hooks/useTasksQuery.ts`**:
- Add `useUpdateTaskNotes` mutation

**No database migrations needed** — all new fields are optional and stored in existing JSONB/localStorage structures. The `habits` DB table already has flexible columns; `frequency` can be stored alongside existing fields via a simple column add if needed later.

---

### Files Modified (6 files)
1. `src/pages/Productivity.tsx` — hub redesign with inline MITs, habit toggles, weekly chart, productivity score
2. `src/pages/productivity/DailyTasks.tsx` — focus timer, task notes, swipe gestures
3. `src/pages/productivity/HabitStreaks.tsx` — frequency picker, detail sheet, celebration
4. `src/pages/productivity/LifeAreas.tsx` — trend overlay, insight cards
5. `src/lib/productivity-storage.ts` — type extensions, new helpers
6. `src/hooks/useHabitsQuery.ts` — frequency support in add mutation


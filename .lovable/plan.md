

## React Query Migration -- Productivity and Quran Modules

### Overview
Migrate 4 sub-modules from localStorage-first (with fire-and-forget DB sync) to React Query as single source of truth. This matches the proven pattern already used by Salah, Dhikr, Sunnah, Health, Steps, and Qada modules.

### Architecture Pattern (matching existing `useSalahQuery.ts`)
- `useQuery` fetches from DB when user is logged in, falls back to localStorage for anonymous/offline
- `initialData` from localStorage for instant UI (zero flash)
- `useMutation` writes to DB, then invalidates query cache
- localStorage updated as side-effect (offline fallback)

---

### Part 1: Daily Tasks Hook

**New file: `src/hooks/useTasksQuery.ts`**

| Hook | Query Key | DB Table | localStorage Fallback |
|------|-----------|----------|----------------------|
| `useDailyTasks(date)` | `['tasks', userId, date]` | `daily_tasks` WHERE date = date | `getDailyTasks(date)` |
| `useAddTask()` | mutation, invalidates tasks | INSERT `daily_tasks` | `saveDailyTasks()` |
| `useToggleTask()` | mutation, invalidates tasks | UPDATE `daily_tasks.completed` | `saveDailyTasks()` |
| `useDeleteTask()` | mutation, invalidates tasks | DELETE `daily_tasks` | `saveDailyTasks()` |
| `useTaskStreak()` | `['task-streak', userId]` | query last 365 days | `getTaskStreak()` |

**Consumer updates:**
- `DailyTasks.tsx` -- replace `useState(() => getDailyTasks())` with `useDailyTasks(dateKey)`
- `TasksTodayWidget.tsx` -- use `useDailyTasks()`

---

### Part 2: Habits Hook

**New file: `src/hooks/useHabitsQuery.ts`**

| Hook | DB Table | localStorage Fallback |
|------|----------|----------------------|
| `useHabits()` | `habits` | `getHabits()` |
| `useHabitLog(days?)` | `habit_log` | `getHabitLog()` |
| `useAddHabit()` | INSERT `habits` | `saveHabits()` |
| `useDeleteHabit()` | DELETE `habits` + related logs | `saveHabits()` |
| `useToggleHabit()` | INSERT/DELETE `habit_log` | `saveHabitLog()` |

**Consumer updates:**
- `HabitStreaks.tsx` -- replace direct storage calls with hooks

---

### Part 3: Life Areas Hook

**New file: `src/hooks/useLifeAreasQuery.ts`**

| Hook | DB Table | localStorage Fallback |
|------|----------|----------------------|
| `useLifeAreaEntries()` | `life_area_scores` (grouped by date) | `getLifeAreaEntries()` |
| `useSaveLifeAreaEntry()` | UPSERT `life_area_scores` | `saveLifeAreaEntry()` |

**Consumer updates:**
- `LifeAreas.tsx` -- replace direct storage calls with hooks

---

### Part 4: Quran Storage Hook

**New file: `src/hooks/useQuranStorageQuery.ts`**

| Hook | DB Table | localStorage Fallback |
|------|----------|----------------------|
| `useQuranDay(date)` | `quran_log` WHERE date = date | `getQuranDay(date)` |
| `useLogQuranPages()` | UPSERT `quran_log` | `logQuranPages()` |
| `useQuranStats()` | all `quran_log` rows | computed from localStorage |

**Consumer updates:**
- `QuranTracker.tsx` -- replace `useState(() => getQuranDay())` with `useQuranDay(dateKey)`

---

### Part 5: Dashboard and Cleanup

**Dashboard.tsx** -- Update life score computation to use the new hooks instead of direct `getDailyTasks()`, `getHabits()`, `getHabitLog()`, `getQuranDay()` calls.

**Storage files cleanup:**
- `productivity-storage.ts` -- remove `syncTaskAdd`, `syncTaskToggle`, `syncTaskDelete`, `syncHabitAdd`, `syncHabitDelete`, `syncHabitLogToggle`, `syncLifeAreaScores` import/calls. Keep functions as localStorage helpers only.
- `quran-storage.ts` -- remove `syncQuranLog` import/call. Keep functions as localStorage helpers only.
- `db-sync.ts` -- the sync functions remain available but are no longer called from storage files (mutations handle DB writes directly).

**Update `PROGRESS.md`** with migration completion status.

---

### Files Summary

**New files (4):**
- `src/hooks/useTasksQuery.ts`
- `src/hooks/useHabitsQuery.ts`
- `src/hooks/useLifeAreasQuery.ts`
- `src/hooks/useQuranStorageQuery.ts`

**Modified files (8):**
- `src/pages/productivity/DailyTasks.tsx`
- `src/pages/productivity/HabitStreaks.tsx`
- `src/pages/productivity/LifeAreas.tsx`
- `src/pages/QuranTracker.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/widgets/TasksTodayWidget.tsx`
- `src/lib/productivity-storage.ts`
- `src/lib/quran-storage.ts`

**No database migrations needed** -- all tables (`daily_tasks`, `habits`, `habit_log`, `life_area_scores`, `quran_log`) already exist with proper RLS policies.


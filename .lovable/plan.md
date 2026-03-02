

## React Query Migration — Productivity & Quran Modules

### Goal
Migrate Productivity (Tasks, Habits, Life Areas) and Quran (quran-storage) from localStorage-first to React Query as source of truth, matching the pattern used by Salah, Dhikr, Sunnah, Health, and Steps modules.

### Pattern (existing, proven)
1. Create `useXxxQuery.ts` hook with `useQuery` + `useMutation`
2. DB is source of truth; localStorage used only as `initialData` for instant UI
3. Mutations: write DB → invalidate cache → update localStorage as side effect
4. All consumers use the hook instead of direct storage function calls

---

### Part 1: Productivity — Daily Tasks

**New hook: `src/hooks/useTasksQuery.ts`**
- `useDailyTasks(date)` — fetches from `daily_tasks` table where `date = date`
  - `initialData` from `getDailyTasks(date)` localStorage
- `useAddTask()` — mutation: insert into `daily_tasks`, invalidate
- `useToggleTask()` — mutation: update `completed`, invalidate
- `useDeleteTask()` — mutation: delete from `daily_tasks`, invalidate
- `useTaskStreak()` — derived: query last 365 days of tasks, compute streak

**Update consumers:**
- `src/pages/productivity/DailyTasks.tsx` — use hooks instead of `addTask()`, `toggleTask()`, `deleteTask()`
- `src/pages/Dashboard.tsx` — use `useDailyTasks()` for life score MITs

---

### Part 2: Productivity — Habits

**New hook: `src/hooks/useHabitsQuery.ts`**
- `useHabits()` — fetches from `habits` table
  - `initialData` from `getHabits()` localStorage
- `useHabitLog(days?)` — fetches from `habit_log` table, builds `{ [date]: string[] }` map
  - `initialData` from `getHabitLog()` localStorage
- `useAddHabit()` — mutation: insert into `habits`, invalidate
- `useDeleteHabit()` — mutation: delete from `habits` + related `habit_log`, invalidate
- `useToggleHabit()` — mutation: insert/delete `habit_log` row, invalidate
- `useHabitStreak(habitId)` — derived from habit log data
- `useHeatmapData(days)` — derived from habit log data

**Update consumers:**
- `src/pages/productivity/HabitStreaks.tsx`
- `src/pages/Dashboard.tsx` — habit count for life score

---

### Part 3: Productivity — Life Areas

**New hook: `src/hooks/useLifeAreasQuery.ts`**
- `useLifeAreaEntries()` — fetches from `life_area_scores` table, groups by date
  - `initialData` from `getLifeAreaEntries()` localStorage
- `useSaveLifeAreaEntry()` — mutation: upsert scores, invalidate

**Update consumers:**
- `src/pages/productivity/LifeAreas.tsx`

---

### Part 4: Quran Storage

**New hook: `src/hooks/useQuranStorageQuery.ts`**
- `useQuranDay(date)` — fetches from `quran_log` table
  - `initialData` from `getQuranDay(date)` localStorage
- `useLogQuranPages()` — mutation: upsert into `quran_log`, invalidate
- `useQuranStats()` — fetches all quran_log entries, computes totalPages, khatamCount, streak
  - `initialData` from localStorage

**Update consumers:**
- `src/pages/QuranTracker.tsx`
- `src/pages/Dashboard.tsx` — quran pages for life score

---

### Part 5: Cleanup

- Remove direct `syncXxx()` calls from storage files (no longer needed — mutations handle DB)
- Keep storage functions as `initialData` helpers only
- Update `PROGRESS.md` with migration status

---

### Technical Notes

**Tables already exist** (no migrations needed):
- `daily_tasks` — has user_id, date, text, completed, is_mit
- `habits` — has user_id, name, icon, color
- `habit_log` — has user_id, habit_id, date
- `life_area_scores` — has user_id, area, date, score
- `quran_log` — has user_id, date, pages_read, juz_number, surah_name, notes

**RLS policies already in place** for all tables.

**Files to create:**
- `src/hooks/useTasksQuery.ts`
- `src/hooks/useHabitsQuery.ts`
- `src/hooks/useLifeAreasQuery.ts`
- `src/hooks/useQuranStorageQuery.ts`

**Files to modify:**
- `src/pages/productivity/DailyTasks.tsx`
- `src/pages/productivity/HabitStreaks.tsx`
- `src/pages/productivity/LifeAreas.tsx`
- `src/pages/QuranTracker.tsx`
- `src/pages/Dashboard.tsx`
- `src/lib/productivity-storage.ts` (strip sync calls, keep as initialData helpers)
- `src/lib/quran-storage.ts` (strip sync calls, keep as initialData helpers)
- `PROGRESS.md`

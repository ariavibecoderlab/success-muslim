

## Fix All Bugs from Bug Sweep

After thorough investigation, several reported bugs are actually non-issues:
- **FIX 1 (forwardRef)**: No actual console errors found. `FamilyPrivacySettings` and `LogPastDataRow` are not receiving refs — they're rendered as children of `motion.div`, not passed via ref. **Skipping.**
- **FIX 2 (avatars bucket)**: Bucket already exists and is public. Upload already has error toast handling (line 78-81 of Settings.tsx). **Skipping.**
- **FIX 10 (unique constraint)**: Already has `family_privacy_settings_user_id_key` unique constraint. **Skipping.**
- **FIX 12 (BottomNav)**: All tab paths (`/dashboard`, `/iman`, `/health`, `/wealth`, `/productivity`, `/family`, `/settings`) are unique enough — no false matches possible. **Skipping.**
- **FIX 14 (Wealth AppHeader)**: All pillar pages (Iman, Health, Family, Wealth) consistently use `AppHeader title="..."`. **Skipping.**

### Actual fixes needed (9 bugs):

**FIX 3 — `handleClearCache` in Settings.tsx**
Replace `localStorage.clear()` with selective clearing of known app cache keys only. Preserve auth tokens (`sb-*`), onboarding flags, and IF timer state.

**FIX 4 — `weeklyScores` not reactive in Dashboard**
In `useDashboardData.ts`, `useMemo(() => getWeeklyScores(), [])` has empty deps. Add `lifeScore` as dependency so it recomputes when today's score changes.

**FIX 5 — `activeIF` not reactive in Dashboard**
Replace `const activeIF = getActiveIF()` with `useFastingStore()` in `useDashboardData.ts`. The store already tracks active fast state reactively.

**FIX 6 — Productivity hub page uses raw localStorage**
`Productivity.tsx` calls `getDailyTasks()`, `getHabits()`, `getHabitLog()` directly. Replace with React Query hooks (`useDailyTasks`, `useHabits`, `useHabitLog`) that already exist.

**FIX 7 — RamadhanQadaTrack localStorage only**
The `storage.ts` functions already call `syncRamadhanQada()` which syncs to the `qada_solat` table's `setup`/`progress` jsonb columns. However, `Deen.tsx` reads directly via `getRamadhanSetup()`. Create a `useRamadhanQada` React Query hook that fetches from DB with localStorage as `initialData`.

**FIX 8 — Fidyah localStorage only**
`saveFidyahEntry()` already calls `syncFidyahEntry()` to write to `fidyah_history` table. But `Fidyah.tsx` reads only from localStorage. Create a `useFidyahHistory` React Query hook that reads from DB.

**FIX 9 — IF Timer dual intervals**
Lines 124-128 run an interval when `active` is truthy. Lines 179-183 run another interval when `active && !scheduledStart` is false. When there's an active fast and no scheduled start, both intervals fire. Consolidate into a single interval that always ticks.

**FIX 11 — Deen.tsx direct localStorage reads**
Replace `getQadaSetup()`, `getRamadhanSetup()`, `getFidyahHistory()` calls in Deen.tsx with the React Query hooks created in FIX 7 and FIX 8, plus a `useQadaSolat` hook.

**FIX 13 — Hardcoded HSL colors**
Replace `hsl(142, 71%, 45%)` etc. in `HealthSteps.tsx` and `FastingTimerRing.tsx` with CSS variable references (`hsl(var(--primary))`, `hsl(var(--chart-1))`) that respect dark mode.

### Files to modify:
1. `src/pages/Settings.tsx` — selective cache clear (FIX 3)
2. `src/hooks/useDashboardData.ts` — reactive weeklyScores + activeIF (FIX 4, 5)
3. `src/pages/Productivity.tsx` — use React Query hooks (FIX 6)
4. `src/hooks/useQadaQuery.ts` — add `useRamadhanQada` hook (FIX 7)
5. `src/pages/RamadhanQadaTrack.tsx` — use new hook (FIX 7)
6. `src/hooks/useFidyahQuery.ts` — new file, `useFidyahHistory` hook (FIX 8)
7. `src/pages/Fidyah.tsx` — use new hook (FIX 8)
8. `src/pages/health/HealthIFTimer.tsx` — consolidate intervals (FIX 9)
9. `src/pages/Deen.tsx` — use React Query hooks (FIX 11)
10. `src/pages/health/HealthSteps.tsx` — CSS variable colors (FIX 13)
11. `src/components/health/FastingTimerRing.tsx` — CSS variable colors (FIX 13)
12. `PROGRESS.md` — update with fix results


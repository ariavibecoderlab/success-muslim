

## Phase 3: Migrate localStorage to React Query as Source of Truth

This is a large refactor touching ~25 consumer files across 6 storage modules. The approach creates one React Query hook file per module, then updates every consumer to use the hook instead of reading localStorage directly.

---

### Architecture

For each module, create a hook file in `src/hooks/` that:
- Uses `useQuery` to fetch data (DB if logged in, localStorage fallback)
- Uses `useMutation` for writes (write to DB + localStorage, then `invalidateQueries`)
- Provides `initialData` from localStorage for instant display
- Exposes the same data shape consumers already expect

The existing `pull*` functions in `db-sync.ts` already handle DB fetching. The existing storage functions handle localStorage. The hooks bridge them.

---

### New Hook Files (6 files)

**1. `src/hooks/useSalahQuery.ts`**
- `useSalahLog(date)` -- returns `{ data: DailySalahLog, isLoading }`
  - queryKey: `['salah', userId, date]`
  - queryFn: fetch from `salah_logs` table for that date
  - initialData: `getSalahLog(date)` from localStorage
- `useSalahMutation()` -- wraps `logSalah` + invalidates `['salah', userId, date]`
- `useTodaySalahCount()` -- derived from `useSalahLog(today)`

**2. `src/hooks/useDhikrQuery.ts`**
- `useDhikrDaily(date)` -- returns `{ data: DhikrDailyData, isLoading }`
  - queryKey: `['dhikr', userId, date]`
  - queryFn: fetch from `dhikr_sessions` table for that date
  - initialData: `getDailyDhikr(date)` from localStorage
- `useDhikrMutation()` -- wraps `saveDhikrCount` + invalidates
- `useDhikrStats()` -- streak and history (still localStorage-derived, less critical)

**3. `src/hooks/useSunnahQuery.ts`**
- `useSunnahLog(date)` -- returns `{ data: SunnahDayLog, isLoading }`
  - queryKey: `['sunnah', userId, date]`
  - queryFn: fetch from `sunnah_log` table
  - initialData: `getDayLog(date)` from localStorage
- `useSunnahToggle()` -- mutation that toggles + invalidates
- `useSunnahStats()` -- streak/week data

**4. `src/hooks/useHealthQuery.ts`**
- `useHydration(date)` -- queryKey: `['health-hydration', userId, date]`
- `useHydrationMutation()` -- add/remove cup + invalidate
- `useSleepLog()` -- queryKey: `['health-sleep', userId]`
- `useBMIData()` -- queryKey: `['health-bmi', userId]`
- `useFastingLog()` -- queryKey: `['health-fasting', userId]`
- `useWeightLog()` -- queryKey: `['health-weight', userId]`

**5. `src/hooks/useStepsQuery.ts`**
- `useStepsDay(date)` -- queryKey: `['steps', userId, date]`
- `useStepsMutation()` -- add/delete step log + invalidate
- `useStepsStats()` -- streak, history, all-time totals

**6. `src/hooks/useQadaQuery.ts`**
- `useQadaSolat()` -- queryKey: `['qada', userId]`
- `useQadaMutation()` -- log prayer + invalidate

---

### Consumer File Updates (~25 files)

Each consumer replaces direct localStorage calls with the new React Query hooks.

**Salah consumers (4 files):**
- `src/pages/deen/SalahLog.tsx` -- replace `getSalahLog()`/`logSalah()` with `useSalahLog()`/`useSalahMutation()`
- `src/components/widgets/NextPrayerWidget.tsx` -- replace `getTodaySalah()`/`logSalah()` with hooks
- `src/pages/Dashboard.tsx` -- replace `getTodaySalah()` with `useSalahLog(today)`
- `src/pages/Deen.tsx` -- replace `getTodaySalahCount()` with `useTodaySalahCount()`

**Dhikr consumers (3 files):**
- `src/pages/DhikrCounter.tsx` -- replace `getDailyDhikr()`/`saveDhikrCount()` with hooks
- `src/components/widgets/DhikrSelawatWidget.tsx` -- replace `getDailyDhikr()` with `useDhikrDaily()`
- `src/pages/Deen.tsx` -- replace `getDailyDhikr()` with hook

**Sunnah consumers (3 files):**
- `src/pages/SunnahTracker.tsx` -- replace `getDayLog()`/`toggleSunnahItem()` with hooks
- `src/components/widgets/SolatSunatWidget.tsx` -- replace `getDayLog()`/`getSunnahItems()` with hooks
- `src/pages/Deen.tsx` -- replace `getSunnahStreak()`/`getDayLog()` with hooks

**Health consumers (9 files):**
- `src/pages/Health.tsx` -- replace `getBMI()`/`getHydration()`/`getSleepLog()`/`addCup()` with hooks
- `src/pages/health/HealthHydration.tsx` -- replace `getHydration()`/`addCup()`/`removeCup()` with hooks
- `src/pages/health/HealthSleep.tsx` -- replace `getSleepLog()`/`addSleepEntry()` with hooks
- `src/pages/health/HealthFasting.tsx` -- replace `getFastingLog()`/`toggleFasting()` with hooks
- `src/pages/health/HealthBMI.tsx` -- replace `getBMI()`/`saveBMI()` with hooks
- `src/pages/health/HealthWeight.tsx` -- replace `getWeightLog()`/`addWeightEntry()` with hooks
- `src/pages/health/HealthIFTimer.tsx` -- replace `addCup()` call with hook
- `src/components/widgets/HydrationWidget.tsx` -- replace `getHydration()`/`addCup()` with hooks
- `src/components/widgets/SleepWidget.tsx` -- replace `getSleepLog()` with hook

**Steps consumers (3 files):**
- `src/pages/health/HealthSteps.tsx` -- replace all step functions with hooks
- `src/pages/Health.tsx` -- replace `getStepsToday()` with hook
- `src/components/widgets/StepsWidget.tsx` -- replace step functions with hooks

**Qada consumers (2 files):**
- `src/pages/QadaSolatTrack.tsx` -- replace `getQadaSetup()`/`getQadaProgress()` with hooks
- `src/pages/Deen.tsx` -- replace qada reads with hooks

---

### Implementation Order

1. Create all 6 hook files first (they're additive, no breaking changes)
2. Update salah consumers (4 files) -- most critical
3. Update dhikr consumers (3 files)
4. Update sunnah consumers (3 files)
5. Update health consumers (9 files) -- largest batch
6. Update steps consumers (3 files)
7. Update qada consumers (2 files)
8. Update PROGRESS.md

---

### Technical Details

**Hook pattern (example for salah):**
```typescript
export function useSalahLog(date: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['salah', user?.id, date],
    queryFn: async () => {
      if (!user) return getSalahLog(date);
      const { data } = await supabase.from('salah_logs')
        .select('*').eq('user_id', user.id).eq('date', date);
      if (!data?.length) return getSalahLog(date);
      // Transform DB rows to DailySalahLog shape
      return transformToSalahLog(date, data);
    },
    initialData: () => getSalahLog(date),
    staleTime: 60000,
    enabled: true,
  });
}

export function useSalahMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { prayer, status, date }) => {
      const result = logSalah(args.prayer, args.status, args.date);
      return result;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['salah', user?.id, vars.date] });
    },
  });
}
```

**What stays in localStorage files:** Pure utility functions (calculations, categories, types) remain. The read/write functions stay as localStorage-only helpers used by hooks' `initialData` and offline fallback.

---

### Files Changed Summary

```text
NEW FILES (6):
  src/hooks/useSalahQuery.ts
  src/hooks/useDhikrQuery.ts
  src/hooks/useSunnahQuery.ts
  src/hooks/useHealthQuery.ts
  src/hooks/useStepsQuery.ts
  src/hooks/useQadaQuery.ts

MODIFIED FILES (25):
  src/pages/deen/SalahLog.tsx
  src/components/widgets/NextPrayerWidget.tsx
  src/pages/Dashboard.tsx
  src/pages/Deen.tsx
  src/pages/DhikrCounter.tsx
  src/components/widgets/DhikrSelawatWidget.tsx
  src/pages/SunnahTracker.tsx
  src/components/widgets/SolatSunatWidget.tsx
  src/pages/Health.tsx
  src/pages/health/HealthHydration.tsx
  src/pages/health/HealthSleep.tsx
  src/pages/health/HealthFasting.tsx
  src/pages/health/HealthBMI.tsx
  src/pages/health/HealthWeight.tsx
  src/pages/health/HealthIFTimer.tsx
  src/components/widgets/HydrationWidget.tsx
  src/components/widgets/SleepWidget.tsx
  src/pages/health/HealthSteps.tsx
  src/components/widgets/StepsWidget.tsx
  src/pages/QadaSolatTrack.tsx
  src/pages/deen/DeenFasting.tsx
  src/components/widgets/IFFastingWidget.tsx
  src/components/widgets/RamadanFastingWidget.tsx
  src/components/widgets/TasksTodayWidget.tsx
  PROGRESS.md
```

### Risk Mitigation

- localStorage functions remain as fallback (not deleted)
- `initialData` ensures instant UI even before DB fetch
- Non-authenticated users still work via localStorage-only path in queryFn
- Each module is independent -- if one breaks, others still work




## Fix 4 Minor React Query Bypass Issues

### Issue 1 -- DhikrCounter.tsx reads localStorage directly

**Problem:** Lines 31-34, 54, 61, and 130 call `getDailyDhikr()` directly instead of using the `useDhikrDaily` hook data that's already available as `dailyData`.

**Fix in `src/pages/DhikrCounter.tsx`:**
- Line 31-34: Change initial `count` state to derive from `dailyData` via `useEffect` instead of `getDailyDhikr()`
- Line 54: In `handleDateChange`, remove `getDailyDhikr(key)` -- use an effect that watches `dailyData` changes
- Line 61: In `selectPreset`, same -- derive from `dailyData`
- Line 130: Replace `const daily = getDailyDhikr(dateKey)` with `const daily = dailyData`
- Line 314: Replace `daily.sessions` reference to use `dailyData.sessions`
- Remove `getDailyDhikr` from import (keep `saveDhikrCount` for the mutation's local write)

The pattern: use a `useEffect` that syncs the local `count` state whenever `dailyData` or `selectedPreset` changes:
```typescript
useEffect(() => {
  const session = dailyData.sessions.find(s => s.presetId === selectedPreset.id);
  setCount(session?.count || 0);
}, [dailyData, selectedPreset.id]);
```

This removes the 4 direct `getDailyDhikr()` calls and makes `dailyData` from React Query the single source.

---

### Issue 2 -- HealthHydration.tsx weekly chart bypasses React Query

**Problem:** Line 31 calls `getHydrationHistory(7)` directly for the bar chart. This data never refreshes after mutations.

**Fix:**
1. Add `useHydrationHistory(days)` hook to `src/hooks/useHealthQuery.ts`:
   - queryKey: `['health-hydration-history', userId, days]`
   - queryFn: For logged-in users, query last N days from `hydration_log` table ordered by date. For anon, fall back to `getHydrationHistory(days)`.
   - initialData: `getHydrationHistory(days)`
   - staleTime: 60000
   - Invalidated by `useHydrationMutation` (add to its `onSuccess`)

2. In `src/pages/health/HealthHydration.tsx`:
   - Replace `const history = getHydrationHistory(7)` with `const { data: history } = useHydrationHistory(7)`
   - Remove `getHydrationHistory` from imports

---

### Issue 3 -- SunnahTracker.tsx toggle missing invalidateQueries

**Problem:** `handleToggle` on line 61 calls `toggleSunnahItem()` directly instead of using the `useSunnahToggle` mutation hook. The comment on line 62 says "dayLog updates via React Query invalidation" but no invalidation actually happens.

**Fix in `src/pages/SunnahTracker.tsx`:**
- Import `useSunnahToggle` from hooks (it already exists and correctly invalidates)
- In `handleToggle`: call `sunnahToggle.mutate({ itemId, date: dateKey })` instead of `toggleSunnahItem(itemId, dateKey)` directly
- The existing `useSunnahToggle` hook already calls `invalidateQueries` on success
- Keep the celebration logic by reading the returned value from `toggleSunnahItem` inside the mutation's `onSuccess` or by using optimistic local state

Refined approach: Since the celebration check needs the immediate result, keep the direct `toggleSunnahItem()` call but add explicit `queryClient.invalidateQueries`:
```typescript
const queryClient = useQueryClient();
const { user } = useAuth();

const handleToggle = (itemId: string) => {
  const updated = toggleSunnahItem(itemId, dateKey);
  queryClient.invalidateQueries({ queryKey: ['sunnah', user?.id ?? 'anon', dateKey] });
  // celebration logic stays the same
};
```

---

### Issue 4 -- HealthIFTimer.tsx addCup() bypasses mutation

**Problem:** Line 283 calls `addCup()` directly from health-storage, bypassing `useHydrationMutation`. The hydration count won't sync to HydrationWidget or Health.tsx.

**Fix in `src/pages/health/HealthIFTimer.tsx`:**
- Import `useHydrationMutation` from `@/hooks/useHealthQuery`
- Initialize: `const { addCup: addCupMutation } = useHydrationMutation()`
- Replace line 283: `const handleQuickWater = () => { addCupMutation.mutate(); toast('Water logged!'); }`
- Remove `addCup` from the health-storage import on line 11

---

### Files Changed Summary

```text
MODIFIED:
  src/pages/DhikrCounter.tsx           -- Use dailyData from hook, remove getDailyDhikr calls
  src/hooks/useHealthQuery.ts          -- Add useHydrationHistory hook
  src/pages/health/HealthHydration.tsx  -- Use useHydrationHistory hook
  src/pages/SunnahTracker.tsx          -- Add queryClient.invalidateQueries after toggle
  src/pages/health/HealthIFTimer.tsx   -- Use useHydrationMutation for quick water
  PROGRESS.md                         -- Document fixes
```




## Fix Two Remaining State Management Issues

### Issue 1 -- Wire Up fastingStore (3 files)

The store exists with the right shape but has zero imports. Three components need changes:

**Writer: `src/pages/health/HealthIFTimer.tsx`**
- Import `useFastingStore`
- On mount: call `hydrate()` to sync store with localStorage
- In the existing `setInterval` (line 119-121): call `store.tick()` alongside `setNow()`
- In `handleStart`: call `store.startFast()` after `startIF()`
- In `handleSaveFast` / `handleConfirmDiscard` / `handleDeleteFast`: call `store.endFast()` after `stopIF()`/`deleteIF()`
- Keep existing local state (`active`, `now`) since HealthIFTimer needs them for its complex UI -- the store is for cross-component sync

**Reader: `src/components/widgets/IFFastingWidget.tsx`**
- Import `useFastingStore`
- Call `hydrate()` on mount to ensure store is current
- Read `isActiveFast`, `activeFast`, `elapsedSeconds` from store instead of local `useState(getActiveIF())`
- Remove local `now` state and `setInterval` -- the store's `elapsedSeconds` is the source of truth (ticked by HealthIFTimer or hydrated on mount)
- Add a local `useEffect` interval that calls `store.tick()` when active (so widget works standalone too)
- "End Fast" button calls `store.endFast(true)` instead of local `stopIF()`

**Reader: `src/pages/Health.tsx`**
- Import `useFastingStore`
- Call `hydrate()` on mount
- Read `isActiveFast`, `activeFast`, `elapsedSeconds` from store instead of `getActiveIF()` + local `now` interval
- Add a `useEffect` interval calling `store.tick()` when active
- Compute `ifElapsed` and `ifProgress` from `elapsedSeconds` and `activeFast`
- "End Fast" button calls `store.endFast(true)`

---

### Issue 2 -- Remove renderKey from 5 Files

Since these modules still use localStorage (Phase 3 was deferred), the fix is to hold data in state and update it directly after mutations, instead of using a renderKey counter to force re-reads.

**Pattern for each file:**
```
// BEFORE (hack)
const [renderKey, setRenderKey] = useState(0);
const data = readFromLocalStorage(); // re-read on every render
const handleUpdate = () => { writeToLocalStorage(); setRenderKey(k => k + 1); };

// AFTER (clean)
const [data, setData] = useState(() => readFromLocalStorage());
const handleUpdate = () => { writeToLocalStorage(); setData(readFromLocalStorage()); };
```

**File 1: `src/pages/health/HealthFasting.tsx`**
- Remove `renderKey` state
- Add `const [fastingLog, setFastingLog] = useState(() => getFastingLog())`
- `handleToggle`: after `toggleFasting(key)`, call `setFastingLog(getFastingLog())`
- Derive `totalFasted`, `recommendedHit` from the state variable

**File 2: `src/pages/deen/DeenFasting.tsx`**
- Same pattern: remove `renderKey`, hold `fastingLog` in state, update after toggle

**File 3: `src/pages/health/HealthSteps.tsx`**
- Remove `renderKey` and `refresh` callback
- Hold steps data in state, update after logging steps

**File 4: `src/pages/health/HealthHydration.tsx`**
- Remove `renderKey` and `refresh`
- Hold hydration data in state, update after add/reset

**File 5: `src/pages/QuranTracker.tsx`**
- Remove `renderKey` and `refresh`
- Hold quran day data in state
- Update state after `addQuranPages`, `logQuranPages`, date change

---

### Files Changed Summary

```text
MODIFIED:
  src/pages/health/HealthIFTimer.tsx     -- Write to fastingStore on start/end/tick
  src/components/widgets/IFFastingWidget.tsx -- Read from fastingStore
  src/pages/Health.tsx                   -- Read from fastingStore
  src/pages/health/HealthFasting.tsx     -- Remove renderKey
  src/pages/deen/DeenFasting.tsx         -- Remove renderKey
  src/pages/health/HealthSteps.tsx       -- Remove renderKey
  src/pages/health/HealthHydration.tsx   -- Remove renderKey
  src/pages/QuranTracker.tsx             -- Remove renderKey
  PROGRESS.md                           -- Document completion
```

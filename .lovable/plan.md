

## Major State Management Refactor

A 5-phase refactor to fix auth duplication, add React Query caching, modernize localStorage usage, add Zustand for client state, and remove forceUpdate hacks.

---

### Phase 1 -- Wrap useAuth in a Single Context Provider

**Problem:** `useAuth()` is called independently in 35+ files, each creating its own `onAuthStateChange` listener.

**Changes:**

1. **Create `src/contexts/AuthContext.tsx`** -- new file
   - Single `AuthProvider` component with one `onAuthStateChange` listener
   - `useAuthContext()` hook that reads from context
   - Provides `{ user, session, loading, signOut }`

2. **Update `src/App.tsx`**
   - Wrap app in `<AuthProvider>` inside `<QueryClientProvider>`

3. **Update `src/hooks/useAuth.ts`**
   - Re-export `useAuthContext` as `useAuth` for backward compatibility
   - All 35 files that import `useAuth` continue working with zero changes

**Result:** One subscription, all consumers share the same context value.

---

### Phase 2 -- Migrate DB Fetching to React Query

**Problem:** All hooks use raw `useEffect` + `supabase.from()`. No caching, no deduplication.

**Global config change in `src/App.tsx`:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});
```

**Hooks to migrate (in priority order):**

| Hook | Query Keys | Notes |
|------|-----------|-------|
| `useFamily` | `['families', userId]` | Most complex, 3 queries |
| `usePrayerSettings` | `['prayer-settings', userId]` | Read + upsert mutation |
| `useQuranReadingLog` | `['quran-log', userId]` | Already well-structured, wrap in useQuery |
| `useQuranData` (4 hooks) | `['quran-prefs', userId]`, etc. | Prefs, daily target, bookmarks, memorization |
| `useHealthProfile` | `['health-profile', userId]` | Read + upsert mutation |
| `useWidgetPreferences` | `['widget-prefs', userId]` | Read + upsert mutation |
| `useAdmin` | `['admin-role', userId]` | Simple RPC call |
| `useFamilyDashboard` | `['family-dashboard', familyId]` | Leaderboard, staleTime: 30s |
| `useAdminAudit` | `['admin-audit']` | Admin-only |

**Pattern for each hook:**
```typescript
// Before
const [data, setData] = useState(null);
useEffect(() => { supabase.from('x').select().then(setData); }, [user]);

// After
const { data, isLoading } = useQuery({
  queryKey: ['x', user?.id],
  queryFn: () => supabase.from('x').select()...,
  enabled: !!user,
});
```

**Mutations use `useMutation` + `invalidateQueries`** so UI auto-updates.

---

### Phase 3 -- Replace localStorage Reads with React Query

**Problem:** Health, Salah, Steps, etc. read localStorage directly. Update in one component doesn't reflect in another.

**New pattern:** React Query is source of truth, localStorage provides `initialData` for instant display, DB is persisted via mutations.

**Modules to migrate:**

| Storage File | Query Key | Current Pattern |
|-------------|-----------|----------------|
| `health-storage.ts` | `['health-bmi']`, `['health-hydration', date]`, etc. | Direct localStorage reads |
| `salah-storage.ts` | `['salah', date]` | Direct localStorage reads |
| `sunnah-storage.ts` | `['sunnah', date]` | Direct localStorage reads |
| `dhikr-storage.ts` | `['dhikr', date]` | Direct localStorage reads |
| `steps-storage.ts` | `['steps', date]` | Direct localStorage reads |

**For each module, create a React Query hook:**
```typescript
export function useHydration(dateKey?: string) {
  const key = dateKey || todayKey();
  return useQuery({
    queryKey: ['health-hydration', key],
    queryFn: async () => {
      // fetch from DB if user logged in, else localStorage
    },
    initialData: () => getHydration(key), // instant from localStorage
  });
}
```

**Mutations write to DB first, then invalidate query, localStorage updates as side effect.**

Note: The raw storage functions remain for offline fallback. The hooks just wrap them in React Query for reactivity.

---

### Phase 4 -- Add Zustand for Global Client State

**Install:** `zustand` package

**Store 1: `src/stores/fastingStore.ts`**
```typescript
interface FastingStore {
  isActiveFast: boolean;
  activeFast: IFActive | null;
  elapsedSeconds: number;
  startFast: (details: IFActive) => void;
  endFast: () => void;
  tick: () => void;
}
```
Why: IF Timer widget on /dashboard, active banner on /health, and /health/if-timer all need same fasting state. Currently they fetch independently.

**Store 2: `src/stores/uiStore.ts`**
```typescript
interface UIStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
```
Why: Simple UI state shared across navigation.

Note: Notification store is NOT needed -- `sonner` toast already provides a global API via `toast()`. No point duplicating it.

---

### Phase 5 -- Kill All forceUpdate Hacks

After phases 1-4, search and remove:

| File | Pattern | Replacement |
|------|---------|-------------|
| `Dashboard.tsx` | `useState(0)` + `window.focus` listener | React Query `refetchOnWindowFocus` handles this |
| `Deen.tsx` | `useState(0)` + `window.focus` listener | Same |
| `HealthFasting.tsx` | `useState(0)` rerender | React Query cache invalidation |
| `HealthSteps.tsx` | `useState(0)` rerender | React Query cache invalidation |
| `DeenFasting.tsx` | `useState(0)` rerender | React Query cache invalidation |
| `HealthHydration.tsx` | `useState(0)` rerender | React Query cache invalidation |
| `QuranTracker.tsx` | `useState(0)` rerender | React Query cache invalidation |

Total: 7 files with forceUpdate hacks to remove.

---

### Files Changed Summary

```text
NEW FILES:
  src/contexts/AuthContext.tsx          -- Auth context provider
  src/stores/fastingStore.ts            -- Zustand fasting store
  src/stores/uiStore.ts                 -- Zustand UI store

MODIFIED FILES (Phase 1):
  src/hooks/useAuth.ts                  -- Re-export from context
  src/App.tsx                           -- Add AuthProvider + QueryClient config

MODIFIED FILES (Phase 2 - hooks):
  src/hooks/useFamily.ts
  src/hooks/usePrayerSettings.ts
  src/hooks/useQuranReadingLog.ts
  src/hooks/useQuranData.ts
  src/hooks/useHealthProfile.ts
  src/hooks/useWidgetPreferences.ts
  src/hooks/useAdmin.ts
  src/hooks/useFamilyDashboard.ts
  src/hooks/useAdminAudit.ts

MODIFIED FILES (Phase 3 - storage hooks):
  src/lib/health-storage.ts             -- Keep functions, add query hooks
  src/lib/salah-storage.ts
  src/lib/sunnah-storage.ts
  src/lib/dhikr-storage.ts
  src/lib/steps-storage.ts

MODIFIED FILES (Phase 5 - remove hacks):
  src/pages/Dashboard.tsx
  src/pages/Deen.tsx
  src/pages/health/HealthFasting.tsx
  src/pages/health/HealthSteps.tsx
  src/pages/health/HealthHydration.tsx
  src/pages/deen/DeenFasting.tsx
  src/pages/QuranTracker.tsx

UPDATED:
  PROGRESS.md
  package.json                          -- Add zustand
```

### Execution Order

Phase 1 first (auth context), then Phase 2 (React Query hooks), then Phase 3 (localStorage migration), then Phase 4 (Zustand), then Phase 5 (cleanup). Each phase builds on the previous.

### Risk Mitigation

- Phase 1 uses re-export so all 35 import sites need zero changes
- Phase 2 preserves hook return signatures so consumers don't break
- Phase 3 keeps raw storage functions as fallback
- Zustand stores are additive, not replacing existing code initially


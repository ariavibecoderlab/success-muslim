# 10 · State & Data Flow

## 10.1 State containers

| Container | Lives in | Scope |
|-----------|----------|-------|
| `AuthContext` | `src/contexts/AuthContext.tsx` | Process-wide session + user. |
| `EditModeContext` | `src/contexts/EditModeContext.tsx` | CMS overlay toggle (admin). |
| React Query | `src/main.tsx` (`QueryClientProvider`) | All server cache; per-domain query keys. |
| Zustand `fastingStore` | `src/stores/fastingStore.ts` | Active IF session (survives reload). |
| Zustand `uiStore` | `src/stores/uiStore.ts` | Ephemeral UI flags (sheets, drawers). |
| localStorage | browser | Read-through cache, pending queues, prefs. |

## 10.2 React Query keys

Convention: `[domain, scope, ...args]`.

```text
['salah', 'today']
['salah', 'range', from, to]
['quran', 'log', from, to]
['health', 'weight', from, to]
['family', 'leaderboard', familyId]
['admin', 'overview']
```

Default `staleTime`: 60 s for dashboards, 5 min for static-ish lookups
(prayer methods, mappings). `gcTime` matches `staleTime * 3`.

## 10.3 Read-through pattern (canonical hook)

```ts
export function useSalahQuery(range) {
  const initial = useMemo(() => readSalahFromLocal(range), [range]);
  return useQuery({
    queryKey: ['salah', range],
    queryFn: () => fetchSalah(range),
    initialData: initial,            // zero-flash render
    staleTime: 60_000,
    onSuccess: (rows) => writeSalahToLocal(range, rows),
  });
}
```

## 10.4 Sequence diagrams

### 10.4.1 Login (Google)

```text
 User       Auth.tsx        Supabase Auth     Google
  │ click "Continue with Google"
  │──────────►│
  │           │ signInWithOAuth({provider:'google'})
  │           │──────────────────►│
  │           │                   │ redirect ▶ Google consent
  │           │                   │◀────────── code
  │           │◀──────────────────│ session
  │ AuthCallback.tsx
  │           │ store session, read post_auth_redirect
  │           │ navigate(intendedPath ?? '/dashboard')
```

### 10.4.2 Log salah (offline)

```text
 User    SalahQuickLogSheet   useSalahQuery   db-sync   Edge fn
  │ tap "Subuh: on time"
  │────────►│
  │         │ optimistic upsert ▶ localStorage
  │         │ api-client.post('api-salah')
  │         │     └── ApiOfflineError
  │         │ enqueue → sm:salah:pending
  │ toast "Saved · syncs when online"
  │ ...
  │ network 'online' fires
  │                                            db-sync.flush()
  │                                            ────────►│
  │                                            ◀──────── 200 ok
  │         │◀ react-query invalidate
  │ UI reconciles
```

### 10.4.3 Start IF session

```text
 User   StartFastingSheet   fastingStore   Edge fn
  │ pick protocol + start
  │──────►│
  │       │ setActive({startedAt, plan})
  │       │ persist sm:fasting:active
  │       │ api-health 'if-start'
  │       │ ──────────────────────►│
  │       │ ◀────── ok (id)        │
  │ HealthIFTimer mounts, derives elapsed from startedAt every second
```

### 10.4.4 Quran session persistence

```text
 Reader scroll → Intersection Observer fires for ayah n
   │ debounce 5 s
   │ write sm:quran:session = { surah, ayah, page, pace }
   │
 App backgrounded / focus lost
   │ on next visibilitychange (visible):
   │   flush sm:quran:session via api-quran/session
   │   clear cache key on success
```

## 10.5 Auth-guarded data fetching

Hooks must not fire while `AuthContext.loading` is true. Pattern:

```ts
const { user, loading: authLoading } = useAuth();
const enabled = !authLoading && !!user;
useQuery({ queryKey: [...], queryFn, enabled });
```

This avoids 401 storms on cold start (`mem://tech/auth-guarded-data-fetching`).

## 10.6 Cache invalidation

| Trigger | Action |
|---------|--------|
| Successful mutation | Invalidate `[domain]` root key. |
| Cross-domain effect (e.g., salah → life score) | Invalidate `['dashboard']` too. |
| Sign out | `queryClient.clear()` and selective localStorage wipe. |
| Selective cache clear (Settings) | Preserves `sm:auth:*` and `sm:fasting:active`. |

## 10.7 Post-auth redirect

`AuthGuard` writes `localStorage['sm:post_auth_redirect'] = location.pathname`
before redirecting to `/auth`. `AuthCallback` reads and clears it.
Capacitor deep links go through the same path.
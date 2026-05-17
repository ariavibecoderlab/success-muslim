# 03 · System Architecture

## 3.1 Logical view

```text
┌──────────────────────────── Presentation ────────────────────────────┐
│ pages/*  (route components, one per screen)                          │
│ components/* (shared UI: AppHeader, BottomNav, SubPageLayout, ...)   │
│ components/ui/* (shadcn primitives)                                  │
│ components/widgets/* (dashboard widgets)                             │
│ components/cms/* (visual editor: EditableText/Image/Icon/Box)        │
└────────────────────────┬─────────────────────────────────────────────┘
                         │ React hooks (use*)
┌────────────────────────┴─────────────────────────────────────────────┐
│                          Application logic                            │
│ hooks/use*Query.ts  — React Query reads/writes                       │
│ hooks/useAuth.ts, useAdmin.ts  — auth/role gates                     │
│ contexts/AuthContext, EditModeContext  — global app state            │
│ stores/*  — Zustand stores (fastingStore, uiStore)                    │
│ lib/*-storage.ts  — localStorage adapters (offline cache)             │
│ lib/api-client.ts  — typed wrapper over supabase.functions.invoke()  │
│ lib/db-sync.ts     — reconciliation between localStorage and Supabase│
│ lib/calculations.ts, life-score.ts, zakat.ts, hijri.ts, prayer-times │
└────────────────────────┬─────────────────────────────────────────────┘
                         │ Supabase JS SDK / fetch
┌────────────────────────┴─────────────────────────────────────────────┐
│                       Lovable Cloud (Supabase)                        │
│ Postgres (56+ tables, RLS on every user-owned table)                 │
│ Auth (email/password + Google OAuth, HIBP)                           │
│ Storage buckets (dakwah posters, blog images, CMS assets)            │
│ Edge Functions (api-admin, api-checkin, api-dhikr, api-family,        │
│   api-health, api-misc, api-productivity, api-profile, api-quran,     │
│   api-salah, api-sunnah, api-wealth, jakim-proxy)                     │
└──────────────────────────────────────────────────────────────────────┘
```

## 3.2 Deployment view

```text
                  ┌──────────────────────────┐
                  │ Lovable Build & CDN      │
                  │ www.successmuslim.app    │
                  │ successmuslim.app        │
                  │ success-muslim.lovable.app│
                  └──────────────┬───────────┘
                                 │ HTTPS
      ┌──────────────┬───────────┴───────────┬──────────────┐
      ▼              ▼                       ▼              ▼
 ┌────────┐    ┌──────────┐           ┌──────────┐   ┌──────────┐
 │ Mobile │    │ Desktop  │           │ Android  │   │   iOS    │
 │ web    │    │  web     │           │ Capacitor│   │ Capacitor│
 │ (PWA)  │    │  (PWA)   │           │  shell   │   │   shell  │
 └────────┘    └──────────┘           └────┬─────┘   └────┬─────┘
                                           │              │
                                           ▼              ▼
                                  Local notifications, Status bar,
                                  Splash, Haptics, Share, Clipboard,
                                  Preferences, Network, Browser, Device
```

All clients talk to the **same** Lovable Cloud project (single project for MVP).
Staging/preview uses Lovable's preview URL; production publishes to the custom
domain.

## 3.3 Process view — sign-in to first paint

```text
 User → /auth → submit credentials
                │
                ▼
         supabase.auth.signIn (email | Google OAuth via Web client)
                │ session cookie / token in localStorage
                ▼
         AuthContext sets user + emits ready
                │
                ▼
         AuthGuard unlocks AppLayout
                │
                ▼
         /  → Dashboard.tsx
              ├─ useDashboardData()  (parallel React Query fetches)
              ├─ usePrayerSettings → useNativePrayerNotifications (schedules adhan)
              ├─ useHijriDate, useContextualGreeting
              └─ widget grid hydrates from widget_preferences
                │
                ▼
         localStorage cache renders instantly while Supabase reconciles
```

## 3.4 Process view — offline-first write

```text
 User taps "+1 page" (Quran)
   │
   ▼
 useQuranReadingLog.mutate() optimistically updates local cache
   │
   ├─ quran-storage.ts writes to localStorage immediately
   │   (zero-latency UI; survives reload and offline)
   │
   ▼
 api-client → supabase.functions.invoke('api-quran', { action: 'logReading' })
   │
   ├─ Online: edge function writes to quran_reading_log and quran_daily_log
   │          React Query invalidates → UI re-reads canonical state
   │
   └─ Offline / failed: write is queued in localStorage "pending" bucket
                       db-sync.ts flushes on next online tick / page focus
```

## 3.5 Module map (code → responsibility)

| Path | Responsibility |
|------|----------------|
| `src/App.tsx` | Single source of all routes (web + native). |
| `src/main.tsx` | React root, error boundary mount. |
| `src/components/AppLayout.tsx` | Authenticated chrome (header + bottom nav + outlet) inside `max-w-md`. |
| `src/components/SubPageLayout.tsx` | Subpage chrome (back button, title, optional header right action). |
| `src/components/AuthGuard.tsx` | Redirects to `/auth` if no session; preserves `post_auth_redirect`. |
| `src/components/AdminGuard.tsx` | Server-checked admin gate via `has_role()`. |
| `src/components/MobileAdminBlock.tsx` | Hides `/admin/*` inside Capacitor WebView. |
| `src/components/NativeBridge.tsx` | Wires deep links, back-button, app-state into the router. |
| `src/contexts/AuthContext.tsx` | Holds the Supabase session and exposes `user`, `loading`. |
| `src/contexts/EditModeContext.tsx` | Toggles the admin-only visual CMS editor. |
| `src/hooks/useDashboardData.ts` | Orchestrates dashboard reads. |
| `src/lib/db-sync.ts` | Reconciles localStorage queues with Supabase. |
| `src/lib/api-client.ts` | Typed `supabase.functions.invoke` wrapper. |
| `supabase/functions/api-*` | Server logic per domain. |
| `supabase/functions/jakim-proxy/index.ts` | Server-side proxy to JAKIM e-Solat. |

## 3.6 Technology choices and why

| Concern | Choice | Reason |
|---------|--------|--------|
| UI framework | React 18 + Vite | Stack required by Lovable; instant HMR. |
| Styling | Tailwind v3 + shadcn/ui + design tokens in `index.css` | Token-driven theming; no raw colors in components. |
| Icons | Hugeicons | Project standard (Memory: Visual Identity). |
| State (server) | TanStack React Query | Caching, retries, and invalidation. |
| State (UI/transient) | Zustand | Tiny, fits IF timer and UI store. |
| Persistence | localStorage + Supabase | Offline-first + single source of truth. |
| Backend | Lovable Cloud (Supabase) | Managed Postgres + Auth + Edge Functions. |
| Native | Capacitor 8 | Single codebase to Android + iOS. |
| Editor | Tiptap | Block editor for Blog CMS. |
| Charts | Recharts | Used by stats pages (Quran, Deen Journey, Admin). |

## 3.7 Error handling and resilience

- **Top-level `ErrorBoundary`** wraps the router; renders a friendly fallback.
- **React Query** is configured with `retry: 2`, `staleTime: 5 minutes`, and
  `refetchOnWindowFocus: true` (see `src/App.tsx`).
- **Edge functions** return structured `{ error }` payloads on 4xx/5xx.
- **Offline banner** (`OfflineBanner.tsx`) appears when `@capacitor/network`
  reports disconnection (web fallback: `navigator.onLine`).
- **Pending queue flush** is idempotent — every queued operation carries a
  client-generated UUID and `updated_at`, and the server upserts.
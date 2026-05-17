# 14 · Performance Design

## 14.1 Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint (mid-tier Android, 4G) | < 2.0 s |
| Time to Interactive (cold) | < 3.5 s |
| Route transition (warm) | < 200 ms |
| Dashboard hydration (cached) | < 100 ms (read-through cache) |
| Initial JS (gzipped) | ≤ ~2 MB |
| Quran reader scroll | 60 fps on mid-tier Android |

## 14.2 Bundle strategy

- **Code splitting per route.** `src/App.tsx` lazy-loads every page via
  `React.lazy()` so cold start ships only auth, dashboard, and shared UI.
- **Vendor chunking.** Vite splits `react`, `react-dom`, `@supabase/*`,
  `@tanstack/react-query`, and `framer-motion` into long-cached vendor
  chunks.
- **Tree-shakeable imports.** Always import Hugeicons by name, never the
  whole pack. Same for shadcn primitives.
- **No moment.js.** Date math via `date-fns`/native `Intl`.

## 14.3 Cache layers

| Layer | TTL | Purpose |
|-------|-----|---------|
| localStorage cache | indefinite (per domain) | Zero-flash render. |
| React Query | 60 s default | Dedupe + background refetch. |
| Edge function response | request-scoped | No CDN cache (user-scoped). |
| Prayer times | per (date, zone) | One fetch per day. |
| Quran mappings | bundle constant | Compiled in. |
| Static assets | CDN long cache | Vite content hashes. |

## 14.4 Quran reader performance

- Pagination: render a window of pages around the visible page; mount
  the next/previous on Intersection Observer entry.
- Reading progress: IO callback debounced 5 s before persisting to
  `sm:quran:session`.
- Mushaf images (if used): lazy `<img loading="lazy">` with explicit
  width/height to avoid CLS.

## 14.5 List virtualization

Long admin tables and family feeds use windowed rendering (only the
visible slice + small overscan) to keep main-thread work bounded.

## 14.6 Image policy

- Use WebP for hero/marketing assets; PNG for icons that need
  transparency.
- Explicit `width`/`height` on every `<img>`.
- Avatars served via Supabase Storage CDN; size negotiated server-side
  where possible.
- Dakwah posters compressed before upload (admin tooling).

## 14.7 Memoization rules

- `useMemo` for derived data that involves > O(n log n) work or feeds
  child memoized components.
- `React.memo` for list row components only when prop equality is
  reliable (stable callbacks via `useCallback`).
- Avoid premature memoization on trivial views — it costs more than it
  saves.

## 14.8 Network discipline

- Single combined `useDashboardData` hook coalesces dashboard reads
  into a small fan-out instead of one query per widget.
- React Query `staleTime` set so navigating Dashboard → Today → Dashboard
  does not re-fetch within a minute.
- Mutations invalidate only the narrowest key path that the UI shows.

## 14.9 Native-specific

- Splash hidden manually only after the first authenticated paint to
  avoid white flash.
- Notification scheduling batched once per day instead of per-prayer to
  reduce native bridge churn.
- `@capacitor/network` listener replaces polling.

## 14.10 Anti-patterns to avoid

- Re-querying inside a render tree.
- `useState` for derived values that should be `useMemo`.
- Importing whole icon packs.
- Blocking the main thread on Quran mapping lookups (use the static
  tables, not a runtime computation).
- Re-creating Supabase client per call (always import the singleton from
  `src/integrations/supabase/client.ts`).
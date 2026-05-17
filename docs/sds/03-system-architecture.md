# 03 · System Architecture

## 3.1 Context view (C4 level 1)

```text
                      ┌──────────────────────────┐
                      │  Muslim end-user (mobile │
                      │   web / Android / iOS)   │
                      └────────────┬─────────────┘
                                   │ HTTPS / native bridge
                                   ▼
        ┌──────────────────────────────────────────────────┐
        │            Success Muslim SPA (React)            │
        │  Web host  ◀──▶  Capacitor WebView (Android/iOS) │
        └───────┬──────────────┬──────────────┬────────────┘
                │              │              │
                │ Supabase     │ JAKIM        │ Aladhan
                │ (DB, auth,   │ e-Solat      │ timings API
                │  storage,    │ via proxy    │
                │  edge fns)   │              │
                ▼              ▼              ▼
        ┌────────────┐  ┌────────────┐  ┌────────────┐
        │ Lovable    │  │ JAKIM open │  │ Aladhan    │
        │ Cloud      │  │ API        │  │ API        │
        └────────────┘  └────────────┘  └────────────┘
                ▲
                │ Google OAuth (Web app client)
                └── Google Identity
```

Optional secondary integration: **Lovable AI Gateway** (no API key, server-side
key managed) for any AI-assisted feature.

## 3.2 Container view (C4 level 2)

```text
┌──────────────────────────── Browser / WebView ────────────────────────────┐
│                                                                            │
│  React SPA (Vite bundle)                                                   │
│  ├─ Routing            react-router-dom v6, lazy routes per pillar         │
│  ├─ State              AuthContext · React Query · Zustand · localStorage  │
│  ├─ UI shells          AppLayout · SubPageLayout · MarketingLayout         │
│  ├─ Domain hooks       use*Query (Quran, Salah, Health, Wealth, ...)      │
│  ├─ API client         src/lib/api-client.ts → fetch edge functions        │
│  ├─ Sync engine        src/lib/db-sync.ts → flush queues on focus/online   │
│  ├─ Storage adapters   src/lib/*-storage.ts (per domain)                   │
│  └─ Native bridge      src/utils/native/* (Capacitor plugin wrappers)      │
│                                                                            │
└──────────────────────────────────┬─────────────────────────────────────────┘
                                   │ HTTPS / JWT
                                   ▼
┌──────────────────────────── Lovable Cloud (Supabase) ──────────────────────┐
│                                                                            │
│  Auth (GoTrue)        Postgres (public schema, 56 tables, RLS everywhere)  │
│  Storage (4 buckets)  Edge runtime (Deno) — api-* + jakim-proxy            │
│  Realtime             (not used in MVP)                                    │
│                                                                            │
└──────────────────────────────────┬─────────────────────────────────────────┘
                                   │ outbound HTTPS
                                   ▼
                  JAKIM e-Solat · Aladhan · Google Identity · Lovable AI
```

## 3.3 Runtime topology

| Tier | Runtime | Where |
|------|---------|-------|
| Client (web) | Browser, ES2020 | Any modern desktop/mobile browser |
| Client (native) | Capacitor 6 WebView | Android (`com.brainybunch.successmuslim`), iOS |
| Edge functions | Deno isolates | Supabase regional |
| Database | Postgres 15 | Supabase region (single primary) |
| Storage | Supabase Storage (S3-compatible) | Same region |
| Static hosting (web) | Lovable hosting / CDN | Edge POPs |

## 3.4 Request paths

### 3.4.1 Authenticated read

```text
component → use*Query hook
         → 1) read localStorage (sync)        → render immediately
         → 2) supabase.from(...).select()     → reconcile cache
         → 3) update localStorage + RQ cache
```

### 3.4.2 Authenticated write (online)

```text
component → mutation
         → localStorage upsert (optimistic)
         → api-client.post('/api-<domain>', payload)
         → edge fn validates JWT + payload
         → upsert into Postgres (RLS enforces user_id)
         → returns server row
         → hook reconciles + invalidates queries
```

### 3.4.3 Authenticated write (offline)

```text
component → mutation
         → localStorage upsert
         → api-client throws (offline) → enqueue in pending-<domain>
         → UI shows "Saved · will sync" badge
         → on online/focus: db-sync flushes queue serially (idempotent upserts)
```

### 3.4.4 Public read (no auth)

```text
landing page → jakim-proxy (verify_jwt=false) → JAKIM e-Solat
            → or aladhan client-side fetch
            → cached in localStorage per (date, zone)
```

## 3.5 Deployment artifacts

| Artifact | Source | Target |
|----------|--------|--------|
| Web bundle | `vite build` | Lovable host + `successmuslim.app` |
| PWA manifest + SW | `vite build` + `public/manifest.json` | `/install` |
| Android AAB | `android/` Gradle build | Google Play |
| iOS IPA | `ios/App/*.xcodeproj` | App Store Connect |
| Edge functions | `supabase/functions/*` (auto-deployed) | Supabase |
| Deep-link manifests | `public/.well-known/assetlinks.json`, `apple-app-site-association` | Web host |

## 3.6 Cross-cutting concerns

- **Configuration** lives in `.env` (auto-managed), `capacitor.config.ts`,
  `supabase/config.toml`, `tailwind.config.ts`, `vite.config.ts`.
- **Logging:** browser console + admin live activity feed
  (`admin_live_feed` RPC).
- **Time:** all timestamps stored in UTC; rendering uses device locale
  and an Asia/Kuala_Lumpur Hijri helper (`src/lib/hijri.ts`).
- **i18n:** strings inline (English + Malay phrasing where natural);
  formal i18n deferred post-MVP.
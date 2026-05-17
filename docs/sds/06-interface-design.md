# 06 · Interface Design

## 6.1 Edge function envelope

All `api-*` and `jakim-proxy` functions speak a single JSON envelope:

```json
// success
{ "ok": true, "data": { ... } }

// failure
{ "ok": false, "error": { "code": "STRING_ENUM", "message": "human" } }
```

HTTP status follows the envelope: 2xx for success, 4xx for client errors,
5xx for server faults. `code` is one of:

| Code | Meaning |
|------|---------|
| `UNAUTHORIZED` | Missing or invalid JWT (also 401). |
| `FORBIDDEN` | RLS or role check failed (403). |
| `VALIDATION` | Payload failed zod schema (400). |
| `BACKDATE_OUT_OF_RANGE` | `logged_for` outside 90-day window (400). |
| `NOT_FOUND` | Targeted row missing or not owned (404). |
| `CONFLICT` | Idempotency replay with divergent payload (409). |
| `UPSTREAM` | JAKIM/Aladhan/Google failure (502). |
| `INTERNAL` | Unhandled error (500). |

## 6.2 API client

`src/lib/api-client.ts` exposes:

```ts
post<T>(fn: 'api-quran' | 'api-salah' | ..., body: unknown): Promise<T>
```

- Attaches the active Supabase JWT.
- Times out at ~15 s (mobile-friendly).
- Throws a typed `ApiError(code, message, status)` on `ok=false`.
- Network failure → throws `ApiOfflineError` so hooks can enqueue.

## 6.3 Edge function surface

| Function | Verbs | Owns | Notes |
|----------|-------|------|-------|
| `api-profile` | `update`, `delete`, `export` | profiles, settings, account deletion | `verify_jwt=true`. |
| `api-checkin` | `submit` | `daily_checkins` | Awards streak. |
| `api-dhikr` | `log` | `dhikr_sessions` | |
| `api-quran` | `log`, `session`, `bookmark`, `memorize`, `preferences` | Quran tables | Idempotent upserts. |
| `api-salah` | `log` | `salah_logs` | Status: `on_time`/`late`/`missed`. |
| `api-sunnah` | `log` | `sunnah_log` | |
| `api-health` | `bmi`, `weight`, `hydration`, `sleep`, `if-start`, `if-end`, `steps`, `profile` | Health tables | |
| `api-wealth` | `tx`, `budget`, `goal`, `contribution` | Wealth tables | |
| `api-productivity` | `task`, `habit`, `habit-log`, `life-area` | Productivity tables | |
| `api-family` | `create`, `join`, `leave`, `member`, `feed`, `react`, `announce`, `privacy` | Family tables | Uses `is_family_member()`. |
| `api-admin` | `users`, `audit`, `posters`, `blog`, `pages`, `announce`, `delete-user`, `dawah` | Admin RPCs + content | `has_role('admin')` gate. |
| `api-misc` | catch-all | `sadaqah_*`, `zakat_history`, `fidyah_history`, `qada_*`, `ramadhan_qada`, `qiyam_*`, `hajj_umrah_progress` | Small CRUD endpoints. |
| `jakim-proxy` | `times` | — | **Public** (`verify_jwt=false`). |

## 6.4 Direct Supabase usage

Reads that benefit from RLS use the Supabase JS client directly (dashboard
rollups, list pages). Direct **writes** are reserved for tiny idempotent
upserts (`widget_preferences`, `quick_log_preferences`); everything else
goes through edge functions.

## 6.5 External APIs

### 6.5.1 JAKIM e-Solat (via proxy)

- Endpoint: configured in `jakim-proxy/index.ts`; queried per zone code.
- Cached client-side in `localStorage` per `(date, zone)`.
- Proxy required because (a) JAKIM CORS is restrictive and (b) the public
  landing page calls before auth.

### 6.5.2 Aladhan

- `GET https://api.aladhan.com/v1/timings/{DD-MM-YYYY}?latitude=...&longitude=...&method=...`
- Method selection from `prayer_settings.calc_method`.
- Used for any non-Malaysian zone or user override.
- Same per-day cache strategy.

### 6.5.3 Google Identity

- OAuth 2.0 client type: **Web application** (required for Capacitor WebView).
- Redirect URIs: `https://successmuslim.app/auth/callback`,
  Lovable preview URL, Supabase callback.
- Token exchange handled by Supabase Auth; client receives session via
  `AuthCallback.tsx`.

### 6.5.4 Lovable AI Gateway (optional)

- Server-side key (`LOVABLE_API_KEY`) only; never exposed.
- Models referenced indirectly; no vendor names surfaced to users.

## 6.6 Capacitor bridge surface

All plugin calls are wrapped under `src/utils/native/*`. Components depend
only on the wrapper API:

| Wrapper | Plugin | Purpose |
|---------|--------|---------|
| `statusBar` | `@capacitor/status-bar` | Emerald background + light icons on native. |
| `splashScreen` | `@capacitor/splash-screen` | Manual `hide()` after first paint. |
| `notifications` | `@capacitor/local-notifications` | Adhan, IF window, check-in nudges. |
| `haptics` | `@capacitor/haptics` | Dhikr ticks, confirmations. |
| `share` | `@capacitor/share` | Dakwah posters, blog deep links. |
| `clipboard` | `@capacitor/clipboard` | Copy ayah, invite code. |
| `network` | `@capacitor/network` | Offline banner + sync trigger. |
| `storage` | `@capacitor/preferences` | Native-side prefs mirror. |
| `device` | `@capacitor/device` | Diagnostics, build channel. |
| `browser` | `@capacitor/browser` | In-app browser for external links. |

Each wrapper exports `isNative()` and a no-op web fallback so screens are
platform-agnostic.

## 6.7 Deep links

| Surface | Mechanism | File |
|---------|-----------|------|
| Web | SPA routes | `public/_redirects` rewrites all to `index.html` |
| Android App Links | Digital Asset Links | `public/.well-known/assetlinks.json` |
| iOS Universal Links | Apple App Site Association | `public/.well-known/apple-app-site-association` |
| Custom scheme | (not used) | — |

`post_auth_redirect` (localStorage) preserves the intended path through
the auth round-trip.

## 6.8 Configuration files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | appId, plugins, splash, web dir. |
| `vite.config.ts` | Build, aliases, env. |
| `tailwind.config.ts` | Token + variant surface. |
| `supabase/config.toml` | Per-function settings (e.g., `verify_jwt`). |
| `public/_redirects` | SPA fallback for the web host. |
| `public/.well-known/*` | App Links / Universal Links manifests. |
| `.env` | Auto-managed: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. |
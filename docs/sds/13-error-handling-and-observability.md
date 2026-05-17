# 13 · Error Handling & Observability

## 13.1 Error taxonomy

| Layer | Error type | UI surface |
|-------|------------|------------|
| Network unreachable | `ApiOfflineError` | Sticky `OfflineBanner` + "Saved · syncs later" toast on writes. |
| Validation (400) | `ApiError('VALIDATION')` | Inline form error or toast with message. |
| Auth (401) | `ApiError('UNAUTHORIZED')` | Force re-auth via `AuthGuard`. |
| Forbidden (403) | `ApiError('FORBIDDEN')` | Toast + log; usually a programming bug. |
| Not found (404) | `ApiError('NOT_FOUND')` | Empty state + retry. |
| Conflict (409) | `ApiError('CONFLICT')` | Drop op + console warn (offline replay drift). |
| Upstream (502) | `ApiError('UPSTREAM')` | Fallback to cached data (prayer times, etc.). |
| Server (500) | `ApiError('INTERNAL')` | Toast + Sentry-style console capture. |
| React render | thrown in render | `ErrorBoundary` shows reload screen. |

## 13.2 ErrorBoundary

`src/components/ErrorBoundary.tsx` wraps the app. On catch it renders a
minimal recovery screen with a "Reload" CTA and prints the stack to the
console. It does not phone home in MVP — observability is admin-side.

## 13.3 Toast taxonomy

Driven by `hooks/use-toast.ts`. Variants:

- `default` — neutral confirmation ("Saved").
- `success` — primary action complete ("Log added").
- `destructive` — failures the user must see ("Couldn't save, retrying").
- `info` — offline / sync state changes.

Toasts auto-dismiss; failures persist until acknowledged.

## 13.4 Sync diagnostics

- `db-sync` logs each flush attempt to the console with op count and
  duration.
- Failed ops include the domain + code; `VALIDATION`/`CONFLICT` drops
  are noted explicitly to aid root-cause analysis.

## 13.5 Admin observability

Server-side telemetry surfaces through the admin console:

| Source | RPC | Page |
|--------|-----|------|
| Realtime user events | `admin_live_feed` (via `LiveActivityFeed`) | `AdminDashboard`, `AdminEngagement` |
| Module usage | `admin_module_usage` | `AdminEngagement` |
| Widget popularity | `admin_widget_popularity` | `AdminAnalytics` |
| Retention cohorts | `admin_retention_cohorts` | `AdminEngagement` |
| DAU/MAU + adoption | `admin_engagement_stats` | `AdminEngagement` |
| Per-pillar stats | `admin_iman_stats`, `admin_health_stats`, `admin_checkin_stats` | `AdminImanAnalytics`, `AdminHealthAnalytics` |
| Per-pillar trends | `admin_iman_trends`, `admin_health_trends` | same pages |
| Family rollup | `admin_family_overview`, `admin_family_members` | `AdminFamilies` |
| User drill-down | `admin_user_detail_stats` | `AdminUsers` |
| Signup chart | `admin_signup_chart` | `AdminDashboard` |
| Sadaqah breakdown | `admin_sadaqah_by_category` | `AdminImanAnalytics` |
| Table sizes | `admin_table_sizes` | `AdminSystem` |

## 13.6 Audit log

`admin_audit_log` records every admin-side write (`useAdminAudit`).
Fields: `actor_user_id`, `action`, `target`, `metadata jsonb`,
`created_at`. Retention ≥ 24 months.

## 13.7 User activity stream

`user_activity` rows (`{user_id, module, action, metadata, created_at}`)
are written from edge functions on significant events. Source of all
engagement RPCs above. 12-month rolling retention.

## 13.8 Client logging policy

- `console.log` allowed for development diagnostics.
- `console.error` for unexpected exceptions; never log secrets, JWTs,
  or full payloads with PII.
- No third-party crash reporter in MVP (decision: add Sentry post-MVP).

## 13.9 Health checks

- Backend lifecycle: `supabase--cloud_status` (operator-side) before
  risky migrations.
- Web: simple `GET /index.html` works as a liveness ping.
- Native: `@capacitor/network` reports current connectivity to UI.
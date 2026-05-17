# 05 · Data Design

The authoritative schema is `src/integrations/supabase/types.ts` (generated).
The narrative grouping below mirrors SRS §5 and adds design rationale,
indexing notes, and storage-bucket policies.

## 5.1 Domain groups

| Group | Tables | Notes |
|-------|--------|-------|
| Identity | `profiles`, `user_roles`, `user_activity` | `profiles.id == auth.users.id`. Roles separate. |
| Prayer | `prayer_settings`, `salah_logs` | One row per (user, date, prayer_name). |
| Quran | `quran_log`, `quran_daily_log`, `quran_reading_log`, `quran_reading_sessions`, `quran_bookmarks`, `quran_memorization`, `quran_preferences` | Sessions persist partial reads; daily log aggregates. |
| Dhikr / Sunnah / Dakwah | `dhikr_sessions`, `sunnah_log`, `dakwah_posters` | Dakwah posters publicly readable when `is_active`. |
| Financial ibadah | `sadaqah_donations`, `sadaqah_goals`, `zakat_history`, `fidyah_history` | Goal vs donation linked by `goal_id` nullable. |
| Qada / Fasting | `qada_solat`, `ramadhan_qada`, `fasting_log` | Qada tracks remaining counts per prayer. |
| Advanced | `qiyam_settings`, `qiyam_log`, `ramadan_settings`, `ramadan_daily_log`, `hajj_umrah_progress` | |
| Health | `user_health_profiles`, `health_bmi`, `weight_log`, `hydration_log`, `sleep_log`, `if_sessions`, `steps_logs`, `steps_preferences` | Active IF session is the local source of truth. |
| Wealth | `transactions`, `budget_periods`, `savings_goals`, `savings_contributions` | Income is a `transactions.type='income'` row. |
| Productivity | `daily_tasks`, `habits`, `habit_log`, `life_area_scores` | Habits scored per day. |
| Family | `families`, `family_members`, `family_activity_feed`, `family_announcements`, `family_reactions`, `family_privacy_settings` | Group types: `family` / `class`. |
| Daily / dashboard | `daily_checkins`, `widget_preferences` | One check-in per (user, date). |
| Content | `blog_posts`, `page_overrides`, `announcements` | Public read when published/active. |
| Admin / system | `admin_audit_log`, `app_stats` | Admin-only read. |

## 5.2 Identity ER

```text
auth.users ──1:1── profiles ──1:N── user_roles
                 │
                 ├──1:N── user_activity
                 ├──1:N── (all user-owned tables via user_id)
                 └──1:N── family_members ─── N:1 ─── families
```

## 5.3 RLS template

Every user-owned table follows the four-policy pattern (own row select /
insert / update / delete) plus admin read. See SRS §5.3 for the canonical
SQL. Family-scoped tables additionally allow members via
`is_family_member(family_id)` (security definer). Public reads (blog,
announcements, dakwah posters) expose only the publishable subset to the
`anon` role.

## 5.4 Keys and indexing

| Pattern | Implementation |
|---------|----------------|
| Primary keys | `uuid` defaulting to `gen_random_uuid()`. |
| User scoping | `user_id uuid not null` on every owned table. |
| Date scoping | `date date not null` for daily logs; index `(user_id, date desc)`. |
| Uniqueness | `(user_id, date, prayer_name)` on `salah_logs`; `(user_id, date)` on `daily_checkins`; `(user_id, role)` on `user_roles`. |
| Family scoping | `family_id uuid not null` + `(family_id, created_at desc)` index for feeds. |
| Soft updates | `updated_at timestamptz default now()` driven by `update_updated_at_column()` trigger pattern when added. |
| Idempotency | Client UUIDs allow safe upserts on retry. |

Indexes are added implicitly via unique constraints; additional composite
indexes are introduced by migration only when query plans show
sequential scans on hot paths (dashboard, leaderboard).

## 5.5 Validation strategy

- CHECK constraints used only for **immutable** assertions (e.g.,
  `amount >= 0`).
- Time-based validations (`expire_at > now()`) implemented as trigger
  functions, per the Lovable Cloud guideline (mutable CHECK breaks
  restores).
- Cross-table invariants (e.g., qada decrement) live in **edge functions**,
  not triggers, so the audit trail is single-sourced.

## 5.6 LocalStorage cache contract

| Namespace prefix | Owner | Shape |
|------------------|-------|-------|
| `sm:auth:*` | AuthContext + Supabase | Session, locale. |
| `sm:<domain>:cache:<key>` | `lib/<domain>-storage.ts` | Domain rows keyed by id/date. |
| `sm:<domain>:pending` | `db-sync` | Array of pending ops `{op, payload, ts, uuid}`. |
| `sm:dashboard:widgets` | `useWidgetPreferences` | Widget visibility + order. |
| `sm:quran:session` | Quran reader | Pending unflushed session. |
| `sm:fasting:active` | `fastingStore` | Active IF session (never cleared by cache wipe). |
| `sm:post_auth_redirect` | AuthGuard | Pre-login intended path. |

## 5.7 Sync contract

See SRS §5.5 and SDS §10.4 for sequence diagrams.

- Last-write-wins by `updated_at`.
- Server timestamp is authoritative on readback.
- IF active session: client is source of truth until the session closes.
- Quran pending session flushed on next focus tick (`mem://tech/quran-session-persistence`).

## 5.8 Backdate window

`logged_for ∈ [today − 90, today]`. Enforced in:

1. UI: `BackdateDatePicker` disables out-of-range dates.
2. Edge functions: server-side guard rejects with `400 BACKDATE_OUT_OF_RANGE`.
3. RLS: not enforced (RLS handles authz, not business rules).

## 5.9 Khatam / Quran math

| Constant | Value |
|----------|-------|
| Total ayahs | 6,236 (Uthmani) |
| Total pages | 604 (Madinah Mushaf) |
| Total juz | 30 |

`khatam_pct = read_ayahs / 6236 * 100`. ETA = `(6236 − read_ayahs) / pace7d`.
Mappings (juz ↔ ayah ↔ page ↔ surah) live in `src/lib/quran-mapping.ts`
as static tables compiled into the bundle.

## 5.10 Storage buckets

| Bucket | Public read | Write | Notes |
|--------|-------------|-------|-------|
| `avatars` | No (own only via signed URL or RLS-equivalent policy) | Authenticated own | Profile pictures. |
| `dakwah-posters` | Yes | Admin via `api-admin` | Surfaced in `DailyDakwah`. |
| `blog-images` | Yes | Admin via `api-admin` | Embedded in posts. |
| `cms-uploads` | Yes | Admin via `api-admin` | Page-override imagery for CMS overlay. |

File-size and MIME validations happen client-side (editor) and re-check
server-side at upload time.

## 5.11 Retention

| Class | Policy |
|-------|--------|
| User logs | Indefinite while account exists. |
| Account deletion | Hard delete within 30 days via `api-profile` → `admin_delete_user()`. |
| `admin_audit_log` | 24 months minimum. |
| `user_activity` | 12 months rolling. |
| `app_stats` | Aggregated only; non-identifying. |
| Client pending queue | Flushed at next online tick; selective cache clear preserves auth + active IF. |

## 5.12 Reporting / analytics functions

All admin analytics flow through SECURITY DEFINER RPCs that gate on
`has_role(auth.uid(), 'admin')`:

`admin_overview_stats`, `admin_user_breakdown`, `admin_signup_chart`,
`admin_retention_cohorts`, `admin_engagement_stats`, `admin_module_usage`,
`admin_widget_popularity`, `admin_iman_stats`, `admin_iman_trends`,
`admin_health_stats`, `admin_health_trends`, `admin_checkin_stats`,
`admin_family_overview`, `admin_family_members`, `admin_live_feed`,
`admin_table_sizes`, `admin_user_detail_stats`, `admin_sadaqah_by_category`,
`admin_user_last_active`, `admin_delete_user`.

Family RPCs: `get_family_leaderboard`, `is_family_member`,
`is_family_admin`, `lookup_family_by_invite`.

Auth helper trigger: `handle_new_user()` mirrors the new auth user into
`profiles` and seeds `display_name` from `full_name → name → display_name →
email-local-part`.
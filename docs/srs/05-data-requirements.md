# 05 · Data Requirements

## 5.1 Entity overview

The database has **56 user-facing tables** in the `public` schema, all owned by
Postgres and protected by Row-Level Security. Tables fall into the following
groups:

| Group | Tables |
|-------|--------|
| **Identity** | `profiles`, `user_roles`, `user_activity` |
| **Iman — prayer** | `prayer_settings`, `salah_logs` |
| **Iman — Quran** | `quran_log`, `quran_daily_log`, `quran_reading_log`, `quran_reading_sessions`, `quran_bookmarks`, `quran_memorization`, `quran_preferences` |
| **Iman — dhikr / sunnah / dakwah** | `dhikr_sessions`, `sunnah_log`, `dakwah_posters` |
| **Iman — financial ibadah** | `sadaqah_donations`, `sadaqah_goals`, `zakat_history`, `fidyah_history` |
| **Iman — qada / fasting** | `qada_solat`, `ramadhan_qada`, `fasting_log` |
| **Iman — advanced** | `qiyam_settings`, `qiyam_log`, `ramadan_settings`, `ramadan_daily_log`, `hajj_umrah_progress` |
| **Health** | `user_health_profiles`, `health_bmi`, `weight_log`, `hydration_log`, `sleep_log`, `if_sessions`, `steps_logs`, `steps_preferences` |
| **Wealth** | `transactions`, `budget_periods`, `savings_goals`, `savings_contributions` |
| **Productivity** | `daily_tasks`, `habits`, `habit_log`, `life_area_scores` |
| **Family** | `families`, `family_members`, `family_activity_feed`, `family_announcements`, `family_reactions`, `family_privacy_settings` |
| **Daily / dashboard** | `daily_checkins`, `widget_preferences` |
| **Content** | `blog_posts`, `page_overrides`, `announcements` |
| **Admin / system** | `admin_audit_log`, `app_stats` |

The authoritative schema is the generated type file
`src/integrations/supabase/types.ts` — **never** edit it manually.

## 5.2 Identity model

```text
auth.users (Supabase-managed)
    │  (user.id mirrored as profiles.id)
    ▼
profiles  (display_name, avatar_url, locale, settings)
    │
    ├── user_roles (role: 'admin' | 'moderator' | 'user')
    │
    └── owns all user data via user_id FK
```

- **Foreign keys to `auth.users` are forbidden.** Tables reference `profiles.id`
  or carry a `user_id` column that matches `auth.uid()` in RLS.
- **Roles never live on `profiles`.** Always read via the security definer
  function `public.has_role(_user_id uuid, _role app_role)`.

## 5.3 Row-Level Security policy template

Every user-owned table follows this pattern:

```sql
alter table public.<table> enable row level security;

create policy "own rows: select"
  on public.<table> for select to authenticated
  using (user_id = auth.uid());

create policy "own rows: insert"
  on public.<table> for insert to authenticated
  with check (user_id = auth.uid());

create policy "own rows: update"
  on public.<table> for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "own rows: delete"
  on public.<table> for delete to authenticated
  using (user_id = auth.uid());

create policy "admins read all"
  on public.<table> for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
```

Family-scoped tables (e.g., `family_activity_feed`) additionally allow members
of the same `family_id` to read, gated by a `is_family_member(family_id, uid)`
security-definer helper.

Public tables (`blog_posts` where `status = 'published'`, `announcements`
within active range, `dakwah_posters` where `is_active`) expose only published
rows to the `anon` role.

## 5.4 Validation pattern

Per `mem://important-guidelines`, **CHECK constraints must be immutable**.
Time-based validations (e.g., `expire_at > now()`) live in **trigger
functions** instead of CHECK constraints.

## 5.5 Offline-first sync contract

### 5.5.1 Read path

1. The component mounts and calls a `use*Query` hook.
2. The hook reads from `localStorage` synchronously and returns immediately
   so the UI never blanks.
3. The hook also triggers a React Query fetch.
4. On success, the localStorage cache and React Query cache are updated.

### 5.5.2 Write path

1. Mutation runs **optimistically**: localStorage is updated first.
2. The Supabase write is fired via `src/lib/api-client.ts`.
3. If the write fails (offline or 5xx), the operation is appended to a
   per-domain **pending queue** in localStorage.
4. `src/lib/db-sync.ts` flushes pending operations on:
   - app focus / visibility change,
   - network "online" event,
   - explicit user action (e.g., pull to refresh),
   - successful auth restore.
5. Each operation carries a client-generated UUID and `updated_at`. The server
   **upserts** so retries are safe and idempotent.

### 5.5.3 Conflict resolution

Last-write-wins by `updated_at`. The server timestamp is authoritative on read
back. Active IF sessions are an exception: the client's running timer is the
source of truth until the session ends.

## 5.6 Backdate window

All log inserts accept an optional `logged_for` date.

- **Allowed range:** today − 90 days, inclusive.
- Future dates are rejected by the server.
- The UI selector (`BackdateDatePicker`) prevents out-of-range selections.
- See `mem://features/backdate-capability`.

## 5.7 Life Score formula

Composite life score is computed daily by `src/lib/life-score.ts` from three
sub-scores. The canonical weights live in
`mem://features/life-score-logic` and **must not be duplicated here** to avoid
drift — refer to the memory note when implementing changes.

At a high level:

- **Iman score** is driven by salah completeness, Quran activity, dhikr,
  sunnah, and fasting compliance.
- **Wellness score** is driven by hydration, sleep, weight trend, and IF
  adherence.
- **Productivity score** is driven by task completion and habit streaks.

Each sub-score is normalized to 0–100; the composite is a weighted mean.

## 5.8 Khatam / Quran math

- Total ayahs = **6,236** (Uthmani count).
- Total pages = **604** (standard Madinah Mushaf).
- Total juz = **30**.
- Khatam % = `read_ayahs / 6236 * 100`.
- ETA days = `(6236 − read_ayahs) / 7-day moving average of ayahs/day`.

Static mapping utilities (juz ↔ ayah ↔ page ↔ surah) live in
`src/lib/quran-mapping.ts`. See `mem://tech/quran-data-mapping`.

## 5.9 Data retention

| Class | Retention |
|-------|-----------|
| User-owned logs (prayer, Quran, health, wealth, etc.) | Indefinite while the account is active. |
| Account on user delete request | Hard-deleted within 30 days; admins purge via `api-profile`. |
| `admin_audit_log` | 24 months minimum (compliance). |
| `app_stats` | Aggregated metrics only; not personally identifying. |
| `user_activity` | 12 months rolling window. |
| Pending sync queue (client) | Flushed on next online tick or cleared by selective cache clear. |

## 5.10 Storage buckets

- `dakwah-posters` — public read, admin write.
- `blog-images` — public read, admin write.
- `cms-overrides` — public read for marketing assets, admin write.
- `avatars` — authenticated read of own; admin read of all.

File-size limits and image dimensions are enforced client-side before upload
(see editors); the server validates MIME type.
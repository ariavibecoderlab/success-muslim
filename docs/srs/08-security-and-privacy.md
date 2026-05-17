# 08 · Security & Privacy

## 8.1 Authentication

- **Primary:** email + password via Supabase Auth.
- **Federated:** Google OAuth (Web application client type, so the Capacitor
  WebView accepts the redirect).
- **HIBP:** breach-password screen enabled at the Auth level (`NFR-SEC-003`).
- **Email verification:** required before sign-in unless the team explicitly
  toggles auto-confirm for a controlled environment.
- **Anonymous sign-ups:** forbidden.
- **Password reset:** `/reset-password` flow.
- **Session storage:** browser `localStorage` with auto-refresh tokens.

## 8.2 Authorization (RBAC)

### 8.2.1 Roles

```sql
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;
```

### 8.2.2 Security-definer role check

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
```

### 8.2.3 Family-scope authorization

A second security-definer helper checks whether a user belongs to a family:

```sql
-- pseudo-name; implementation in migrations
create or replace function public.is_family_member(_family_id uuid, _user_id uuid)
returns boolean security definer ...
```

## 8.3 Data classification

| Class | Examples | Storage | Visible to |
|-------|----------|---------|------------|
| **Public** | Blog posts (published), dakwah posters (active), announcements (active range) | Postgres + Storage | Anyone |
| **User-only** | Salah, Quran, dhikr, sunnah, health, wealth, productivity logs; profile fields | Postgres (RLS) | The user, and admins for support |
| **Family-scoped** | Family activity feed, leaderboard, announcements, reactions | Postgres (RLS) | Members of that family only, gated by privacy settings |
| **Privileged** | `admin_audit_log`, full user list | Postgres (RLS) | Admins only via `has_role` |
| **Operational** | Edge function logs, app metrics | Supabase + provider | Staff |

## 8.4 Privacy controls (end user)

- Per-family **privacy settings** govern which metrics are shared with that
  family.
- **Account deletion** via Settings triggers a server-side purge through
  `api-profile`.
- **Selective cache clear** wipes app state but preserves session and active fast.
- **Notification opt-in** is explicit; denied state degrades gracefully.
- **Location opt-in** is explicit; manual zone selection always works.

## 8.5 Data minimization

- The app does not collect contacts, photos library, or device identifiers
  beyond what Capacitor's `@capacitor/device` exposes for diagnostics.
- No third-party analytics SDKs ship in MVP.
- No advertising identifiers, no IDFA, no GAID usage.

## 8.6 Regulatory alignment

- **GDPR / UK GDPR** — lawful basis is contract (the service the user requested);
  right to access, rectify, and erase honored via Settings + `api-profile`.
- **PDPA (MY/SG/ID variants)** — same controls; data residency follows
  Supabase region.
- **COPPA** — minimum age 13 documented in ToS and on sign-up.
- **Apple App Store privacy nutrition** — see
  `docs/store-listings/app-privacy-ios.md`.
- **Google Play Data Safety** — see
  `docs/store-listings/data-safety-android.md`.

## 8.7 Threat model (summary)

| Threat | Control |
|--------|---------|
| Privilege escalation via client tampering | All role checks on server via `has_role()`. |
| Cross-tenant data access | RLS on every table; FKs through `auth.uid()`. |
| Brute-force on auth | Supabase rate limits + HIBP. |
| Stolen device | Auto-locking app session; no biometric storage in MVP. |
| Insecure transport | HTTPS only; `allowMixedContent: false` on Android. |
| Edge function abuse | `verify_jwt = true` for all user-data functions; `jakim-proxy` is the lone public function and is read-only. |
| Supply chain | Pinned Capacitor 8 plugins; periodic `code--dependency_scan`. |
| Admin abuse | Audit log + session timeout + mobile block. |

## 8.8 Incident response (lightweight)

1. **Triage** — owner identifies severity (S0/S1/S2).
2. **Contain** — rotate `Lovable AI` key and Supabase service-role key via
   `ai_gateway--rotate_lovable_api_key` and `supabase--rotate_api_keys` as needed.
3. **Communicate** — in-app announcement banner for user-visible incidents.
4. **Postmortem** — written within 7 days, stored in `docs/incidents/`.
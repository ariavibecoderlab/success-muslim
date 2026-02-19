

# Admin Dashboard - Full Revamp

## Overview
Complete rebuild of the admin panel with real metrics, comprehensive analytics, and production-grade features. The existing skeleton (AdminGuard, useAdmin, basic layout) is solid -- we'll keep the security layer and replace all page content.

## What Already Exists (Keep)
- AdminGuard with `has_role` RPC (secure, server-side role check)
- `user_roles` table with RLS + `app_role` enum
- `user_activity` table with module/action/metadata logging
- `profiles` table with onboarding, focus_areas, consistency_level, city, country
- Admin RLS policies on profiles and user_activity (admins can read all)
- Routes in App.tsx: /admin, /admin/users, /admin/analytics, /admin/announcements

## Database Changes

### 1. Create `admin_audit_log` table
Tracks every admin action (user disable, poster upload, announcement create/delete).

```sql
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage audit log"
  ON public.admin_audit_log FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

### 2. Create server-side analytics functions (SECURITY DEFINER)
These bypass RLS to compute aggregate stats safely:

- `admin_overview_stats()` -- returns total users, today's signups, DAU (distinct users in user_activity today), MAU (last 30 days), onboarding completion rate
- `admin_signup_chart(days int)` -- returns daily signup counts for the last N days
- `admin_module_usage()` -- returns module usage counts from user_activity
- `admin_user_breakdown()` -- returns focus area distribution, consistency level distribution, country/city breakdown from profiles
- `admin_retention_cohorts()` -- returns D1/D3/D7/D14/D30 retention by signup week

All functions use `SECURITY DEFINER` with `SET search_path = public` and are restricted to admin callers via `has_role(auth.uid(), 'admin')` check inside.

## Frontend Changes

### File: `src/pages/admin/AdminLayout.tsx`
- Add header: "Success Muslim -- Admin Panel"
- Show logged-in admin name from profile
- Add auto-refresh timestamp (60s interval)
- Add Logout button
- Add nav items for new routes: Da'wah (/admin/dawah), System (/admin/system)
- Session timeout: 30-min inactivity timer that signs out

### File: `src/pages/admin/AdminDashboard.tsx` (full rewrite)
**Section 1: Overview Stats (8 cards)**
- Total Users, Today's New, Active DAU, Active MAU
- Onboarding Completed %, Drop-off %, Avg Session Time, D7 Retention
- All pulled from `admin_overview_stats()` RPC
- Auto-refresh every 60 seconds

**Section 2: User Growth Chart**
- Line chart (total cumulative) + bar overlay (daily new signups)
- Toggle: 7d / 30d / 90d / All time
- Uses `admin_signup_chart()` RPC
- Built with recharts (already installed)

**Section 3: Module Usage**
- Horizontal bar chart showing % of users using each module
- From `admin_module_usage()` RPC

### File: `src/pages/admin/AdminAnalytics.tsx` (full rewrite)
**User Breakdown Section:**
- Registration method donut (Google vs Email) -- derived from profiles metadata
- Focus areas bar chart
- Consistency level donut
- Top 10 countries/cities tables
- All from `admin_user_breakdown()` RPC

**Retention Table:**
- Cohort table by signup week with D1/D3/D7/D14/D30 columns
- From `admin_retention_cohorts()` RPC
- Color-coded cells (green > 50%, yellow 20-50%, red < 20%)

### File: `src/pages/admin/AdminUsers.tsx` (enhanced)
- Add email column (from auth metadata in profile or display)
- Add Last Active column (from user_activity max created_at)
- Add Onboarding Complete column
- Add Focus Areas column
- Add Country column
- Add Role badge (admin/moderator/user)
- Search by name or email
- Filter by: country, onboarding status
- Sort by: signup date, last active
- Pagination: 25 per page
- Export to CSV button
- View Profile expander

### File: `src/pages/admin/AdminDawah.tsx` (new)
- Upload poster with image + title + date + category tag
- View all posters in a grid with date, title
- Delete poster button
- Uses existing `dakwah_posters` table and `dakwah-posters` storage bucket

### File: `src/pages/admin/AdminSystem.tsx` (new)
- Database status indicator (test query)
- Auth service status (test auth call)
- Storage status (test bucket list)
- Recent errors from user_activity where action contains 'error'
- Basic health dashboard

### File: `src/hooks/useAdminTimeout.ts` (new)
- Track mouse/keyboard activity
- After 30 minutes of inactivity, call `signOut()` and redirect to /auth
- Show warning toast at 25 minutes

### File: `src/hooks/useAdminAudit.ts` (new)
- `logAdminAction(action, targetType, targetId, metadata)` helper
- Inserts into `admin_audit_log` table

## Route Updates (App.tsx)
Add two new routes inside the AdminGuard group:
```
/admin/dawah -> AdminDawah
/admin/system -> AdminSystem
```

## Implementation Sequence
1. Database migration: create `admin_audit_log` table + 5 analytics RPC functions
2. Create `useAdminTimeout` and `useAdminAudit` hooks
3. Revamp `AdminLayout` with full header, new nav, timeout
4. Rewrite `AdminDashboard` with overview stats + growth chart + module usage
5. Rewrite `AdminAnalytics` with user breakdown + retention cohorts
6. Enhance `AdminUsers` with full table features
7. Create `AdminDawah` poster management page
8. Create `AdminSystem` health page
9. Update App.tsx routes
10. Update PROGRESS.md and .lovable/plan.md

## Security Checklist
- All RPC functions use SECURITY DEFINER with admin role check inside
- admin_audit_log has RLS with admin-only policy
- No admin data stored in localStorage
- Session timeout after 30 minutes
- /admin not linked from any user-facing page
- AdminGuard redirects non-admins to /dashboard


# Upgrade Plan: Backend, Admin, and Homepage Revamp

This plan covers three major upgrades: (1) a stunning new homepage to excite users, (2) a full Supabase backend with authentication and data sync, and (3) an admin panel for managing the app.

---

## Part 1: Homepage Revamp

The current landing page only promotes 3 features (Qada, Ramadhan, Fidyah). The app now has much more. We will redesign it to reflect the full "Success Muslim App" vision.

### New Homepage Sections

1. **Hero Section** -- Bold headline: "Success Muslim App" with animated background pattern (geometric Islamic art via CSS). Subheadline referencing the 5 pillars. Two CTAs: "Start Free" and "See How It Works" (scroll anchor).
2. **Life Score Preview** -- Animated mockup showing a Life Score gauge (0-100) with Iman/Wellness/Productivity breakdowns. This is the hook -- the differentiator.
3. **5 Pillars Showcase** -- Interactive tabs or horizontal scroll showing all 5 pillars (Iman, Wellness, Wealth, Productivity, Family) with feature previews and icons. Each pillar card expands to show 3-4 key features.
4. **Feature Highlights** -- 6-card grid showing the most exciting tools: Prayer Times, Dhikr Counter, Qada Solat Tracker, Zakat Calculator, Sunnah Tracker, Life Score.
5. **Social Proof / Stats** -- Counter badges: "X prayers tracked", "X dhikr counted" (pulled from real aggregate data via an edge function).
6. **How It Works** -- Updated 3-step flow: Track -> Score -> Improve.
7. **Testimonials Placeholder** -- Ready for future real testimonials.
8. **Bottom CTA** -- "Every Prayer Counts" with motivational Islamic quote.
9. **Footer** -- Links to privacy, terms (placeholder), social links.

---

## Part 2: Backend Setup (Lovable Cloud)

### 2A. Enable Lovable Cloud

- Spin up database, auth, edge functions, and storage.

### 2B. Database Schema

**Tables to create:**

```text
profiles
  - id (uuid, FK -> auth.users)
  - display_name (text)
  - city (text)
  - country (text)
  - gender (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

user_roles
  - id (uuid)
  - user_id (uuid, FK -> auth.users)
  - role (app_role enum: admin, moderator, user)
  - unique(user_id, role)

user_activity
  - id (uuid)
  - user_id (uuid, FK -> auth.users)
  - module (text: iman, wellness, productivity, wealth, family)
  - action (text: prayer_logged, dhikr_counted, task_completed, etc.)
  - metadata (jsonb)
  - created_at (timestamptz)

app_stats
  - id (uuid)
  - stat_key (text, unique: total_prayers, total_dhikr, total_users, etc.)
  - stat_value (bigint)
  - updated_at (timestamptz)

announcements
  - id (uuid)
  - title (text)
  - content (text)
  - is_active (boolean)
  - created_at (timestamptz)
  - created_by (uuid, FK -> auth.users)
```

### 2C. Authentication

- Email + password sign-up/login
- Auth pages: `/auth` (login/signup toggle), `/reset-password`
- Auto-create profile on signup via database trigger
- Protected routes: redirect to `/auth` if not logged in
- Admin emails configured via a list (e.g., your email) checked on signup to auto-assign admin role

### 2D. Data Migration Strategy

- For MVP: localStorage data remains the primary source (no disruption)
- Add a "Sync to Cloud" button in profile/settings that uploads localStorage data to Supabase
- Future: real-time sync replaces localStorage entirely

### 2E. RLS Policies

- profiles: users can only read/update their own
- user_roles: read-only for users, managed by admins via `has_role()` security definer function
- user_activity: users can insert/read their own
- app_stats: public read, admin write
- announcements: public read, admin create/update/delete

---

## Part 3: Admin Panel

### 3A. Admin Routes

- `/admin` -- Admin dashboard (protected, role-checked)
- `/admin/users` -- User management
- `/admin/analytics` -- Usage analytics
- `/admin/announcements` -- Manage app announcements
- `/admin/settings` -- App-wide settings

### 3B. Admin Dashboard (`/admin`)

- Total registered users (count from profiles)
- Daily/weekly/monthly active users (from user_activity)
- Module usage breakdown (Iman vs Wellness vs Productivity)
- New signups chart (recharts line chart)
- Quick stat cards: total prayers tracked, total dhikr, total Qada completed

### 3C. User Management (`/admin/users`)

- Paginated user list with search
- View user profile details
- Assign/remove moderator role
- Disable/enable accounts (set profile flag)
- Last active timestamp

### 3D. Analytics Dashboard (`/admin/analytics`)

- User growth over time (line chart)
- Module popularity pie chart
- Daily active users bar chart
- Feature adoption rates (% of users using each feature)
- Retention metrics (7-day, 30-day approximation)

### 3E. Announcements Manager (`/admin/announcements`)

- Create/edit/delete announcements
- Toggle active/inactive
- Announcements display as a banner on the user dashboard

### 3F. Admin Guard

- `has_role()` security definer function (as per security guidelines)
- Client-side: check role via Supabase query, redirect non-admins
- Server-side: RLS policies enforce access

---

## Part 4: Auth UI and Navigation Updates

### 4A. Auth Pages

- `/auth` page with login/signup tabs
- Clean, minimal design matching app theme
- Email + password fields with validation (zod)
- "Forgot password?" link -> sends reset email
- `/reset-password` page for setting new password

### 4B. Navigation Updates

- Landing page nav: "Get Started" -> `/auth` (instead of `/dashboard`)
- Add user avatar/menu in Dashboard top nav when logged in
- Profile dropdown: Profile, Settings, Admin (if admin), Logout
- Bottom nav unchanged

### 4C. Profile/Settings Page

- `/settings` page accessible from user menu
- Change display name, city, country
- "Sync Data to Cloud" button
- Logout button

---

## Technical Details

### Files to Create

- `src/pages/Auth.tsx` -- Login/signup page
- `src/pages/ResetPassword.tsx` -- Password reset page
- `src/pages/Settings.tsx` -- User settings/profile
- `src/pages/admin/AdminDashboard.tsx` -- Admin home
- `src/pages/admin/AdminUsers.tsx` -- User management
- `src/pages/admin/AdminAnalytics.tsx` -- Analytics charts
- `src/pages/admin/AdminAnnouncements.tsx` -- Announcements CRUD
- `src/pages/admin/AdminLayout.tsx` -- Admin sidebar/nav wrapper
- `src/components/AuthGuard.tsx` -- Protected route wrapper
- `src/components/AdminGuard.tsx` -- Admin role check wrapper
- `src/hooks/useAuth.ts` -- Auth state hook
- `src/hooks/useAdmin.ts` -- Admin role check hook
- `src/integrations/supabase/client.ts` -- Supabase client (auto-generated)

### Files to Edit

- `src/pages/Landing.tsx` -- Complete redesign
- `src/App.tsx` -- Add auth routes, admin routes, guards
- `src/components/BottomNav.tsx` -- Minor updates
- `src/pages/Dashboard.tsx` -- Add announcement banner, user greeting with real name

### Database Migrations

- Create `app_role` enum
- Create `profiles` table with trigger
- Create `user_roles` table with `has_role()` function
- Create `user_activity` table
- Create `app_stats` table
- Create `announcements` table
- RLS policies for all tables

### Edge Functions

- `aggregate-stats`: Cron-like function to compute app_stats from user_activity (called by admin)

---

## Execution Order

1. Enable Lovable Cloud
2. Run database migrations (schema + RLS + triggers)
3. Build auth pages (login, signup, reset password)
4. Build auth guards and hooks
5. Redesign Landing page
6. Build admin layout and dashboard
7. Build admin user management
8. Build admin analytics
9. Build announcements system
10. Update Dashboard with real user greeting + announcements
11. Add Settings page with sync-to-cloud option

---

## What This Delivers

- A compelling homepage that sells the vision of "Life Optimization for Muslims"
- Full user authentication (email/password)
- Cloud-ready backend with Supabase
- Admin panel with user management, analytics dashboards, and announcements
- Smooth migration path from localStorage to cloud sync
- Security best practices (RLS, role-based access, has_role() definer)
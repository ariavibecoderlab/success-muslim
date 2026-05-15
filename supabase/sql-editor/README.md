# Supabase SQL Editor - Run Migrations

Use these files in the **Supabase SQL Editor** if the regular migrations fail. Run them **in order**, one at a time.

## Steps

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the contents of each file below and run in order

## Order

| # | File | Description |
|---|------|-------------|
| 1 | `01a_tables.sql` | Create all tables |
| 2 | `01b_triggers.sql` | Create triggers (profile on signup, updated_at) |
| 3 | `02_rls_policies.sql` | Enable RLS and create policies |
| 4 | `03_admin_policies.sql` | Admin-only policies for content and ads |

## If "relation already exists"

You may have partially run migrations before. Either:

- **Option A:** Drop all tables and re-run from 01a. Use the Table Editor or run:
  ```sql
  DROP TABLE IF EXISTS public.ad_slots, public.admin_users, public.movement_logs,
    public.family_invites, public.family_members, public.family_groups,
    public.bookmarks, public.learn_content, public.fasting_sessions,
    public.prayer_preferences, public.habit_check_ins, public.daily_plans,
    public.profiles CASCADE;
  ```
  Then re-run 01a_tables.sql.

- **Option B:** Skip the failing statement and run the rest one by one.

## After Migrations Succeed

1. Enable Auth providers: Dashboard → Authentication → Providers (Email, Google)
2. Sign up in your app, then add yourself as admin:
   ```sql
   INSERT INTO admin_users (user_id, role)
   SELECT id, 'super_admin' FROM auth.users WHERE email = 'your-email@example.com';
   ```
3. Run the app: `npm install && npm run dev`

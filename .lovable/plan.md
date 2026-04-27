
# Migrate to a Separate (Standalone) Supabase Project

## Why this plan

Right now your project uses **Lovable Cloud** (a managed Supabase instance owned by Lovable). You want to move to your **own standalone Supabase project** so you have full control (dashboard access, billing, region choice, direct SQL editor, etc.).

This is a **one-way migration**. Once disconnected from Lovable Cloud, you cannot re-enable it on this project.

## What needs to move

Your current backend has:
- **35+ tables** with RLS policies (profiles, salah_logs, quran_*, family_*, health_*, dhikr_sessions, etc.)
- **20+ database functions** (admin_*, has_role, is_family_member, get_family_leaderboard, handle_new_user, etc.)
- **1 enum** (`app_role`)
- **1 trigger** (handle_new_user on auth.users)
- **15+ Edge Functions** (api-misc, api-salah, api-quran, api-family, api-health, api-wealth, api-productivity, api-admin, api-profile, api-checkin, api-dhikr, api-sunnah, jakim-proxy, etc.)
- **4 Storage buckets** (cms-uploads, avatars, dakwah-posters, blog-images)
- **Auth users** (existing accounts + Google OAuth)
- **All user data** (prayers, Quran logs, families, etc.)

## Migration Steps

### Step 1 — Create your new Supabase project (you do this)
1. Go to supabase.com → New Project
2. Pick region (closest to Malaysia: Singapore `ap-southeast-1`)
3. Save the **Project URL**, **anon key**, **service_role key**, and **DB password**

### Step 2 — Copy schema + functions
Use Supabase's built-in tools:
- In **old** project (Lovable Cloud) → SQL Editor → run `pg_dump` style export, OR use `supabase db dump --schema public` via CLI
- In **new** project → SQL Editor → paste and run

I'll generate a single consolidated SQL migration file with: enum, all tables, all RLS policies, all functions, the `handle_new_user` trigger, and storage bucket setup.

### Step 3 — Copy data
Two options:
- **(A) Fresh start** — skip data, users re-register. Simplest.
- **(B) Full migration** — use `pg_dump --data-only` from old DB → restore into new DB. Auth users need a separate `auth.users` export (Supabase support tool).

### Step 4 — Deploy Edge Functions to new project
Install Supabase CLI locally, link to new project, run `supabase functions deploy <name>` for each function. I'll prepare a script listing all functions.

### Step 5 — Re-create secrets in new project
In new project → Edge Functions → Secrets, add: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `LOVABLE_API_KEY` (if you still want Lovable AI), plus any others.

### Step 6 — Re-configure Auth in new project
- Enable Email provider
- Enable Google OAuth (re-paste your Google client ID/secret — same Web application credentials work)
- Add redirect URLs: `https://successmuslim.app/auth/callback`, preview URL, localhost
- Re-create storage buckets with same names + public flags

### Step 7 — Update the Lovable project to point at the new Supabase
- Disable Lovable Cloud (Connectors → Lovable Cloud → Disable)
- Connect external Supabase using Lovable's Supabase integration
- Paste the new project URL + anon key
- The `src/integrations/supabase/client.ts` and `.env` will auto-regenerate to point at the new project

### Step 8 — Verify
Test signup, login, prayer logging, family creation, admin pages.

## What I'll prepare for you (when you approve)

1. **`migration-schema.sql`** — single file with enum + all 35 tables + RLS + all 20 functions + trigger. Ready to paste into new project's SQL editor.
2. **`storage-setup.sql`** — creates the 4 buckets with correct public flags + policies.
3. **`deploy-functions.sh`** — bash script listing all `supabase functions deploy` commands.
4. **A step-by-step checklist** in `docs/SUPABASE_MIGRATION.md` you follow manually.

## What I cannot do for you

- Create the new Supabase project (you must do this — needs your account/billing)
- Run `pg_dump` / `pg_restore` (needs your DB credentials, runs on your machine)
- Migrate `auth.users` rows (Supabase requires their support tool or admin API with service key)
- Disconnect Lovable Cloud (you click that in Settings)

## Decision needed

**Data migration**: do you want to (A) start fresh — users re-sign up, or (B) preserve all existing user data + accounts? (B) is significantly more involved (DB dump/restore + auth user export).

Reply with **A** or **B** (or any other questions) and I'll generate the migration files.

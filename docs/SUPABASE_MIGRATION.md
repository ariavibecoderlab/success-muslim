# Migrate Success Muslim → Standalone Supabase Project

This guide walks you through moving the backend from **Lovable Cloud** (managed) to **your own Supabase project** (full dashboard access, billing under your name).

> ⚠️ **One-way migration.** Once you disable Lovable Cloud, you cannot re-enable it on this project.

---

## What you'll need

- A Supabase account ([supabase.com](https://supabase.com))
- Supabase CLI installed locally → [install guide](https://supabase.com/docs/guides/cli)
- The 3 generated files (in `/mnt/documents/supabase-migration/`):
  - `migration-schema.sql` — all tables, RLS, functions, triggers
  - `storage-setup.sql` — 4 storage buckets + policies
  - `deploy-functions.sh` — deploys all 13 edge functions

---

## Step 1 — Create the new Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. **Region:** `Southeast Asia (Singapore) — ap-southeast-1` (closest to Malaysia)
3. Set a strong DB password — **save it**
4. Wait ~2 min for provisioning
5. From **Project Settings → API**, save:
   - Project URL (e.g. `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key
6. From **Project Settings → Database**, save the connection string

---

## Step 2 — Apply the schema

1. In the new project → **SQL Editor → New query**
2. Paste the entire contents of **`migration-schema.sql`**
3. Click **Run**. Expect 1–3 seconds. No errors should appear.
4. Open a new query, paste **`storage-setup.sql`**, run it.

✅ At this point, you have all 35+ tables, 20+ functions, RLS policies, the `app_role` enum, the `handle_new_user` trigger, and 4 storage buckets ready.

---

## Step 3 — (Optional) Migrate existing user data

You chose between:

- **(A) Fresh start** — skip this section. Users will re-register on the new backend.
- **(B) Full data migration** — see below.

### B1. Export data from old (Lovable Cloud) DB

You need the Lovable Cloud DB connection string. Get it from Lovable: **Cloud → Database → Connection string**.

```bash
pg_dump \
  --data-only \
  --no-owner \
  --no-acl \
  --schema=public \
  --exclude-table=schema_migrations \
  "postgresql://postgres:[OLD_PASSWORD]@db.tdjxnlhewdrajrffdsnh.supabase.co:5432/postgres" \
  > old-data.sql
```

### B2. Restore into new DB

```bash
psql "postgresql://postgres:[NEW_PASSWORD]@db.[NEW_REF].supabase.co:5432/postgres" \
  < old-data.sql
```

### B3. Migrate auth.users

`auth.users` rows cannot be dumped via `pg_dump` (different schema, password hashes, etc.). Two options:

1. **Supabase support** — open a ticket at [supabase.com/dashboard/support](https://supabase.com/dashboard/support) requesting an `auth` schema migration from old project to new. Free for paid plans.
2. **Admin API** — write a script using the `service_role` key + the Admin API to recreate users one by one. They will need to reset passwords.

> Google OAuth users will re-link automatically on next sign-in (matched by email).

---

## Step 4 — Configure Auth in the new project

In the new Supabase dashboard:

### 4a. Email provider
- **Authentication → Providers → Email** → enable
- Confirm email: **on** (recommended) or **off** for fast testing
- Enable **Password HIBP check** (Authentication → Providers → Email)

### 4b. Google OAuth
- **Authentication → Providers → Google** → enable
- Paste your existing Google **Client ID** and **Client Secret** (the Web application credentials — same ones used by Lovable Cloud work fine)
- Copy the **Callback URL** shown by Supabase
- Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your OAuth client → **Authorized redirect URIs** → add the new Supabase callback URL alongside the existing Lovable one (don't remove the old one until cutover is verified)

### 4c. Redirect URLs
- **Authentication → URL Configuration**
- **Site URL:** `https://successmuslim.app`
- **Redirect URLs (allow list):**
  - `https://successmuslim.app/**`
  - `https://www.successmuslim.app/**`
  - `https://success-muslim.lovable.app/**`
  - `http://localhost:8080/**`
  - Capacitor: `app.lovable.b9a116fef80b4255b0618b5d84d41884://**`

---

## Step 5 — Deploy the edge functions

From your local machine, in the project root:

```bash
# 1. Login (one time)
supabase login

# 2. Link to NEW project
supabase link --project-ref [NEW_PROJECT_REF]

# 3. Deploy all 13 functions
bash /mnt/documents/supabase-migration/deploy-functions.sh
```

Then in **Supabase Dashboard → Edge Functions → Manage Secrets**, add (only if you still want Lovable AI features):
- `LOVABLE_API_KEY` — get from Lovable workspace settings, or remove the AI features

The 3 standard secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are auto-injected by Supabase — you don't add these manually.

---

## Step 6 — Cut the Lovable project over to the new backend

1. In Lovable, go to **Connectors → Lovable Cloud → Disable Cloud**
   ⚠️ This is irreversible for this project.
2. Then **Connectors → Supabase → Connect** (the standard Supabase integration)
3. Paste the **new project URL** and **anon key**
4. Lovable will automatically regenerate:
   - `src/integrations/supabase/client.ts`
   - `src/integrations/supabase/types.ts`
   - `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

No code changes needed — every API call already goes through `import { supabase } from "@/integrations/supabase/client"`.

---

## Step 7 — Verify

On the live preview, test:

- [ ] **Signup** — new email/password
- [ ] **Login** — with new account
- [ ] **Google OAuth** — sign in with Google
- [ ] **Profile auto-create** — check `profiles` table has new row
- [ ] **Salah log** — log a prayer, see it persist
- [ ] **Quran reader** — open Surah, change settings
- [ ] **Family** — create a group, get invite code
- [ ] **Storage** — upload an avatar
- [ ] **Admin** — assign yourself the `admin` role manually:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('YOUR_NEW_USER_UUID', 'admin');
   ```
   Then visit `/admin` and confirm dashboard loads.
- [ ] **Edge functions** — every page that uses `supabase.functions.invoke('api-*')` should work

---

## Rollback plan

You **cannot** re-enable Lovable Cloud once disabled. However:

- Until you click "Disable Cloud", everything still works on the old backend
- Test the new project end-to-end **before** disabling
- Keep both projects running in parallel for a day if possible

---

## Files reference

| File | Purpose |
|------|---------|
| `migration-schema.sql` | Schema, RLS, functions, triggers (apply first) |
| `storage-setup.sql` | 4 storage buckets + policies (apply second) |
| `deploy-functions.sh` | Deploys all 13 edge functions |
| `docs/SUPABASE_MIGRATION.md` | This guide |

---

## Troubleshooting

**"function has_role does not exist"**
→ You ran `storage-setup.sql` before `migration-schema.sql`. Run schema first.

**"permission denied for schema auth"**
→ The `handle_new_user` trigger needs `SECURITY DEFINER`. The migration file already does this.

**Google OAuth fails after switch**
→ Add the new Supabase callback URL to your Google Cloud OAuth client's authorized redirects.

**Edge function 401 on public pages**
→ Already handled in `api-misc` (public CMS reads bypass auth). Other functions require login.

**Existing user can't log in (option B migration)**
→ Auth.users wasn't migrated correctly. Use Supabase support or trigger a password reset.
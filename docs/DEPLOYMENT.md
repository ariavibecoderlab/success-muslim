# Success Muslim — Deployment Guide

How to take Success Muslim from this repo to a live site on **Cloudflare
Pages**, with the backend on **Supabase**.

---

## The architecture (read this first)

Success Muslim has two halves that deploy to two different places:

```
  ┌─────────────────────────┐         ┌──────────────────────────────┐
  │  Cloudflare Pages       │  HTTPS  │  Supabase                    │
  │  ─────────────────────  │ ──────▶ │  ──────────────────────────  │
  │  React / Vite SPA       │         │  Postgres database (+ RLS)   │
  │  (the frontend)         │         │  14 edge functions           │
  │  your-domain.com        │         │  Auth, Storage               │
  └─────────────────────────┘         └──────────────────────────────┘
```

- **Cloudflare hosts the frontend only.** It serves the static Vite build.
- **The backend stays on Supabase.** The database and the `api-*` edge
  functions are Supabase-native and cannot run on Cloudflare. This is the
  normal, recommended setup — the Cloudflare-served app just calls Supabase
  over HTTPS.

So "deploying to Cloudflare" = **Part B** below. But the app is useless
without **Part A** (the backend), so do Part A first.

---

## Part A — Supabase backend (do this first)

### A1. Create the project

1. Go to <https://supabase.com/dashboard> → **New project**.
2. Pick your organization, name it `success-muslim`, choose a region close
   to your users (e.g. `ap-southeast-1` Singapore for Malaysia), set a
   strong database password and save it.
3. Wait ~2 minutes for it to provision.

> **Cost note:** an organization gets one free project. If your org already
> has a free project in use, an additional project is **$10/month**. Check
> the price shown in the dashboard before confirming.

### A2. Apply the database migrations

The repo has ~40 migration files in `supabase/migrations/` (including the
new `20260515000000_ai_and_wearables.sql`). Apply them all, in filename
order, with the Supabase CLI:

```bash
npm install -g supabase            # if you don't have the CLI
supabase login
supabase link --project-ref <your-project-ref>
supabase db push                   # applies every migration in order
```

If you prefer the dashboard: open **SQL Editor**, paste each migration file
in chronological order, and run them one by one.

### A3. Deploy the edge functions

There are 14 functions in `supabase/functions/`:
`api-ai`, `api-wearables`, `api-health`, `api-salah`, `api-quran`,
`api-dhikr`, `api-family`, `api-profile`, `api-sunnah`, `api-wealth`,
`api-misc`, `api-checkin`, `api-productivity`, `jakim-proxy`.

```bash
supabase functions deploy            # deploys all of them at once
# or one at a time:
supabase functions deploy api-ai
```

### A4. Set the edge function secrets

The AI and wearable functions need API keys. They degrade gracefully if a
key is missing (the UI shows "not configured"), but for full functionality:

```bash
# Anthropic Claude — powers the AI Coach (api-ai)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
# optional model override:
supabase secrets set ANTHROPIC_MODEL=claude-sonnet-4-6

# Strava — powers wearable sync (api-wearables)
supabase secrets set STRAVA_CLIENT_ID=...
supabase secrets set STRAVA_CLIENT_SECRET=...
supabase secrets set STRAVA_REDIRECT_URI=https://your-domain.com/wearables/callback
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically —
you don't set those.

> Get a Strava API client at <https://www.strava.com/settings/api>.
> Get an Anthropic key at <https://console.anthropic.com>.

### A5. Grab your project keys

In **Project Settings → API**, copy:
- **Project URL** → `https://<ref>.supabase.co`
- **Project ref** → the `<ref>` subdomain
- **anon / publishable key**

You'll paste these into Cloudflare in Part B.

### A6. Allow your domain in Supabase Auth

**Authentication → URL Configuration**:
- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: add `https://your-domain.com/**` (and
  `https://success-muslim.pages.dev/**` if you use the Cloudflare URL too).

If you use Google sign-in, also configure the Google provider here.

---

## Part B — Cloudflare Pages (the frontend)

Two ways to deploy. **Option 1 (Git)** is best for ongoing updates;
**Option 2 (CLI)** is fastest for a one-off.

### Option 1 — Connect the Git repo (recommended)

1. Push this repo to GitHub/GitLab.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Pick the repo. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Environment variables** (add under both *Production* and *Preview*):

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_PROJECT_ID` | your project ref |
   | `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | your anon/publishable key |
   | `SUPABASE_URL` | same as `VITE_SUPABASE_URL` |
   | `SUPABASE_PUBLISHABLE_KEY` | same as the publishable key |

5. **Save and Deploy.** Every `git push` now triggers a new build.

### Option 2 — Deploy from the CLI

```bash
# one-time: create .env from the template and fill in your keys
cp .env.example .env        # then edit .env

# build + deploy
npm install
npm run deploy              # = vite build + wrangler pages deploy dist
```

`wrangler` will prompt you to log in to Cloudflare the first time. The
`wrangler.toml` in the repo root already points Pages at the `dist/`
output. SPA routing is handled by `public/_redirects`.

For CLI builds, the `VITE_*` vars must be present in your shell or `.env`
at build time (Vite inlines them into the bundle).

### B1. First deploy check

Visit the `*.pages.dev` URL Cloudflare gives you. You should see the
landing page. Sign up — if auth works and the dashboard loads, the
frontend ↔ Supabase link is good.

---

## Part C — Custom domain

Your domain is currently registered elsewhere. To use it on Cloudflare:

1. Cloudflare dashboard → **Add a site** → enter your domain → pick the
   Free plan. Cloudflare gives you **two nameservers**.
2. At your current registrar, replace the nameservers with Cloudflare's.
   Propagation takes anywhere from minutes to a few hours.
3. Once the domain is active in Cloudflare: **Workers & Pages → your
   `success-muslim` project → Custom domains → Set up a custom domain** →
   enter `your-domain.com` (and `www` if you want). Cloudflare creates the
   DNS records and SSL certificate automatically.
4. Go back to **Part A6** and make sure the live domain is in Supabase's
   Site URL + Redirect URLs, and **A4** that `STRAVA_REDIRECT_URI` uses it.

---

## Part D — Mobile apps (Capacitor)

Cloudflare hosts the web app; the iOS/Android apps are built separately
and point at the same Supabase backend.

```bash
npm install            # picks up the new capacitor-health plugin
npm run build
npx cap sync
npx cap open ios       # build/submit in Xcode
npx cap open android   # build/submit in Android Studio
```

Before building the native apps, add the HealthKit / Health Connect usage
strings — see `docs/AI_AND_WEARABLES_ROADMAP.md` §3.

---

## Deployment checklist

- [ ] Supabase project created
- [ ] `supabase db push` — all migrations applied
- [ ] `supabase functions deploy` — all 14 functions live
- [ ] Secrets set: `ANTHROPIC_API_KEY`, `STRAVA_*`
- [ ] Cloudflare Pages project created, env vars set
- [ ] First deploy succeeds, `*.pages.dev` loads
- [ ] Sign-up / login works against Supabase
- [ ] Custom domain added, nameservers switched, SSL active
- [ ] Supabase Auth Site URL + Redirect URLs include the live domain
- [ ] `STRAVA_REDIRECT_URI` updated to the live domain
- [ ] (optional) Native apps synced and submitted

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Blank page / 404 on refresh of a sub-route | `_redirects` missing from `dist/` — it's in `public/`, Vite copies it; confirm the build output. |
| "AI is not configured" in the app | `ANTHROPIC_API_KEY` not set on Supabase (Part A4). |
| "Strava is not set up" | `STRAVA_*` secrets not set, or `STRAVA_REDIRECT_URI` mismatch. |
| Login redirects fail / "redirect not allowed" | Domain not in Supabase Auth Redirect URLs (Part A6). |
| API calls 401 / CORS errors | Wrong `VITE_SUPABASE_*` env vars in Cloudflare, or functions not deployed. |
| Build fails on Cloudflare | Node version — set `NODE_VERSION = 20` in Pages env vars. |



# Edge Functions as Standalone API Layer

## What You Want

Frontend stops calling the database directly. Instead, all data operations go through Edge Functions, which act as a REST API layer. The frontend only calls `supabase.functions.invoke()` or fetches edge function URLs.

```text
Frontend ──(invoke)──▶ Edge Functions (API Layer) ──(service_role)──▶ Postgres DB
Frontend ──(direct)──▶ Supabase Auth ONLY (login/signup/session)
```

## Scope Assessment

- **30 files** with 645 direct `supabase.from()` calls need migration
- **612-line `db-sync.ts`** is the main sync hub — becomes the biggest rewrite
- **20+ RPC functions** already exist (admin stats, family leaderboard, etc.)
- **1 edge function** exists today (`jakim-proxy`)

This is a large migration. Recommended approach: **batch by module** across multiple sprints.

## Architecture

Each edge function becomes a REST-style API endpoint handling one module's CRUD:

```text
supabase/functions/
├── jakim-proxy/        (existing - no change)
├── api-salah/          POST/GET/DELETE salah logs
├── api-quran/          reading logs, bookmarks, memorization, prefs
├── api-dhikr/          dhikr sessions CRUD
├── api-health/         BMI, weight, hydration, sleep, IF, steps, fasting
├── api-productivity/   tasks, habits, habit-log, life areas
├── api-sunnah/         sunnah log
├── api-qada/           qada solat + ramadhan qada + fidyah
├── api-family/         families, members, feed, reactions, announcements
├── api-profile/        profile CRUD
├── api-wealth/         budget, savings, sadaqah, transactions
├── api-checkin/        daily check-ins
├── api-admin/          admin stats (wraps existing RPCs)
├── api-blog/           blog posts
├── api-cms/            page overrides, dakwah posters
└── api-activity/       user activity logging
```

Each function:
1. Validates JWT via `getClaims()` to get `user_id`
2. Uses `createClient` with `SERVICE_ROLE_KEY` to bypass RLS
3. Scopes all queries to the authenticated `user_id` in code
4. Returns JSON responses

## Example Pattern

**Edge Function (`api-salah/index.ts`):**
```typescript
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Auth
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

  const url = new URL(req.url);

  if (req.method === "GET") {
    const date = url.searchParams.get("date");
    const { data } = await supabase.from("salah_logs")
      .select("*").eq("user_id", user.id).eq("date", date);
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (req.method === "POST") {
    const body = await req.json();
    // validate, then upsert scoped to user.id
  }
});
```

**Frontend change (`useSalahQuery.ts`):**
```typescript
// BEFORE:
const { data } = await supabase.from('salah_logs').select('*').eq('user_id', user.id);

// AFTER:
const { data } = await supabase.functions.invoke('api-salah', {
  body: null,
  method: 'GET',
  // or use fetch directly:
});
// Or simpler with a wrapper:
const data = await api('/api-salah?date=2026-04-16');
```

## Frontend Changes

1. **Create `src/lib/api-client.ts`** — thin wrapper around `supabase.functions.invoke()` that handles auth token and error formatting
2. **Rewrite `src/lib/db-sync.ts`** (612 lines) — replace all `supabase.from()` calls with API calls
3. **Rewrite 30 hook/page files** — same pattern: replace `supabase.from()` with API calls
4. **Keep `supabase.auth.*`** — login/signup/session stays direct

## Phased Rollout

| Phase | Modules | Edge Functions | Files Changed |
|-------|---------|---------------|---------------|
| 1 | Salah, Dhikr, Sunnah, Fasting | 4 | ~8 |
| 2 | Quran (reading, bookmarks, memorization, prefs) | 1 | ~6 |
| 3 | Health (BMI, weight, hydration, sleep, IF, steps) | 1 | ~8 |
| 4 | Productivity, Checkin, Profile | 3 | ~6 |
| 5 | Family, Wealth, Admin, Blog, CMS | 5 | ~8 |

**Phase 1 first** — covers the most-used modules and establishes the pattern. Each subsequent phase is mechanical.

## What Stays Direct

- `supabase.auth.*` — login, signup, session, password reset
- `supabase.storage.*` — avatar uploads, blog images, CMS uploads
- Existing RPC functions called via `supabase.rpc()` can either stay or move into edge functions

## Trade-offs

**Pros:** Clean API layer, frontend never touches DB, easier to add rate limiting/validation/logging, portable pattern
**Cons:** Added latency (~50-200ms per call), 16 edge functions to maintain, cold starts

Shall I start with Phase 1 (Salah + Dhikr + Sunnah + Fasting)?


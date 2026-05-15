-- ============================================================
-- Success Muslim — AI Coach + Wearable Integration
-- Migration: 2026-05-15
-- Adds: AI insights/conversations, wearable connections + activities
-- ============================================================

-- ── AI INSIGHTS ─────────────────────────────────────────────
-- Stores generated coaching insights, goal/habit recommendations,
-- and activity auto-analysis. One row per generated insight.
create table if not exists public.ai_insights (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  kind          text not null check (kind in ('coaching', 'recommendation', 'analysis')),
  period        text not null default 'daily' check (period in ('daily', 'weekly', 'monthly')),
  title         text not null,
  body          text not null,
  -- structured payload: { highlights:[], actions:[], metrics:{}, trend:'' }
  data          jsonb not null default '{}'::jsonb,
  -- snapshot of the inputs the model saw, for transparency / debugging
  source_snapshot jsonb not null default '{}'::jsonb,
  model         text not null default 'claude',
  for_date      date not null default current_date,
  seen_at       timestamptz,
  dismissed     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_ai_insights_user_date
  on public.ai_insights (user_id, for_date desc);
create index if not exists idx_ai_insights_user_kind
  on public.ai_insights (user_id, kind, created_at desc);

-- One coaching insight per user per date+period (idempotent generation)
create unique index if not exists uq_ai_insights_user_period_date
  on public.ai_insights (user_id, kind, period, for_date)
  where kind = 'coaching';

alter table public.ai_insights enable row level security;

drop policy if exists "ai_insights_select_own" on public.ai_insights;
create policy "ai_insights_select_own" on public.ai_insights
  for select using (auth.uid() = user_id);
drop policy if exists "ai_insights_modify_own" on public.ai_insights;
create policy "ai_insights_modify_own" on public.ai_insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ── AI CONVERSATIONS (Deen companion chat) ──────────────────
create table if not exists public.ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'New conversation',
  topic       text not null default 'deen' check (topic in ('deen', 'health', 'productivity', 'general')),
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_ai_conversations_user
  on public.ai_conversations (user_id, updated_at desc);

create table if not exists public.ai_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  -- citations / references the assistant used (Quran ayah, hadith ref, etc.)
  citations       jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_ai_messages_conversation
  on public.ai_messages (conversation_id, created_at);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

drop policy if exists "ai_conversations_own" on public.ai_conversations;
create policy "ai_conversations_own" on public.ai_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "ai_messages_own" on public.ai_messages;
create policy "ai_messages_own" on public.ai_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ── WEARABLE CONNECTIONS ────────────────────────────────────
-- One row per (user, provider). Tokens for OAuth providers
-- (Strava/Garmin/Fitbit) are stored server-side only and never
-- exposed to the client. HealthKit / Health Connect are
-- on-device and store no tokens.
create table if not exists public.wearable_connections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  provider        text not null check (provider in (
                    'apple_health', 'health_connect', 'strava', 'garmin', 'fitbit'
                  )),
  status          text not null default 'connected' check (status in (
                    'connected', 'disconnected', 'error', 'expired'
                  )),
  -- OAuth secrets (null for on-device providers). Protected by RLS +
  -- only ever written/read by the api-wearables edge function (service role).
  access_token    text,
  refresh_token   text,
  token_expires_at timestamptz,
  scopes          text[],
  external_user_id text,
  -- which metrics this connection is allowed to sync
  enabled_metrics text[] not null default array['steps','distance','calories','workouts']::text[],
  last_synced_at  timestamptz,
  last_error      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists idx_wearable_connections_user
  on public.wearable_connections (user_id);

alter table public.wearable_connections enable row level security;

-- Client may see/manage its own connections, but token columns are
-- additionally shielded by the column-level view below.
drop policy if exists "wearable_connections_own" on public.wearable_connections;
create policy "wearable_connections_own" on public.wearable_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Safe view: everything except the secret token columns.
-- security_invoker = true makes the view run with the querying user's
-- permissions, so the RLS policy on wearable_connections is enforced
-- (each user sees only their own rows).
create or replace view public.wearable_connections_safe
  with (security_invoker = true) as
  select id, user_id, provider, status, scopes, external_user_id,
         enabled_metrics, last_synced_at, last_error, created_at, updated_at
  from public.wearable_connections;


-- ── WEARABLE ACTIVITIES ─────────────────────────────────────
-- Normalised activity/workout records pulled from any provider.
-- Steps already flow into steps_logs; this table keeps the richer
-- workout-level data (runs, rides, heart rate, etc.) for AI analysis.
create table if not exists public.wearable_activities (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  provider        text not null,
  external_id     text not null,
  activity_type   text not null,            -- run, walk, ride, swim, workout...
  started_at      timestamptz not null,
  date            date not null,
  duration_sec    integer not null default 0,
  distance_meters numeric not null default 0,
  calories        numeric not null default 0,
  steps           integer,
  avg_heart_rate  integer,
  max_heart_rate  integer,
  elevation_gain  numeric,
  raw             jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  unique (user_id, provider, external_id)
);

create index if not exists idx_wearable_activities_user_date
  on public.wearable_activities (user_id, date desc);

alter table public.wearable_activities enable row level security;

drop policy if exists "wearable_activities_own" on public.wearable_activities;
create policy "wearable_activities_own" on public.wearable_activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ── steps_logs: mark records that came from a wearable ──────
-- 'source' already exists on steps_logs; add a column to dedupe
-- wearable-synced days so manual + synced entries don't double-count.
alter table public.steps_logs
  add column if not exists external_id text;

create unique index if not exists uq_steps_logs_external
  on public.steps_logs (user_id, source, external_id)
  where external_id is not null;

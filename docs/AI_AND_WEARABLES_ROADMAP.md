# Success Muslim — AI Coach & Wearable Integration

> Added 2026-05-15. This document covers the AI coaching layer (powered by
> Anthropic Claude) and the wearable / phone-health sync system, plus the
> roadmap for finishing the remaining providers.

---

## 1. What shipped in this slice

### AI Coach (Claude-powered)

A new `api-ai` Supabase edge function gives the app four AI capabilities,
all grounded in the user's real activity data across the SPICE pillars:

| Capability | Where it surfaces | What it does |
|---|---|---|
| **Personalized coaching insights** | Dashboard card + AI Coach page | Daily/weekly narrative — trends, wins, and 2–3 concrete next actions. Strava-"Athlete Intelligence" style, but for ibadah + health together. |
| **Smart goal & habit recommendations** | AI Coach → Insights tab | Realistic, data-grounded goals and habit suggestions with difficulty + habit-stacking anchors. |
| **Activity auto-analysis** | AI Coach → Insights tab | Detects patterns, anomalies and correlations between physical activity/sleep and ibadah consistency. |
| **Deen Q&A companion** | AI Coach → Companion tab | Careful, grounded Islamic chat — Quran reflection, dua, motivation. Defers fiqh rulings to qualified scholars. |

**Design choices**
- The model never sees raw PII beyond display name + goals. It reasons over
  a compact 14–30 day **snapshot** of counts and dates built server-side.
- All insights are stored in `ai_insights` so they're cheap to re-display and
  can be dismissed. Coaching insights are idempotent per `(user, period, date)`.
- The system prompt enforces hard rules: no fatwa, no fabricated ayat/hadith,
  health guidance is general wellness only.
- Provider is swappable — `callClaude()` is the only Anthropic-specific code.
  Point `ANTHROPIC_MODEL` / the fetch at another provider to switch.

### Wearable & phone-health sync

A new `api-wearables` edge function plus an on-device `health-bridge`:

| Source | Path | Status |
|---|---|---|
| **Apple Health (HealthKit)** | On-device via `capacitor-health` → `ingest` endpoint | ✅ Working |
| **Google Health Connect** | On-device via `capacitor-health` → `ingest` endpoint | ✅ Working |
| **Strava** | Server-side OAuth + activity pull | ✅ Working (needs API keys) |
| **Garmin** | OAuth scaffolded | ⏳ Needs credentials + sync handler |
| **Fitbit** | OAuth scaffolded | ⏳ Needs credentials + sync handler |

Apple Watch, Wear OS, Samsung and Fitbit-via-Health-Connect devices all write
into HealthKit / Health Connect — so the two on-device paths already cover the
whole smart-watch ecosystem. Direct Garmin/Fitbit OAuth is additive coverage.

Synced data lands in two places: daily step totals roll into the existing
`steps_logs` table (deduped by `external_id`, so manual + synced never
double-count), and richer workouts land in the new `wearable_activities`
table, which the AI analysis reads.

---

## 2. Architecture

```
   React app (Capacitor)
   ├─ Dashboard ── AIInsightCard ───────────────┐
   ├─ /ai-coach ── AICoach (Insights | Companion)│   hooks: useAIInsights,
   ├─ Settings ─── WearableConnections           │          useAIChat
   └─ health-bridge (HealthKit / Health Connect) │   hooks: useHealthSync,
                                                 │          useWearables
            │ api-client (JWT)                   │
            ▼                                    ▼
   ┌─────────────────┐                ┌──────────────────────┐
   │  api-ai (Deno)  │                │ api-wearables (Deno) │
   │  → Anthropic    │                │  → Strava OAuth/API  │
   └────────┬────────┘                └──────────┬───────────┘
            │                                    │
            ▼                                    ▼
   ┌──────────────────────────────────────────────────────────┐
   │  Supabase Postgres (RLS on every table)                  │
   │  ai_insights · ai_conversations · ai_messages            │
   │  wearable_connections (+ _safe view) · wearable_activities│
   │  steps_logs (+ external_id)                              │
   └──────────────────────────────────────────────────────────┘
```

### New files

```
supabase/migrations/20260515000000_ai_and_wearables.sql
supabase/functions/api-ai/index.ts
supabase/functions/api-wearables/index.ts
src/lib/health-bridge.ts
src/hooks/useHealthSync.ts
src/hooks/useWearables.ts
src/hooks/useAIInsights.ts
src/hooks/useAIChat.ts
src/components/ai/AIInsightCard.tsx
src/components/ai/DeenCompanionChat.tsx
src/components/settings/WearableConnections.tsx
src/pages/AICoach.tsx
src/pages/WearableCallback.tsx
```

### Touched files
`src/App.tsx` (routes), `src/pages/Dashboard.tsx` (insight card),
`src/pages/Settings.tsx` (wearable section), `package.json`
(`capacitor-health`), plus a pre-existing type bug fixed in
`src/pages/QadaSolatTrack.tsx`.

---

## 3. Setup required before this works in production

### Supabase edge function secrets
```bash
# AI
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
# optional: supabase secrets set ANTHROPIC_MODEL=claude-sonnet-4-6

# Strava (https://www.strava.com/settings/api)
supabase secrets set STRAVA_CLIENT_ID=...
supabase secrets set STRAVA_CLIENT_SECRET=...
supabase secrets set STRAVA_REDIRECT_URI=https://app.successmuslim.com/wearables/callback
```
The app degrades gracefully if these are missing — the UI shows an
"AI not configured" / "Strava not set up" message instead of erroring.

### Deploy
```bash
supabase db push                       # apply the migration
supabase functions deploy api-ai
supabase functions deploy api-wearables
```

### Mobile native step (HealthKit / Health Connect)
```bash
npm install
npx cap sync
```
Then add usage strings:
- **iOS** — `ios/App/App/Info.plist`: `NSHealthShareUsageDescription`
  ("Success Muslim reads your steps and workouts to track your fitness and
  power AI coaching.")
- **Android** — `android/app/src/main/AndroidManifest.xml`: the Health
  Connect read permissions (`android.permission.health.READ_STEPS`,
  `READ_DISTANCE`, `READ_ACTIVE_CALORIES_BURNED`, `READ_HEART_RATE`,
  `READ_EXERCISE`) and the Health Connect intent-filter / privacy-policy
  activity per the `capacitor-health` README.

For Strava on native, register the `STRAVA_REDIRECT_URI` as an App Link /
Universal Link (or swap it for a custom-scheme deep link) so the in-app
browser hands the OAuth `code` back to `/wearables/callback`.

---

## 4. Roadmap — what's next

**Phase 2 — close the wearable set**
- Garmin: Health API OAuth2 + activity webhook → reuse `storeActivities`.
- Fitbit: OAuth2 PKCE + `/activities` pull → reuse `storeActivities`.
- Background sync: schedule a daily `strava-sync` + a native background
  fetch that calls `health-bridge` → `ingest`.

**Phase 3 — deepen the AI**
- Stream chat responses (SSE) instead of awaiting the full reply.
- Wire recommendation "goals/habits" cards to actually create rows in
  `habits` / `life_area_scores` on tap (one-tap accept).
- Push the daily coaching insight as a local notification each morning
  (the app already has `@capacitor/local-notifications`).
- Add a weekly scheduled job that pre-generates coaching insights so the
  dashboard card is instant.
- Family-level insights for the Family/Class module (group coaching).

**Phase 4 — quality & trust**
- Let users see the snapshot the AI used ("why did it say this?").
- Add a feedback thumbs-up/down on insights to tune prompts.
- Rate-limit per user on the AI endpoints; cache identical snapshots.

---

## 5. Privacy notes

- Wearable OAuth tokens live only in `wearable_connections` and are read
  exclusively by the edge function (service role). The client reads through
  `wearable_connections_safe`, a view that omits every token column.
- On-device HealthKit / Health Connect data is read on the device and pushed
  straight to the user's own rows — no third-party servers in the path.
- Every new table has RLS scoped to `auth.uid() = user_id`.
- The AI snapshot deliberately excludes free-text notes beyond what the user
  typed into a check-in; tighten further if needed for store review.

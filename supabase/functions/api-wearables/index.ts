// ============================================================
// api-wearables — wearable & phone health integration
// ------------------------------------------------------------
// On-device providers (apple_health, health_connect) are read on
// the device via Capacitor and pushed here through `ingest`.
// OAuth providers (strava, garmin, fitbit) are linked server-side
// so secrets never touch the client.
//
// Resources (via ?resource=...):
//   connections        GET  -> list the user's connections (no tokens)
//   ingest             POST -> push on-device health data (steps + workouts)
//   strava-authorize   GET  -> returns the Strava OAuth URL
//   strava-exchange    POST -> exchange OAuth code -> tokens, store connection
//   strava-sync        POST -> pull recent Strava activities
//   disconnect         POST -> remove a connection ({ provider })
//
// Requires env (for Strava): STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET,
//   STRAVA_REDIRECT_URI
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const STRAVA_CLIENT_ID = Deno.env.get("STRAVA_CLIENT_ID") ?? "";
const STRAVA_CLIENT_SECRET = Deno.env.get("STRAVA_CLIENT_SECRET") ?? "";
const STRAVA_REDIRECT_URI = Deno.env.get("STRAVA_REDIRECT_URI") ?? "";

async function getUser(req: Request): Promise<string | null> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user?.id ?? null;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
const err = (msg: string, status = 400) => json({ error: msg }, status);

// ── Normalised activity shape ───────────────────────────────
interface NormalActivity {
  provider: string;
  external_id: string;
  activity_type: string;
  started_at: string;        // ISO
  duration_sec: number;
  distance_meters: number;
  calories: number;
  steps?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  elevation_gain?: number;
  raw?: Record<string, unknown>;
}

async function storeActivities(userId: string, acts: NormalActivity[]) {
  if (!acts.length) return 0;
  const rows = acts.map((a) => ({
    user_id: userId,
    provider: a.provider,
    external_id: a.external_id,
    activity_type: a.activity_type,
    started_at: a.started_at,
    date: a.started_at.split("T")[0],
    duration_sec: Math.round(a.duration_sec ?? 0),
    distance_meters: a.distance_meters ?? 0,
    calories: a.calories ?? 0,
    steps: a.steps ?? null,
    avg_heart_rate: a.avg_heart_rate ?? null,
    max_heart_rate: a.max_heart_rate ?? null,
    elevation_gain: a.elevation_gain ?? null,
    raw: a.raw ?? {},
  }));
  const { error } = await supabase
    .from("wearable_activities")
    .upsert(rows, { onConflict: "user_id,provider,external_id" });
  if (error) throw error;
  return rows.length;
}

// Roll daily steps from a provider into steps_logs (deduped by external_id).
async function storeDailySteps(
  userId: string,
  provider: string,
  daily: { date: string; steps: number; distanceMeters?: number; calories?: number; activityType?: string }[],
) {
  if (!daily.length) return 0;
  const rows = daily
    .filter((d) => d.steps > 0)
    .map((d) => ({
      user_id: userId,
      date: d.date,
      steps: d.steps,
      distance_meters: d.distanceMeters ?? 0,
      calories_burned: d.calories ?? 0,
      activity_type: d.activityType ?? "walking",
      source: provider,
      external_id: `${provider}:${d.date}`,
      logged_at: new Date().toISOString(),
    }));
  if (!rows.length) return 0;
  const { error } = await supabase
    .from("steps_logs")
    .upsert(rows, { onConflict: "user_id,source,external_id" });
  if (error) throw error;
  return rows.length;
}

async function touchConnection(userId: string, provider: string, patch: Record<string, unknown>) {
  await supabase.from("wearable_connections").upsert({
    user_id: userId,
    provider,
    updated_at: new Date().toISOString(),
    ...patch,
  }, { onConflict: "user_id,provider" });
}

// ── Strava ──────────────────────────────────────────────────
function stravaAuthUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: STRAVA_REDIRECT_URI,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
    state,
  });
  return `https://www.strava.com/oauth/authorize?${p.toString()}`;
}

async function stravaExchange(userId: string, code: string) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Strava token exchange failed: ${await res.text()}`);
  const t = await res.json();
  await touchConnection(userId, "strava", {
    status: "connected",
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    token_expires_at: new Date(t.expires_at * 1000).toISOString(),
    scopes: ["read", "activity:read_all"],
    external_user_id: String(t.athlete?.id ?? ""),
    last_error: null,
  });
  return { connected: true, athlete: t.athlete?.id ?? null };
}

async function stravaAccessToken(userId: string): Promise<string> {
  const { data: conn } = await supabase
    .from("wearable_connections")
    .select("*").eq("user_id", userId).eq("provider", "strava").maybeSingle();
  if (!conn) throw new Error("Strava not connected");

  const expired = !conn.token_expires_at ||
    new Date(conn.token_expires_at).getTime() < Date.now() + 60_000;
  if (!expired) return conn.access_token;

  // Refresh
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: conn.refresh_token,
    }),
  });
  if (!res.ok) {
    await touchConnection(userId, "strava", { status: "expired", last_error: "refresh failed" });
    throw new Error("Strava token refresh failed");
  }
  const t = await res.json();
  await touchConnection(userId, "strava", {
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    token_expires_at: new Date(t.expires_at * 1000).toISOString(),
    status: "connected",
  });
  return t.access_token;
}

async function stravaSync(userId: string) {
  const token = await stravaAccessToken(userId);
  // Activities from the last 30 days
  const after = Math.floor((Date.now() - 30 * 86400_000) / 1000);
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Strava activities fetch failed: ${await res.text()}`);
  const list = await res.json() as Array<Record<string, unknown>>;

  const activities: NormalActivity[] = list.map((a) => ({
    provider: "strava",
    external_id: String(a.id),
    activity_type: String(a.sport_type ?? a.type ?? "workout").toLowerCase(),
    started_at: String(a.start_date),
    duration_sec: Number(a.moving_time ?? 0),
    distance_meters: Number(a.distance ?? 0),
    calories: Number(a.calories ?? a.kilojoules ?? 0),
    avg_heart_rate: a.average_heartrate ? Math.round(Number(a.average_heartrate)) : undefined,
    max_heart_rate: a.max_heartrate ? Math.round(Number(a.max_heartrate)) : undefined,
    elevation_gain: a.total_elevation_gain ? Number(a.total_elevation_gain) : undefined,
    raw: { name: a.name, type: a.type },
  }));

  const stored = await storeActivities(userId, activities);

  // Aggregate walking/running distance into daily steps_logs estimate
  const byDate = new Map<string, { distance: number; calories: number }>();
  for (const a of activities) {
    const d = a.started_at.split("T")[0];
    const cur = byDate.get(d) ?? { distance: 0, calories: 0 };
    cur.distance += a.distance_meters;
    cur.calories += a.calories;
    byDate.set(d, cur);
  }
  // Note: Strava doesn't give raw step counts; we keep activities only,
  // step counts come from HealthKit / Health Connect ingest.

  await touchConnection(userId, "strava", {
    last_synced_at: new Date().toISOString(),
    status: "connected",
    last_error: null,
  });
  return { provider: "strava", activitiesStored: stored };
}

// ── HTTP handler ────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const userId = await getUser(req);
  if (!userId) return err("Unauthorized", 401);

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource") || "connections";
  const method = req.method;

  try {
    // ── list connections (token columns excluded via safe view) ──
    if (resource === "connections" && method === "GET") {
      const { data } = await supabase
        .from("wearable_connections_safe")
        .select("*").eq("user_id", userId);
      return json(data ?? []);
    }

    // ── on-device ingest (HealthKit / Health Connect) ──
    if (resource === "ingest" && method === "POST") {
      const body = await req.json();
      const provider: string = body.provider;
      if (!["apple_health", "health_connect"].includes(provider)) {
        return err("ingest only accepts apple_health or health_connect");
      }
      const dailySteps = Array.isArray(body.dailySteps) ? body.dailySteps : [];
      const workouts: NormalActivity[] = Array.isArray(body.workouts)
        ? body.workouts.map((w: Record<string, unknown>) => ({ ...w, provider }))
        : [];

      const stepRows = await storeDailySteps(userId, provider, dailySteps);
      const actRows = await storeActivities(userId, workouts);

      await touchConnection(userId, provider, {
        status: "connected",
        last_synced_at: new Date().toISOString(),
        last_error: null,
        enabled_metrics: body.enabledMetrics ?? ["steps", "distance", "calories", "workouts"],
      });
      return json({ provider, stepDaysStored: stepRows, workoutsStored: actRows });
    }

    // ── Strava: authorize ──
    if (resource === "strava-authorize" && method === "GET") {
      if (!STRAVA_CLIENT_ID || !STRAVA_REDIRECT_URI) {
        return err("Strava is not configured on the server", 503);
      }
      return json({ url: stravaAuthUrl(userId) });
    }

    // ── Strava: exchange code ──
    if (resource === "strava-exchange" && method === "POST") {
      if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
        return err("Strava is not configured on the server", 503);
      }
      const { code } = await req.json();
      if (!code) return err("code is required");
      const result = await stravaExchange(userId, code);
      // Immediately pull initial history
      const sync = await stravaSync(userId).catch(() => null);
      return json({ ...result, sync });
    }

    // ── Strava: sync ──
    if (resource === "strava-sync" && method === "POST") {
      return json(await stravaSync(userId));
    }

    // ── Garmin / Fitbit: scaffolded, not yet configured ──
    if ((resource === "garmin-authorize" || resource === "fitbit-authorize")) {
      return err(
        `${resource.split("-")[0]} integration is scaffolded but not yet configured. ` +
        `Add OAuth credentials and a sync handler to enable it.`,
        503,
      );
    }

    // ── disconnect ──
    if (resource === "disconnect" && method === "POST") {
      const { provider } = await req.json();
      if (!provider) return err("provider is required");
      await supabase.from("wearable_connections")
        .delete().eq("user_id", userId).eq("provider", provider);
      return json({ ok: true, provider });
    }

    return err(`Unknown resource/method: ${resource} ${method}`, 404);
  } catch (e) {
    console.error("[api-wearables]", e);
    return err(e instanceof Error ? e.message : "Internal error", 500);
  }
});

// ============================================================
// api-ai — Claude-powered coaching layer for Success Muslim
// ------------------------------------------------------------
// Resources (via ?resource=...):
//   insights         GET  -> recent stored insights feed
//                    POST -> generate a coaching insight (daily/weekly)
//   recommendations  POST -> smart goal & habit recommendations
//   analysis         POST -> activity auto-analysis (wearable + ibadah)
//   chat             POST -> Deen companion Q&A (grounded, careful)
//   conversations    GET  -> list chat conversations
//   messages         GET  -> messages for ?conversationId=
//
// Requires env: ANTHROPIC_API_KEY  (optional: ANTHROPIC_MODEL)
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// ── helpers ─────────────────────────────────────────────────
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

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// ── Anthropic call ──────────────────────────────────────────
interface ClaudeOpts {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  temperature?: number;
}

async function callClaude(opts: ClaudeOpts): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.4,
      system: opts.system,
      messages: opts.messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text}`);
  }
  const body = await res.json();
  return (body?.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n")
    .trim();
}

// Parse a JSON object out of the model's reply, tolerating ```json fences.
function extractJSON<T = Record<string, unknown>>(raw: string): T {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  return JSON.parse(s) as T;
}

// ── User data snapshot ──────────────────────────────────────
// Pulls a compact, model-friendly summary of the user's recent
// activity across the SPICE pillars. This is the single source
// of truth the coaching/analysis prompts reason over.
async function buildSnapshot(userId: string, days = 14) {
  const since = daysAgoISO(days);
  const [
    salah, quran, fasting, steps, sleep, hydration,
    habits, checkins, dhikr, activities, profile,
  ] = await Promise.all([
    supabase.from("salah_logs").select("date,prayer_name,status").eq("user_id", userId).gte("date", since),
    supabase.from("quran_reading_log").select("date,ayah_count,page_count").eq("user_id", userId).gte("date", since),
    supabase.from("fasting_log").select("date").eq("user_id", userId).gte("date", since),
    supabase.from("steps_logs").select("date,steps,distance_meters,calories_burned,activity_type,source").eq("user_id", userId).gte("date", since),
    supabase.from("sleep_log").select("date,duration,bedtime,wake_time").eq("user_id", userId).gte("date", since),
    supabase.from("hydration_log").select("date,cups,goal").eq("user_id", userId).gte("date", since),
    supabase.from("habit_log").select("date,habit_id").eq("user_id", userId).gte("date", since),
    supabase.from("daily_checkins").select("date,streak_day,points_earned").eq("user_id", userId).gte("date", since),
    supabase.from("dhikr_sessions").select("date,count,target,preset_id").eq("user_id", userId).gte("date", since),
    supabase.from("wearable_activities").select("date,activity_type,duration_sec,distance_meters,calories,avg_heart_rate").eq("user_id", userId).gte("date", since),
    supabase.from("profiles").select("display_name,focus_areas,consistency_level").eq("id", userId).maybeSingle(),
  ]);

  const arr = <T>(r: { data: T[] | null }) => r.data ?? [];
  return {
    rangeDays: days,
    since,
    profile: profile.data ?? null,
    salah: arr(salah),
    quran: arr(quran),
    fasting: arr(fasting),
    steps: arr(steps),
    sleep: arr(sleep),
    hydration: arr(hydration),
    habits: arr(habits),
    checkins: arr(checkins),
    dhikr: arr(dhikr),
    wearableActivities: arr(activities),
  };
}

// ── Shared system framing ───────────────────────────────────
const BASE_SYSTEM = `You are the AI coach inside "Success Muslim", a Muslim personal-development app built around SPICE mastery: Strong Eeman, Physical fitness (Fit for Life), Intelligence/Academic excellence, Character (Beautiful Akhlaq) and life skills, and 4-Language mastery.

Voice: warm, encouraging, concise, and respectful. You speak to a believer striving to succeed in both this world (dunya) and the hereafter (akhirah). Motivate through Islamic values — consistency (istiqamah), gratitude (shukr), and intention (niyyah) — without being preachy or guilt-tripping.

Hard rules:
- Never issue binding religious rulings (fatwa). For fiqh questions, give the mainstream understanding, note where scholars differ, and encourage asking a qualified local scholar.
- Never fabricate Quran ayat or hadith. Only reference them if you are confident; cite surah:ayah or the collection. If unsure, speak generally instead.
- Health guidance is general wellness only — not medical advice. For fasting + medical conditions, advise consulting a doctor.
- Be specific and data-grounded. Reference the user's actual numbers. No vague platitudes.`;

// ── INSIGHTS: coaching ──────────────────────────────────────
async function generateCoaching(userId: string, period: "daily" | "weekly") {
  const snapshot = await buildSnapshot(userId, period === "weekly" ? 28 : 10);
  const system = `${BASE_SYSTEM}

TASK: Produce a ${period} coaching insight. Be like Strava's athlete intelligence but for a Muslim's whole life — spot real trends across ibadah AND health, celebrate wins, and give 2-3 concrete next actions.

Respond with ONLY a JSON object, no prose around it:
{
  "title": "short punchy headline (max 8 words)",
  "body": "2-4 sentence narrative referencing real numbers and trends",
  "trend": "improving | steady | slipping",
  "highlights": ["specific win", "specific win"],
  "actions": [
    {"label": "concrete action (max 10 words)", "pillar": "eeman|health|character|knowledge|wealth", "why": "one short clause"}
  ],
  "metrics": {"key": "value"}
}`;
  const raw = await callClaude({
    system,
    messages: [{
      role: "user",
      content: `Here is my recent activity data (JSON). Generate my ${period} insight.\n\n${JSON.stringify(snapshot)}`,
    }],
    maxTokens: 1100,
  });
  const parsed = extractJSON<{
    title: string; body: string; trend: string;
    highlights: string[]; actions: unknown[]; metrics: Record<string, unknown>;
  }>(raw);

  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase.from("ai_insights").upsert({
    user_id: userId,
    kind: "coaching",
    period,
    title: parsed.title,
    body: parsed.body,
    data: {
      trend: parsed.trend,
      highlights: parsed.highlights ?? [],
      actions: parsed.actions ?? [],
      metrics: parsed.metrics ?? {},
    },
    source_snapshot: { rangeDays: snapshot.rangeDays, since: snapshot.since },
    model: ANTHROPIC_MODEL,
    for_date: today,
  }, { onConflict: "user_id,kind,period,for_date" }).select().single();
  if (error) throw error;
  return data;
}

// ── RECOMMENDATIONS: goals & habits ─────────────────────────
async function generateRecommendations(userId: string) {
  const snapshot = await buildSnapshot(userId, 30);
  const system = `${BASE_SYSTEM}

TASK: Recommend realistic goals and habits based on the user's last 30 days. Targets must be achievable stretch goals — grounded in what they already do, not aspirational fantasy. Prefer small consistent habits over big ones.

Respond with ONLY a JSON object:
{
  "summary": "1-2 sentence read on where they are",
  "goals": [
    {"title": "...", "pillar": "eeman|health|character|knowledge|wealth", "target": "measurable target", "rationale": "why this, why now", "difficulty": "easy|moderate|stretch"}
  ],
  "habits": [
    {"title": "...", "pillar": "...", "cadence": "daily|weekdays|3x-week", "anchor": "habit-stacking anchor e.g. 'after Subuh'"}
  ]
}`;
  const raw = await callClaude({
    system,
    messages: [{
      role: "user",
      content: `My last 30 days of data (JSON). Recommend goals & habits.\n\n${JSON.stringify(snapshot)}`,
    }],
    maxTokens: 1200,
  });
  const parsed = extractJSON(raw);
  const { data, error } = await supabase.from("ai_insights").insert({
    user_id: userId,
    kind: "recommendation",
    period: "monthly",
    title: "Your recommended goals & habits",
    body: (parsed as { summary?: string }).summary ?? "Personalised recommendations",
    data: parsed,
    source_snapshot: { rangeDays: 30, since: snapshot.since },
    model: ANTHROPIC_MODEL,
  }).select().single();
  if (error) throw error;
  return data;
}

// ── ANALYSIS: activity auto-analysis ────────────────────────
async function generateAnalysis(userId: string) {
  const snapshot = await buildSnapshot(userId, 21);
  const system = `${BASE_SYSTEM}

TASK: Auto-analyse the user's wearable + activity data over the last 21 days. Detect patterns, anomalies, and correlations between physical activity/sleep and ibadah consistency (e.g. "your Subuh-in-jemaah rate is higher on days you slept before 11pm"). Be a sharp analyst — only claim correlations the data actually supports.

Respond with ONLY a JSON object:
{
  "title": "headline finding (max 8 words)",
  "body": "2-4 sentences, the single most useful finding",
  "patterns": [{"finding": "...", "evidence": "the numbers behind it", "confidence": "high|medium|low"}],
  "anomalies": ["specific unusual day/value, or empty"],
  "correlations": [{"between": "X and Y", "direction": "positive|negative", "note": "..."}]
}`;
  const raw = await callClaude({
    system,
    messages: [{
      role: "user",
      content: `My last 21 days of data (JSON). Analyse it.\n\n${JSON.stringify(snapshot)}`,
    }],
    maxTokens: 1200,
  });
  const parsed = extractJSON<{ title?: string; body?: string }>(raw);
  const { data, error } = await supabase.from("ai_insights").insert({
    user_id: userId,
    kind: "analysis",
    period: "weekly",
    title: parsed.title ?? "Activity analysis",
    body: parsed.body ?? "",
    data: parsed,
    source_snapshot: { rangeDays: 21, since: snapshot.since },
    model: ANTHROPIC_MODEL,
  }).select().single();
  if (error) throw error;
  return data;
}

// ── CHAT: Deen companion ────────────────────────────────────
async function handleChat(userId: string, body: {
  conversationId?: string;
  message: string;
  topic?: string;
}) {
  if (!body.message?.trim()) throw new Error("message is required");

  // Resolve or create conversation
  let conversationId = body.conversationId;
  if (!conversationId) {
    const { data: conv, error } = await supabase.from("ai_conversations").insert({
      user_id: userId,
      topic: body.topic ?? "deen",
      title: body.message.slice(0, 60),
    }).select().single();
    if (error) throw error;
    conversationId = conv.id;
  }

  // Load history (last 20 messages)
  const { data: history } = await supabase
    .from("ai_messages")
    .select("role,content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  // Persist the user's message
  await supabase.from("ai_messages").insert({
    conversation_id: conversationId,
    user_id: userId,
    role: "user",
    content: body.message,
  });

  const system = `${BASE_SYSTEM}

TASK: You are a Deen companion in a chat. Answer the user's question thoughtfully and conversationally — Quran reflection, dua suggestions, motivation, general Islamic knowledge, and gentle accountability.

- Keep replies focused and not overlong (a few short paragraphs at most).
- When you reference an ayah or hadith, name the source inline (e.g. "Quran 2:286" or "narrated in Sahih al-Bukhari").
- For fiqh/ruling questions: explain the mainstream view, note differences, and recommend a qualified scholar.
- End with a warm, actionable nudge when appropriate.`;

  const messages = [
    ...(history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: body.message },
  ];

  const reply = await callClaude({ system, messages, maxTokens: 1024, temperature: 0.6 });

  const { data: saved, error: saveErr } = await supabase.from("ai_messages").insert({
    conversation_id: conversationId,
    user_id: userId,
    role: "assistant",
    content: reply,
  }).select().single();
  if (saveErr) throw saveErr;

  await supabase.from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { conversationId, message: saved };
}

// ── HTTP handler ────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const userId = await getUser(req);
  if (!userId) return err("Unauthorized", 401);

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource") || "insights";
  const method = req.method;

  try {
    // ── insights ───────────────────────────────
    if (resource === "insights") {
      if (method === "GET") {
        const kind = url.searchParams.get("kind");
        let q = supabase.from("ai_insights").select("*")
          .eq("user_id", userId).eq("dismissed", false)
          .order("created_at", { ascending: false }).limit(20);
        if (kind) q = q.eq("kind", kind);
        const { data } = await q;
        return json(data ?? []);
      }
      if (method === "POST") {
        const b = await req.json().catch(() => ({}));
        const period = b.period === "weekly" ? "weekly" : "daily";
        return json(await generateCoaching(userId, period));
      }
    }

    // ── recommendations ────────────────────────
    if (resource === "recommendations" && method === "POST") {
      return json(await generateRecommendations(userId));
    }

    // ── analysis ───────────────────────────────
    if (resource === "analysis" && method === "POST") {
      return json(await generateAnalysis(userId));
    }

    // ── chat ───────────────────────────────────
    if (resource === "chat" && method === "POST") {
      const b = await req.json();
      return json(await handleChat(userId, b));
    }

    // ── conversations ──────────────────────────
    if (resource === "conversations" && method === "GET") {
      const { data } = await supabase.from("ai_conversations")
        .select("*").eq("user_id", userId).eq("archived", false)
        .order("updated_at", { ascending: false }).limit(50);
      return json(data ?? []);
    }

    // ── messages ───────────────────────────────
    if (resource === "messages" && method === "GET") {
      const conversationId = url.searchParams.get("conversationId");
      if (!conversationId) return err("conversationId required");
      const { data } = await supabase.from("ai_messages")
        .select("*").eq("conversation_id", conversationId)
        .eq("user_id", userId).order("created_at", { ascending: true });
      return json(data ?? []);
    }

    // ── dismiss an insight ─────────────────────
    if (resource === "dismiss" && method === "POST") {
      const { id } = await req.json();
      await supabase.from("ai_insights")
        .update({ dismissed: true }).eq("id", id).eq("user_id", userId);
      return json({ ok: true });
    }

    return err(`Unknown resource/method: ${resource} ${method}`, 404);
  } catch (e) {
    console.error("[api-ai]", e);
    return err(e instanceof Error ? e.message : "Internal error", 500);
  }
});

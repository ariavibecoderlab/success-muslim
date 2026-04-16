import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const userId = await getUser(req);
  if (!userId) return err("Unauthorized", 401);

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource") || "bmi";
  const method = req.method;

  try {
    // ── BMI ────────────────────────────────
    if (resource === "bmi") {
      if (method === "GET") {
        const { data } = await supabase.from("health_bmi").select("*").eq("user_id", userId).maybeSingle();
        return json(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const { data } = await supabase.from("health_bmi").upsert({
          user_id: userId,
          weight: body.weight, height: body.height, age: body.age,
          gender: body.gender, activity_level: body.activityLevel,
          bmi: body.bmi, tdee: body.tdee,
        }, { onConflict: "user_id" }).select().single();
        return json(data);
      }
    }

    // ── Weight ─────────────────────────────
    if (resource === "weight") {
      if (method === "GET") {
        const { data } = await supabase.from("weight_log").select("*").eq("user_id", userId).order("date");
        return json(data || []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { data } = await supabase.from("weight_log").upsert(
          { user_id: userId, date: body.date, weight: body.weight },
          { onConflict: "user_id,date" }
        ).select().single();
        return json(data);
      }
    }

    // ── Hydration ──────────────────────────
    if (resource === "hydration") {
      if (method === "GET") {
        const date = url.searchParams.get("date");
        const days = url.searchParams.get("days");
        if (days) {
          // History: last N days
          const n = parseInt(days);
          const dates: string[] = [];
          const today = new Date();
          for (let i = n - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split("T")[0]);
          }
          const { data } = await supabase.from("hydration_log").select("date, cups").eq("user_id", userId).in("date", dates);
          return json(data || []);
        }
        if (date) {
          const { data } = await supabase.from("hydration_log").select("*").eq("user_id", userId).eq("date", date).maybeSingle();
          return json(data);
        }
        return err("date or days param required");
      }
      if (method === "POST") {
        const body = await req.json();
        const { data } = await supabase.from("hydration_log").upsert(
          { user_id: userId, date: body.date, cups: body.cups, goal: body.goal },
          { onConflict: "user_id,date" }
        ).select().single();
        return json(data);
      }
    }

    // ── Sleep ──────────────────────────────
    if (resource === "sleep") {
      if (method === "GET") {
        const { data } = await supabase.from("sleep_log").select("*").eq("user_id", userId).order("date");
        return json(data || []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { data } = await supabase.from("sleep_log").upsert(
          { user_id: userId, date: body.date, bedtime: body.bedtime, wake_time: body.wakeTime, duration: body.duration },
          { onConflict: "user_id,date" }
        ).select().single();
        return json(data);
      }
    }

    // ── Sunnah Fasting ─────────────────────
    if (resource === "fasting") {
      if (method === "GET") {
        const { data } = await supabase.from("fasting_log").select("date").eq("user_id", userId);
        return json(data || []);
      }
      if (method === "POST") {
        const body = await req.json();
        if (body.isFasting) {
          await supabase.from("fasting_log").upsert({ user_id: userId, date: body.date }, { onConflict: "user_id,date" });
        } else {
          await supabase.from("fasting_log").delete().match({ user_id: userId, date: body.date });
        }
        return json({ ok: true });
      }
    }

    // ── Steps ──────────────────────────────
    if (resource === "steps") {
      if (method === "GET") {
        const date = url.searchParams.get("date");
        const days = url.searchParams.get("days");
        if (days) {
          const n = parseInt(days);
          const dates: string[] = [];
          const today = new Date();
          for (let i = n - 1; i >= 0; i--) {
            const d = new Date(today); d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split("T")[0]);
          }
          const { data } = await supabase.from("steps_logs").select("*").eq("user_id", userId).in("date", dates).order("logged_at");
          return json(data || []);
        }
        if (date) {
          const { data } = await supabase.from("steps_logs").select("*").eq("user_id", userId).eq("date", date).order("logged_at");
          return json(data || []);
        }
        // All logs
        const { data } = await supabase.from("steps_logs").select("*").eq("user_id", userId).order("logged_at");
        return json(data || []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { data } = await supabase.from("steps_logs").insert({
          user_id: userId, date: body.date, steps: body.steps,
          activity_type: body.activityType, distance_meters: body.distanceMeters,
          calories_burned: body.caloriesBurned, logged_at: body.loggedAt,
          source: body.source || "manual",
        }).select().single();
        return json(data);
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return err("id required");
        await supabase.from("steps_logs").delete().eq("id", id).eq("user_id", userId);
        return json({ ok: true });
      }
    }

    // ── Steps Preferences ──────────────────
    if (resource === "steps-prefs") {
      if (method === "GET") {
        const { data } = await supabase.from("steps_preferences").select("*").eq("user_id", userId).maybeSingle();
        return json(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const { data } = await supabase.from("steps_preferences").upsert({
          user_id: userId,
          daily_target: body.dailyTarget,
          stride_length_cm: body.strideLengthCm,
          reminder_enabled: body.reminderEnabled,
          reminder_time: body.reminderTime,
        }, { onConflict: "user_id" }).select().single();
        return json(data);
      }
    }

    // ── IF Sessions ────────────────────────
    if (resource === "if-sessions") {
      if (method === "GET") {
        const { data } = await supabase.from("if_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
        return json(data || []);
      }
      if (method === "POST") {
        const body = await req.json();
        const action = body.action;
        if (action === "start") {
          const { data } = await supabase.from("if_sessions").insert({
            user_id: userId, mode: body.mode, start_time: body.startTime, fasting_hours: body.fastingHours,
          }).select().single();
          return json(data);
        }
        if (action === "stop") {
          await supabase.from("if_sessions").update({
            end_time: body.endTime, completed: body.completed,
          }).match({ user_id: userId, start_time: body.startTime });
          return json({ ok: true });
        }
      }
    }

    // ── Health Profile ─────────────────────
    if (resource === "profile") {
      if (method === "GET") {
        const { data } = await supabase.from("user_health_profiles").select("*").eq("user_id", userId).maybeSingle();
        return json(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const { data } = await supabase.from("user_health_profiles").upsert(
          { user_id: userId, ...body },
          { onConflict: "user_id" }
        ).select().single();
        return json(data);
      }
    }

    return err("Unknown resource: " + resource, 404);
  } catch (e) {
    console.error("[api-health]", e);
    return err(String(e), 500);
  }
});

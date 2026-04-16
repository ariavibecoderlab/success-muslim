import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !claims?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.user.id;

    const url = new URL(req.url);
    const resource = url.searchParams.get("resource") || "tasks";
    const method = req.method;

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // ── TASKS ──
    if (resource === "tasks") {
      if (method === "GET") {
        const date = url.searchParams.get("date");
        if (!date) return json({ error: "date required" }, 400);
        const { data } = await supabase.from("daily_tasks")
          .select("*").eq("user_id", userId).eq("date", date).order("created_at");
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("daily_tasks").insert({
          id: body.id, user_id: userId, date: body.date,
          text: body.text, is_mit: body.is_mit ?? false,
        });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (method === "PUT") {
        const body = await req.json();
        const { error } = await supabase.from("daily_tasks")
          .update({ completed: body.completed })
          .eq("id", body.id).eq("user_id", userId);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (method === "DELETE") {
        const taskId = url.searchParams.get("id");
        if (!taskId) return json({ error: "id required" }, 400);
        await supabase.from("daily_tasks").delete().eq("id", taskId).eq("user_id", userId);
        return json({ ok: true });
      }
    }

    // ── TASK STREAK ──
    if (resource === "task-streak") {
      const startDate = url.searchParams.get("start_date") || "";
      const { data } = await supabase.from("daily_tasks")
        .select("date, is_mit, completed")
        .eq("user_id", userId)
        .gte("date", startDate)
        .order("date", { ascending: false });
      return json(data ?? []);
    }

    // ── HABITS ──
    if (resource === "habits") {
      if (method === "GET") {
        const { data } = await supabase.from("habits")
          .select("*").eq("user_id", userId).order("created_at");
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("habits").insert({
          id: body.id, user_id: userId, name: body.name,
          icon: body.icon || "Check", color: body.color || "primary",
        });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (method === "DELETE") {
        const habitId = url.searchParams.get("id");
        if (!habitId) return json({ error: "id required" }, 400);
        await supabase.from("habits").delete().eq("id", habitId).eq("user_id", userId);
        return json({ ok: true });
      }
    }

    // ── HABIT LOG ──
    if (resource === "habit-log") {
      if (method === "GET") {
        const { data } = await supabase.from("habit_log")
          .select("habit_id, date").eq("user_id", userId);
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("habit_log").insert({
          user_id: userId, habit_id: body.habit_id, date: body.date,
        });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (method === "DELETE") {
        const habitId = url.searchParams.get("habit_id");
        const date = url.searchParams.get("date");
        if (!habitId || !date) return json({ error: "habit_id and date required" }, 400);
        await supabase.from("habit_log").delete().match({
          user_id: userId, habit_id: habitId, date,
        });
        return json({ ok: true });
      }
    }

    // ── LIFE AREAS ──
    if (resource === "life-areas") {
      if (method === "GET") {
        const { data } = await supabase.from("life_area_scores")
          .select("*").eq("user_id", userId).order("date", { ascending: false });
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const rows = body.scores.map((s: { area: string; score: number }) => ({
          user_id: userId, date: body.date, area: s.area, score: s.score,
        }));
        const { error } = await supabase.from("life_area_scores").upsert(rows, {
          onConflict: "user_id,date,area",
        });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

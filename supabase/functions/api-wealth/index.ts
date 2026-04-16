import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !claims?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.user.id;
    const url = new URL(req.url);
    const resource = url.searchParams.get("resource") || "transactions";
    const method = req.method;

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // ── TRANSACTIONS ──
    if (resource === "transactions") {
      if (method === "GET") {
        const start = url.searchParams.get("start");
        const end = url.searchParams.get("end");
        let q = supabase.from("transactions").select("*").eq("user_id", userId);
        if (start) q = q.gte("date", start);
        if (end) q = q.lte("date", end);
        const { data } = await q.order("date", { ascending: false });
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("transactions").insert({
          user_id: userId, type: body.type, amount: body.amount, category: body.category,
          description: body.description || null, date: body.date,
          is_recurring: body.is_recurring ?? false, recurrence_interval: body.recurrence_interval || null,
        });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        await supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);
        return json({ ok: true });
      }
    }

    // ── STATS (summary for Wealth hub) ──
    if (resource === "stats") {
      const start = url.searchParams.get("start") || "";
      const end = url.searchParams.get("end") || "";
      const [txRes, goalsRes] = await Promise.all([
        supabase.from("transactions").select("type, amount").eq("user_id", userId).gte("date", start).lte("date", end),
        supabase.from("savings_goals").select("current_amount").eq("user_id", userId),
      ]);
      return json({ transactions: txRes.data ?? [], goals: goalsRes.data ?? [] });
    }

    // ── BUDGET PERIODS ──
    if (resource === "budget-periods") {
      if (method === "GET") {
        const { data } = await supabase.from("budget_periods").select("*").eq("user_id", userId).order("start_date", { ascending: false });
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("budget_periods").insert({ user_id: userId, ...body });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        await supabase.from("budget_periods").delete().eq("id", id).eq("user_id", userId);
        return json({ ok: true });
      }
    }

    // ── SAVINGS GOALS ──
    if (resource === "savings-goals") {
      if (method === "GET") {
        const { data: goals } = await supabase.from("savings_goals").select("*").eq("user_id", userId).order("created_at");
        if (!goals?.length) return json([]);
        const goalIds = goals.map(g => g.id);
        const { data: contribs } = await supabase.from("savings_contributions").select("*").in("goal_id", goalIds).order("date", { ascending: false });
        return json({ goals, contributions: contribs ?? [] });
      }
      if (method === "POST") {
        const body = await req.json();
        if (body.action === "create") {
          const { error } = await supabase.from("savings_goals").insert({
            user_id: userId, name: body.name, goal_type: body.goal_type || "custom",
            target_amount: body.target_amount, icon: body.icon || "Target", deadline: body.deadline || null,
          });
          if (error) return json({ error: error.message }, 400);
          return json({ ok: true });
        }
        if (body.action === "contribute") {
          await supabase.from("savings_contributions").insert({
            user_id: userId, goal_id: body.goal_id, amount: body.amount,
            date: body.date, note: body.note || null,
          });
          await supabase.from("savings_goals").update({ current_amount: body.new_total }).eq("id", body.goal_id);
          return json({ ok: true });
        }
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        await supabase.from("savings_goals").delete().eq("id", id).eq("user_id", userId);
        return json({ ok: true });
      }
    }

    // ── SADAQAH ──
    if (resource === "sadaqah") {
      if (method === "GET") {
        const [donRes, goalRes] = await Promise.all([
          supabase.from("sadaqah_donations").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(100),
          supabase.from("sadaqah_goals").select("*").eq("user_id", userId).limit(1),
        ]);
        return json({ donations: donRes.data ?? [], goal: goalRes.data?.[0] ?? null });
      }
      if (method === "POST") {
        const body = await req.json();
        if (body.action === "donate") {
          const { error } = await supabase.from("sadaqah_donations").insert({
            user_id: userId, amount: body.amount, category: body.category || "sadaqah",
            currency: body.currency || "MYR", notes: body.notes || null,
            recipient: body.recipient || null, date: body.date,
          });
          if (error) return json({ error: error.message }, 400);
          return json({ ok: true });
        }
        if (body.action === "set_goal") {
          if (body.goal_id) {
            await supabase.from("sadaqah_goals").update({ monthly_target: body.monthly_target, currency: body.currency }).eq("id", body.goal_id);
          } else {
            await supabase.from("sadaqah_goals").insert({ user_id: userId, monthly_target: body.monthly_target, currency: body.currency });
          }
          return json({ ok: true });
        }
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        await supabase.from("sadaqah_donations").delete().eq("id", id).eq("user_id", userId);
        return json({ ok: true });
      }
    }

    // ── ZAKAT ──
    if (resource === "zakat") {
      if (method === "GET") {
        const { data } = await supabase.from("zakat_history").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        if (body.action === "save") {
          const { error } = await supabase.from("zakat_history").insert({ user_id: userId, ...body.record });
          if (error) return json({ error: error.message }, 400);
          return json({ ok: true });
        }
        if (body.action === "mark_paid") {
          await supabase.from("zakat_history").update({ is_paid: true, paid_date: body.paid_date }).eq("id", body.id).eq("user_id", userId);
          return json({ ok: true });
        }
      }
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

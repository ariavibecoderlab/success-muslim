import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const url = new URL(req.url);
    const resource = url.searchParams.get("resource") || "activity";
    const method = req.method;

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // ── PUBLIC READS (no auth required) ──
    if (method === "GET" && (resource === "page-overrides" || resource === "blog" || resource === "announcements" || resource === "dakwah")) {
      if (resource === "page-overrides") {
        const page = url.searchParams.get("page") || "";
        const { data } = await supabase.from("page_overrides").select("*").eq("page", page);
        return json(data ?? []);
      }
      if (resource === "blog") {
        const status = url.searchParams.get("status");
        let q = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
        if (status) q = q.eq("status", status);
        const { data } = await q;
        return json(data ?? []);
      }
      if (resource === "announcements") {
        const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
        return json(data ?? []);
      }
      if (resource === "dakwah") {
        const { data } = await supabase.from("dakwah_posters").select("*").order("date", { ascending: false });
        return json(data ?? []);
      }
    }

    // ── AUTHENTICATED ROUTES ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !claims?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.user.id;

    // ── USER ACTIVITY ──
    if (resource === "activity") {
      if (method === "POST") {
        const body = await req.json();
        await supabase.from("user_activity").insert({
          user_id: userId, module: body.module, action: body.action, metadata: body.metadata || {},
        });
        return json({ ok: true });
      }
    }

    // ── PRAYER SETTINGS ──
    if (resource === "prayer-settings") {
      if (method === "GET") {
        const { data } = await supabase.from("prayer_settings").select("*").eq("user_id", userId).maybeSingle();
        return json(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("prayer_settings").upsert({ user_id: userId, ...body }, { onConflict: "user_id" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── QADA SOLAT ──
    if (resource === "qada-solat") {
      if (method === "GET") {
        const { data } = await supabase.from("qada_solat").select("setup, progress").eq("user_id", userId).single();
        return json(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("qada_solat").upsert({ user_id: userId, setup: body.setup, progress: body.progress }, { onConflict: "user_id" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── RAMADHAN QADA ──
    if (resource === "ramadhan-qada") {
      if (method === "GET") {
        const { data } = await supabase.from("ramadhan_qada").select("setup, progress").eq("user_id", userId).single();
        return json(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("ramadhan_qada").upsert({ user_id: userId, setup: body.setup, progress: body.progress }, { onConflict: "user_id" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── FIDYAH ──
    if (resource === "fidyah") {
      if (method === "GET") {
        const { data } = await supabase.from("fidyah_history").select("entry, created_at").eq("user_id", userId).order("created_at", { ascending: false });
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("fidyah_history").insert({ user_id: userId, entry: body.entry });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── WIDGET PREFERENCES ──
    if (resource === "widget-prefs") {
      if (method === "GET") {
        const { data } = await supabase.from("widget_preferences")
          .select("widget_id, enabled, position, size")
          .eq("user_id", userId)
          .order("position", { ascending: true });
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        if (body.prefs && Array.isArray(body.prefs)) {
          const rows = body.prefs.map((p: any) => ({
            user_id: userId, widget_id: p.widget_id,
            enabled: p.enabled, position: p.position, size: p.size,
          }));
          const { error } = await supabase.from("widget_preferences").upsert(rows, { onConflict: "user_id,widget_id" });
          if (error) return json({ error: error.message }, 400);
        }
        return json({ ok: true });
      }
    }

    // ── RAMADAN OPTIMIZER ──
    if (resource === "ramadan-log") {
      if (method === "GET") {
        const { data } = await supabase.from("ramadan_daily_log").select("*").eq("user_id", userId).order("date");
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        if (body.id) {
          // Update
          const { [body.field]: _v, ...rest } = body;
          await supabase.from("ramadan_daily_log").update({ [body.field]: body.value }).eq("id", body.id);
        } else {
          // Insert
          const { data } = await supabase.from("ramadan_daily_log").insert({ user_id: userId, ...body.entry }).select().single();
          return json(data);
        }
        return json({ ok: true });
      }
    }

    if (resource === "ramadan-settings") {
      if (method === "GET") {
        const { data } = await supabase.from("ramadan_settings").select("*").eq("user_id", userId).single();
        return json(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("ramadan_settings").upsert({ user_id: userId, ...body }, { onConflict: "user_id" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── HAJJ/UMRAH ──
    if (resource === "hajj-umrah") {
      if (method === "GET") {
        const journeyType = url.searchParams.get("journey_type") || "umrah";
        const { data } = await supabase.from("hajj_umrah_progress").select("*").eq("user_id", userId).eq("journey_type", journeyType).order("created_at", { ascending: false }).limit(1).maybeSingle();
        return json(data);
      }
      if (method === "POST") {
        const body = await req.json();
        if (body.id) {
          const { error } = await supabase.from("hajj_umrah_progress").update(body.updates).eq("id", body.id).eq("user_id", userId);
          if (error) return json({ error: error.message }, 400);
          return json({ ok: true });
        } else {
          const { data, error } = await supabase.from("hajj_umrah_progress").insert({ user_id: userId, ...body }).select().single();
          if (error) return json({ error: error.message }, 400);
          return json(data);
        }
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        await supabase.from("hajj_umrah_progress").delete().eq("id", id).eq("user_id", userId);
        return json({ ok: true });
      }
    }

    // ── QIYAM ──
    if (resource === "qiyam-log") {
      if (method === "GET") {
        const limit = parseInt(url.searchParams.get("limit") || "90");
        const { data } = await supabase.from("qiyam_log").select("id, date, performed, notes, sleep_time, wake_time, tahajjud_start").eq("user_id", userId).order("date", { ascending: false }).limit(limit);
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        if (body.id) {
          // Update existing log
          const { error } = await supabase.from("qiyam_log").update({ performed: body.performed }).eq("id", body.id).eq("user_id", userId);
          if (error) return json({ error: error.message }, 400);
          return json({ ok: true });
        } else {
          // Insert new log
          const { data, error } = await supabase.from("qiyam_log").insert({ user_id: userId, ...body }).select("id, date, performed, notes, sleep_time, wake_time, tahajjud_start").single();
          if (error) return json({ error: error.message }, 400);
          return json(data);
        }
      }
    }

    // ── QURAN READING SESSIONS ──
    if (resource === "quran-sessions") {
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("quran_reading_sessions").insert({ user_id: userId, ...body });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    if (resource === "qiyam-settings") {
      if (method === "GET") {
        const { data } = await supabase.from("qiyam_settings").select("*").eq("user_id", userId).single();
        return json(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("qiyam_settings").upsert({ user_id: userId, ...body }, { onConflict: "user_id" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── PAGE OVERRIDES (CMS) ──
    if (resource === "page-overrides") {
      if (method === "GET") {
        const page = url.searchParams.get("page") || "";
        const { data } = await supabase.from("page_overrides").select("*").eq("page", page);
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { data, error } = await supabase.from("page_overrides").upsert({
          page: body.page, element_key: body.element_key,
          override_type: body.override_type, value: body.value, updated_by: userId,
        }, { onConflict: "page,element_key,override_type" }).select().single();
        if (error) return json({ error: error.message }, 400);
        return json(data);
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        await supabase.from("page_overrides").delete().eq("id", id);
        return json({ ok: true });
      }
    }

    // ── ANNOUNCEMENTS (global) ──
    if (resource === "announcements") {
      if (method === "GET") {
        const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("announcements").upsert({ ...body, created_by: userId });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        await supabase.from("announcements").delete().eq("id", id);
        return json({ ok: true });
      }
    }

    // ── BLOG ──
    if (resource === "blog") {
      if (method === "GET") {
        const status = url.searchParams.get("status");
        let q = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
        if (status) q = q.eq("status", status);
        const { data } = await q;
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        if (body.id) {
          const { error } = await supabase.from("blog_posts").update(body).eq("id", body.id);
          if (error) return json({ error: error.message }, 400);
        } else {
          const { error } = await supabase.from("blog_posts").insert({ ...body, author_id: userId });
          if (error) return json({ error: error.message }, 400);
        }
        return json({ ok: true });
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        await supabase.from("blog_posts").delete().eq("id", id);
        return json({ ok: true });
      }
    }

    // ── DAKWAH POSTERS ──
    if (resource === "dakwah") {
      if (method === "GET") {
        const { data } = await supabase.from("dakwah_posters").select("*").order("date", { ascending: false });
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("dakwah_posters").insert({ ...body, created_by: userId });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        await supabase.from("dakwah_posters").delete().eq("id", id);
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

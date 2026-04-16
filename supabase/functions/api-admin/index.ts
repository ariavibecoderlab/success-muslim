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

    // Verify admin role
    const { data: roleCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const url = new URL(req.url);
    const resource = url.searchParams.get("resource") || "overview";
    const method = req.method;

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // ── RPC WRAPPERS ──
    if (resource === "overview-stats") {
      const { data } = await supabase.rpc("admin_overview_stats");
      return json(data);
    }
    if (resource === "signup-chart") {
      const days = parseInt(url.searchParams.get("days") || "30");
      const { data } = await supabase.rpc("admin_signup_chart", { _days: days });
      return json(data ?? []);
    }
    if (resource === "module-usage") {
      const { data } = await supabase.rpc("admin_module_usage");
      return json(data ?? []);
    }
    if (resource === "user-breakdown") {
      const { data } = await supabase.rpc("admin_user_breakdown");
      return json(data);
    }
    if (resource === "retention-cohorts") {
      const { data } = await supabase.rpc("admin_retention_cohorts");
      return json(data ?? []);
    }
    if (resource === "engagement-stats") {
      const days = parseInt(url.searchParams.get("days") || "30");
      const { data } = await supabase.rpc("admin_engagement_stats", { _days: days });
      return json(data);
    }
    if (resource === "checkin-stats") {
      const { data } = await supabase.rpc("admin_checkin_stats");
      return json(data);
    }
    if (resource === "widget-popularity") {
      const { data } = await supabase.rpc("admin_widget_popularity");
      return json(data ?? []);
    }
    if (resource === "iman-stats") {
      const { data } = await supabase.rpc("admin_iman_stats");
      return json(data);
    }
    if (resource === "iman-trends") {
      const days = parseInt(url.searchParams.get("days") || "30");
      const { data } = await supabase.rpc("admin_iman_trends", { _days: days });
      return json(data);
    }
    if (resource === "sadaqah-by-category") {
      const { data } = await supabase.rpc("admin_sadaqah_by_category");
      return json(data ?? []);
    }
    if (resource === "health-stats") {
      const { data } = await supabase.rpc("admin_health_stats");
      return json(data);
    }
    if (resource === "health-trends") {
      const days = parseInt(url.searchParams.get("days") || "30");
      const { data } = await supabase.rpc("admin_health_trends", { _days: days });
      return json(data);
    }
    if (resource === "family-overview") {
      const { data } = await supabase.rpc("admin_family_overview");
      return json(data);
    }
    if (resource === "family-members") {
      const familyId = url.searchParams.get("family_id");
      if (!familyId) return json({ error: "family_id required" }, 400);
      const { data } = await supabase.rpc("admin_family_members", { _family_id: familyId });
      return json(data ?? []);
    }
    if (resource === "table-sizes") {
      const { data } = await supabase.rpc("admin_table_sizes");
      return json(data);
    }
    if (resource === "live-feed") {
      const limit = parseInt(url.searchParams.get("limit") || "15");
      const { data } = await supabase.rpc("admin_live_feed", { _limit: limit });
      return json(data ?? []);
    }
    if (resource === "user-last-active") {
      const { data } = await supabase.rpc("admin_user_last_active");
      return json(data ?? []);
    }
    if (resource === "user-detail-stats") {
      const uid = url.searchParams.get("user_id");
      if (!uid) return json({ error: "user_id required" }, 400);
      const { data } = await supabase.rpc("admin_user_detail_stats", { _user_id: uid });
      return json(data);
    }

    // ── PROFILES (admin) ──
    if (resource === "profiles") {
      if (method === "GET") {
        const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        return json(data ?? []);
      }
      if (method === "PUT") {
        const body = await req.json();
        const { id, ...updates } = body;
        const { error } = await supabase.from("profiles").update(updates).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── USER ROLES ──
    if (resource === "user-roles") {
      if (method === "GET") {
        const { data } = await supabase.from("user_roles").select("*");
        return json(data ?? []);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("user_roles").insert({ user_id: body.user_id, role: body.role });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (method === "PUT") {
        const body = await req.json();
        const { error } = await supabase.from("user_roles").update({ role: body.role }).eq("id", body.id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        await supabase.from("user_roles").delete().eq("id", id);
        return json({ ok: true });
      }
    }

    // ── USER ACTIVITY (admin read) ──
    if (resource === "user-activity") {
      const uid = url.searchParams.get("user_id");
      let q = supabase.from("user_activity").select("*").order("created_at", { ascending: false }).limit(parseInt(url.searchParams.get("limit") || "20"));
      if (uid) q = q.eq("user_id", uid);
      // Error filter
      if (url.searchParams.get("filter") === "error") q = q.ilike("action", "%error%");
      const { data } = await q;
      return json(data ?? []);
    }

    // ── AUDIT LOG ──
    if (resource === "audit-log") {
      if (method === "GET") {
        const { data } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(100);
        if (!data) return json([]);
        // Fetch admin names
        const adminIds = [...new Set(data.map((e: any) => e.admin_id))];
        const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", adminIds);
        const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.display_name]));
        return json(data.map((e: any) => ({ ...e, admin_name: nameMap.get(e.admin_id) || "Unknown" })));
      }
      if (method === "POST") {
        const body = await req.json();
        await supabase.from("admin_audit_log").insert({
          admin_id: userId, action: body.action,
          target_type: body.target_type || null, target_id: body.target_id || null,
          metadata: body.metadata || {},
        });
        return json({ ok: true });
      }
    }

    // ── DELETE USER ──
    if (resource === "delete-user") {
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.rpc("admin_delete_user", { target_user_id: body.user_id });
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

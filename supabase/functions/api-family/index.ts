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
    const resource = url.searchParams.get("resource") || "families";
    const method = req.method;

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // ── FAMILIES ──
    if (resource === "families") {
      if (method === "GET") {
        const { data: memberRows } = await supabase.from("family_members").select("family_id, role").eq("user_id", userId);
        if (!memberRows?.length) return json([]);
        const familyIds = memberRows.map(r => r.family_id);
        const { data: familyRows } = await supabase.from("families").select("*").in("id", familyIds);
        if (!familyRows) return json([]);
        const result = await Promise.all(familyRows.map(async (f: any) => {
          const { count } = await supabase.from("family_members").select("*", { count: "exact", head: true }).eq("family_id", f.id);
          const role = memberRows.find(r => r.family_id === f.id)?.role || "member";
          return { ...f, member_count: count ?? 0, user_role: role };
        }));
        return json(result);
      }
      if (method === "POST") {
        const body = await req.json();
        const action = body.action;

        if (action === "create") {
          let invite_code = body.invite_code;
          const invite_link = `https://www.successmuslim.app/family/join/${invite_code}`;
          const { data: family, error } = await supabase.from("families")
            .insert({ name: body.name, created_by: userId, invite_code, invite_link, group_type: body.group_type || "family" })
            .select().single();
          if (error) return json({ error: error.message }, 400);
          await supabase.from("family_members").insert({ family_id: family.id, user_id: userId, role: "admin" });
          return json(family);
        }

        if (action === "join") {
          const { data: lookupData } = await supabase.rpc("lookup_family_by_invite", { p_code: body.code });
          const familyRow = lookupData?.[0];
          if (!familyRow) return json({ error: "Invalid code" }, 404);
          const { data: existing } = await supabase.from("family_members").select("id").eq("family_id", familyRow.id).eq("user_id", userId).single();
          if (existing) return json({ family: familyRow, already_member: true });
          const { count } = await supabase.from("family_members").select("*", { count: "exact", head: true }).eq("family_id", familyRow.id);
          if ((count ?? 0) >= 20) return json({ error: "Family is full" }, 400);
          const { error } = await supabase.from("family_members").insert({ family_id: familyRow.id, user_id: userId, role: "member" });
          if (error) return json({ error: error.message }, 400);
          return json({ family: familyRow, joined: true });
        }

        if (action === "preview") {
          const { data: lookupData } = await supabase.rpc("lookup_family_by_invite", { p_code: body.code });
          const family = lookupData?.[0];
          if (!family) return json(null);
          const { count } = await supabase.from("family_members").select("*", { count: "exact", head: true }).eq("family_id", family.id);
          return json({ family, memberCount: count ?? 0 });
        }

        if (action === "rename") {
          const { error } = await supabase.from("families").update({ name: body.name }).eq("id", body.family_id);
          if (error) return json({ error: error.message }, 400);
          return json({ ok: true });
        }

        if (action === "transfer_admin") {
          await supabase.from("family_members").update({ role: "member" }).eq("family_id", body.family_id).eq("user_id", userId);
          await supabase.from("family_members").update({ role: "admin" }).eq("family_id", body.family_id).eq("user_id", body.new_admin_id);
          return json({ ok: true });
        }

        if (action === "remove_member") {
          await supabase.from("family_members").delete().eq("family_id", body.family_id).eq("user_id", body.member_id);
          return json({ ok: true });
        }

        if (action === "post_feed") {
          await supabase.from("family_activity_feed").insert({
            family_id: body.family_id, user_id: userId,
            activity_type: body.activity_type, message: body.message,
          });
          return json({ ok: true });
        }

        if (action === "post_announcement") {
          const { error } = await supabase.from("family_announcements").insert({
            family_id: body.family_id, admin_id: userId, message: body.message,
          });
          if (error) return json({ error: error.message }, 400);
          return json({ ok: true });
        }

        if (action === "toggle_reaction") {
          const { data: existing } = await supabase.from("family_reactions").select("id")
            .eq("feed_id", body.feed_id).eq("user_id", userId).eq("reaction_type", body.reaction_type).single();
          if (existing) {
            await supabase.from("family_reactions").delete().eq("id", existing.id);
            return json({ removed: true });
          } else {
            await supabase.from("family_reactions").insert({
              feed_id: body.feed_id, user_id: userId, reaction_type: body.reaction_type,
            });
            return json({ added: true });
          }
        }
      }

      if (method === "DELETE") {
        const familyId = url.searchParams.get("family_id");
        const action = url.searchParams.get("action");
        if (!familyId) return json({ error: "family_id required" }, 400);

        if (action === "leave") {
          await supabase.from("family_members").delete().eq("family_id", familyId).eq("user_id", userId);
          const { count } = await supabase.from("family_members").select("*", { count: "exact", head: true }).eq("family_id", familyId);
          if (count === 0) {
            await supabase.from("family_activity_feed").delete().eq("family_id", familyId);
            await supabase.from("family_announcements").delete().eq("family_id", familyId);
            await supabase.from("families").delete().eq("id", familyId);
          } else if (count === 1) {
            await supabase.from("family_members").update({ role: "admin" }).eq("family_id", familyId);
          }
          return json({ ok: true });
        }

        // Delete family
        await supabase.from("family_activity_feed").delete().eq("family_id", familyId);
        await supabase.from("family_announcements").delete().eq("family_id", familyId);
        await supabase.from("family_members").delete().eq("family_id", familyId);
        await supabase.from("families").delete().eq("id", familyId);
        return json({ ok: true });
      }
    }

    // ── MEMBERS ──
    if (resource === "members") {
      const familyId = url.searchParams.get("family_id");
      if (!familyId) return json({ error: "family_id required" }, 400);
      const { data } = await supabase.from("family_members").select("*").eq("family_id", familyId);
      if (!data) return json([]);
      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds);
      const result = data.map(m => ({
        ...m,
        display_name: profiles?.find(p => p.id === m.user_id)?.display_name ?? null,
        avatar_url: profiles?.find(p => p.id === m.user_id)?.avatar_url ?? null,
      }));
      return json(result);
    }

    // ── LEADERBOARD ──
    if (resource === "leaderboard") {
      const familyId = url.searchParams.get("family_id");
      if (!familyId) return json({ error: "family_id required" }, 400);
      const { data, error } = await supabase.rpc("get_family_leaderboard", { p_family_id: familyId });
      if (error) return json({ error: error.message }, 400);
      return json(data ?? []);
    }

    // ── FEED ──
    if (resource === "feed") {
      const familyId = url.searchParams.get("family_id");
      if (!familyId) return json({ error: "family_id required" }, 400);
      const { data: feedRows } = await supabase.from("family_activity_feed").select("*").eq("family_id", familyId).order("created_at", { ascending: false }).limit(30);
      if (!feedRows) return json([]);
      const userIds = [...new Set(feedRows.map(r => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds);
      const feedIds = feedRows.map(r => r.id);
      const { data: reactions } = await supabase.from("family_reactions").select("feed_id, reaction_type, user_id").in("feed_id", feedIds);
      const result = feedRows.map(row => {
        const profile = profiles?.find(p => p.id === row.user_id);
        const rowReactions = reactions?.filter(r => r.feed_id === row.id) ?? [];
        const types = ["dua", "love", "fire"];
        const reactionSummary = types.map(t => ({
          type: t,
          count: rowReactions.filter(r => r.reaction_type === t).length,
          reacted: rowReactions.some(r => r.reaction_type === t && r.user_id === userId),
        }));
        return { ...row, display_name: profile?.display_name ?? null, avatar_url: profile?.avatar_url ?? null, reactions: reactionSummary };
      });
      return json(result);
    }

    // ── ANNOUNCEMENT ──
    if (resource === "announcement") {
      const familyId = url.searchParams.get("family_id");
      if (!familyId) return json(null);
      const { data } = await supabase.from("family_announcements").select("message, created_at")
        .eq("family_id", familyId).order("created_at", { ascending: false }).limit(1).single();
      return json(data);
    }

    // ── PRIVACY SETTINGS ──
    if (resource === "privacy") {
      if (method === "GET") {
        const { data } = await supabase.from("family_privacy_settings").select("*").eq("user_id", userId).single();
        return json(data);
      }
      if (method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("family_privacy_settings").upsert({ user_id: userId, ...body }, { onConflict: "user_id" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── FAMILY FEED POSTING (from other modules) ──
    if (resource === "feed-post") {
      if (method === "POST") {
        const body = await req.json();
        const { data: memberships } = await supabase.from("family_members").select("family_id").eq("user_id", userId);
        if (!memberships?.length) return json({ ok: true });
        await Promise.all(memberships.map(m =>
          supabase.from("family_activity_feed").insert({
            family_id: m.family_id, user_id: userId,
            activity_type: body.activity_type, message: body.message,
          })
        ));
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

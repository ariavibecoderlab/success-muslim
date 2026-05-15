import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function getUser(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data } = await supabase.auth.getUser(token);
  return data?.user ?? null;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const user = await getUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const url = new URL(req.url);
    const userId = user.id;
    const resource = url.searchParams.get("resource") || "reading-log";

    // ── READING LOG ───────────────────────────────────
    if (resource === "reading-log") {
      if (req.method === "GET") {
        const days = parseInt(url.searchParams.get("days") || "90");
        const since = new Date();
        since.setDate(since.getDate() - days);
        const { data, error } = await supabase
          .from("quran_reading_log")
          .select("*")
          .eq("user_id", userId)
          .gte("date", since.toISOString().split("T")[0])
          .order("created_at", { ascending: false });
        if (error) return json({ error: error.message }, 400);
        return json(data);
      }
      if (req.method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("quran_reading_log").insert({
          user_id: userId,
          date: body.date,
          log_type: body.log_type || "continue",
          start_surah: body.start_surah,
          start_ayah: body.start_ayah,
          end_surah: body.end_surah,
          end_ayah: body.end_ayah,
          ayah_count: body.ayah_count || 0,
          page_count: body.page_count || 0,
          juz_segments: body.juz_segments || [],
        });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (req.method === "PUT") {
        const body = await req.json();
        const { id, ...updates } = body;
        if (!id) return json({ error: "id required" }, 400);
        const { error } = await supabase
          .from("quran_reading_log")
          .update(updates)
          .eq("id", id)
          .eq("user_id", userId);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (req.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        const { error } = await supabase
          .from("quran_reading_log")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── DAILY LOG ─────────────────────────────────────
    if (resource === "daily-log") {
      if (req.method === "GET") {
        const days = parseInt(url.searchParams.get("days") || "90");
        const since = new Date();
        since.setDate(since.getDate() - days);
        const { data, error } = await supabase
          .from("quran_daily_log")
          .select("*")
          .eq("user_id", userId)
          .gte("date", since.toISOString().split("T")[0])
          .order("date", { ascending: false });
        if (error) return json({ error: error.message }, 400);
        return json(data);
      }
      if (req.method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("quran_daily_log").upsert(
          {
            user_id: userId,
            date: body.date,
            target_met: body.target_met ?? true,
            surah_number: body.surah_number ?? null,
            ayah_number: body.ayah_number ?? null,
          },
          { onConflict: "user_id,date" }
        );
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── PREFERENCES ───────────────────────────────────
    if (resource === "preferences") {
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("quran_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) return json({ error: error.message }, 400);
        return json(data);
      }
      if (req.method === "POST") {
        const body = await req.json();
        body.user_id = userId;
        const { error } = await supabase
          .from("quran_preferences")
          .upsert(body, { onConflict: "user_id" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── BOOKMARKS ─────────────────────────────────────
    if (resource === "bookmarks") {
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("quran_bookmarks")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (error) return json({ error: error.message }, 400);
        return json(data);
      }
      if (req.method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("quran_bookmarks").insert({
          user_id: userId,
          surah_number: body.surah_number,
          ayah_number: body.ayah_number,
          note: body.note || null,
        });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      if (req.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        const { error } = await supabase
          .from("quran_bookmarks")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── MEMORIZATION ──────────────────────────────────
    if (resource === "memorization") {
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("quran_memorization")
          .select("surah_number, ayah_number")
          .eq("user_id", userId);
        if (error) return json({ error: error.message }, 400);
        return json(data);
      }
      if (req.method === "POST") {
        const body = await req.json();
        // Toggle: check if exists then delete, otherwise insert
        const { data: existing } = await supabase
          .from("quran_memorization")
          .select("id")
          .eq("user_id", userId)
          .eq("surah_number", body.surah_number)
          .eq("ayah_number", body.ayah_number)
          .maybeSingle();
        if (existing) {
          await supabase.from("quran_memorization").delete().eq("id", existing.id);
        } else {
          await supabase.from("quran_memorization").insert({
            user_id: userId,
            surah_number: body.surah_number,
            ayah_number: body.ayah_number,
          });
        }
        return json({ ok: true });
      }
    }

    // ── QURAN LOG (legacy pages tracker) ──────────────
    if (resource === "quran-log") {
      if (req.method === "GET") {
        const date = url.searchParams.get("date");
        let query = supabase.from("quran_log").select("*").eq("user_id", userId);
        if (date) query = query.eq("date", date);
        const { data, error } = await query;
        if (error) return json({ error: error.message }, 400);
        return json(data);
      }
      if (req.method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("quran_log").upsert(
          {
            user_id: userId,
            date: body.date,
            pages_read: body.pages_read ?? 0,
            juz_number: body.juz_number ?? null,
            surah_name: body.surah_name ?? null,
            notes: body.notes ?? null,
          },
          { onConflict: "user_id,date" }
        );
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
    }

    // ── PROFILE (for display_name lookups) ────────────
    if (resource === "profile") {
      if (req.method === "GET") {
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", userId)
          .single();
        return json(data);
      }
    }

    return json({ error: "Unknown resource or method" }, 400);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

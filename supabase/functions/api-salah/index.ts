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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const user = await getUser(req);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const url = new URL(req.url);
    const userId = user.id;

    // GET /api-salah?date=YYYY-MM-DD — get salah logs for a date
    // GET /api-salah — get all salah logs
    if (req.method === "GET") {
      const date = url.searchParams.get("date");
      let query = supabase.from("salah_logs").select("*").eq("user_id", userId);
      if (date) query = query.eq("date", date);
      const { data, error } = await query;
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // POST /api-salah — upsert a salah log
    // body: { date, prayer_name, status, logged_at }
    if (req.method === "POST") {
      const body = await req.json();
      const { date, prayer_name, status, logged_at } = body;
      if (!date || !prayer_name) {
        return new Response(JSON.stringify({ error: "date and prayer_name required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (status === null) {
        // Delete the log entry
        const { error } = await supabase.from("salah_logs").delete().match({ user_id: userId, date, prayer_name });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { error } = await supabase.from("salah_logs").upsert(
        { user_id: userId, date, prayer_name, status, logged_at },
        { onConflict: "user_id,date,prayer_name" }
      );
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

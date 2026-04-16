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
    const method = req.method;

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    if (method === "GET") {
      const { data } = await supabase.from("profiles")
        .select("*").eq("id", userId).single();
      return json(data);
    }

    if (method === "PUT") {
      const body = await req.json();
      // Only allow updating safe fields
      const allowed: Record<string, unknown> = {};
      const safeFields = [
        "display_name", "avatar_url", "city", "country", "gender",
        "focus_areas", "consistency_level", "notification_enabled",
        "onboarding_completed", "onboarding_step", "weight_goal",
      ];
      for (const f of safeFields) {
        if (f in body) allowed[f] = body[f];
      }
      const { data, error } = await supabase.from("profiles")
        .update(allowed).eq("id", userId).select().single();
      if (error) return json({ error: error.message }, 400);
      return json(data);
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

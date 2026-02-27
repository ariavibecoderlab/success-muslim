import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const zone = url.searchParams.get("zone") || "WLY01";
    const endpoint = url.searchParams.get("endpoint") || "takwimsolat";

    let jakimUrl: string;
    if (endpoint === "tarikhtakwim") {
      const date = url.searchParams.get("date") || "";
      jakimUrl = `https://www.e-solat.gov.my/index.php?r=esolatApi/tarikhtakwim&period=today&datetype=miladi&date=${date}`;
    } else {
      jakimUrl = `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`;
    }

    let data: string | null = null;

    // Try JAKIM first with short timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(jakimUrl, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      data = await res.text();
      
      // Validate that the response is actually valid JSON with expected data
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (endpoint === "takwimsolat" && (!parsed.prayerTime || parsed.prayerTime.length === 0)) {
            console.log("JAKIM returned empty prayer times");
            data = null;
          }
          if (endpoint === "tarikhtakwim" && !parsed.takwim) {
            console.log("JAKIM returned empty takwim");
            data = null;
          }
        } catch {
          console.log("JAKIM returned invalid JSON");
          data = null;
        }
      }
    } catch {
      console.log("JAKIM API timed out or failed");
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: "JAKIM API failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(data, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

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
    } catch {
      console.log("JAKIM API timed out, trying Aladhan fallback");
    }

    // If JAKIM failed and this is a hijri date request, try Aladhan API
    if (!data && endpoint === "tarikhtakwim") {
      const dateParam = url.searchParams.get("date") || "";
      const [y, m, d] = dateParam.split("-");
      if (y && m && d) {
        try {
          const aladhanUrl = `https://api.aladhan.com/v1/gpiToH/${d}-${m}-${y}`;
          const aladhanRes = await fetch(aladhanUrl, {
            signal: AbortSignal.timeout(5000),
          });
          const aladhanJson = await aladhanRes.json();
          if (aladhanJson.code === 200 && aladhanJson.data?.hijri) {
            const h = aladhanJson.data.hijri;
            // Return in JAKIM-compatible format
            data = JSON.stringify({
              takwim: [{ hijri: `${h.year}-${String(h.month.number).padStart(2, "0")}-${String(h.day).padStart(2, "0")}` }],
            });
          }
        } catch {
          console.log("Aladhan API also failed");
        }
      }
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: "All upstream APIs failed" }),
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

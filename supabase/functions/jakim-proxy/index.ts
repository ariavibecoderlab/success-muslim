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
            console.log("JAKIM returned empty prayer times, trying fallback");
            data = null;
          }
          if (endpoint === "tarikhtakwim" && !parsed.takwim) {
            console.log("JAKIM returned empty takwim, trying fallback");
            data = null;
          }
        } catch {
          console.log("JAKIM returned invalid JSON, trying fallback");
          data = null;
        }
      }
    } catch {
      console.log("JAKIM API timed out or failed, trying Aladhan fallback");
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
            const dateKey = `${y}-${m}-${d}`;
            data = JSON.stringify({
              takwim: { [dateKey]: `${h.year}-${String(h.month.number).padStart(2, "0")}-${String(h.day).padStart(2, "0")}` },
            });
          }
        } catch {
          console.log("Aladhan API also failed for tarikhtakwim");
        }
      }
    }

    // If JAKIM failed and this is a prayer times request, try Aladhan API
    if (!data && endpoint === "takwimsolat") {
      // Map JAKIM zones to approximate coordinates for Aladhan fallback
      const zoneCoords: Record<string, { lat: number; lng: number }> = {
        "WLY01": { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
        "WLY02": { lat: 5.2831, lng: 115.2308 }, // Labuan
        "SGR01": { lat: 2.9264, lng: 101.6964 }, // Petaling
        "SGR02": { lat: 3.3615, lng: 101.5188 }, // Gombak/Rawang
        "JHR01": { lat: 1.4854, lng: 103.7618 }, // Johor Bahru
        "JHR02": { lat: 2.0442, lng: 102.5689 }, // Mersing
        "KDH01": { lat: 6.1184, lng: 100.3685 }, // Alor Setar
        "MLK01": { lat: 2.1896, lng: 102.2501 }, // Melaka
        "NSN01": { lat: 2.7258, lng: 101.9424 }, // Seremban
        "PHG01": { lat: 3.8077, lng: 103.3260 }, // Kuantan
        "PLS01": { lat: 6.4414, lng: 100.1986 }, // Perlis
        "PNG01": { lat: 5.4141, lng: 100.3288 }, // Penang
        "PRK01": { lat: 4.5921, lng: 101.0901 }, // Ipoh
        "SBH01": { lat: 5.9804, lng: 116.0735 }, // Kota Kinabalu
        "SWK01": { lat: 1.5533, lng: 110.3592 }, // Kuching
        "TRG01": { lat: 5.3117, lng: 103.1324 }, // Kuala Terengganu
        "KTN01": { lat: 6.1254, lng: 102.2381 }, // Kota Bharu
      };

      const coords = zoneCoords[zone] || zoneCoords["WLY01"];
      
      try {
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
        const aladhanUrl = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coords.lat}&longitude=${coords.lng}&method=3&school=1`;
        const aladhanRes = await fetch(aladhanUrl, {
          signal: AbortSignal.timeout(5000),
        });
        const aladhanJson = await aladhanRes.json();
        
        if (aladhanJson.code === 200 && aladhanJson.data?.timings) {
          const t = aladhanJson.data.timings;
          const hijri = aladhanJson.data.date?.hijri;
          const hijriStr = hijri
            ? `${hijri.year}-${String(hijri.month.number).padStart(2, "0")}-${String(hijri.day).padStart(2, "0")}`
            : "";

          // Return in JAKIM-compatible format
          data = JSON.stringify({
            prayerTime: [{
              fajr: t.Fajr + ":00",
              syuruk: t.Sunrise + ":00",
              dhuhr: t.Dhuhr + ":00",
              asr: t.Asr + ":00",
              maghrib: t.Maghrib + ":00",
              isha: t.Isha + ":00",
              imsak: t.Imsak + ":00",
              hijri: hijriStr,
              date: `${today.getDate()}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`,
            }],
            status: "OK",
            source: "aladhan-fallback",
          });
        }
      } catch {
        console.log("Aladhan API also failed for takwimsolat");
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

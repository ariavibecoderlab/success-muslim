import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
  'Ramadhan', 'Shawwal', 'Dhul Qa\'dah', 'Dhul Hijjah',
];

/**
 * Fetch Hijri date from JAKIM e-solat API via proxy (most accurate for Malaysia)
 */
export async function fetchJakimHijriDate(date: Date): Promise<string | null> {
  try {
    const dateStr = format(date, 'yyyy-MM-dd');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      'apikey': anonKey,
      'Content-Type': 'application/json',
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const res = await fetch(
      `${supabaseUrl}/functions/v1/jakim-proxy?endpoint=tarikhtakwim&date=${dateStr}`,
      { headers }
    );
    const json = await res.json();

    if (json.takwim && json.takwim.length > 0) {
      const entry = json.takwim[0];
      // JAKIM returns hijri in format like "1447-08-19"
      if (entry.hijri) {
        const parts = entry.hijri.split('-');
        if (parts.length === 3) {
          const [year, month, day] = parts.map(Number);
          const monthName = HIJRI_MONTHS[month - 1] || '';
          return `${day} ${monthName} ${year} H`;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Local algorithmic Gregorian-to-Hijri conversion (Kuwaiti algorithm).
 * Used as fallback when JAKIM API is unavailable.
 */
export function gregorianToHijri(date: Date): { day: number; month: number; year: number; monthName: string } {
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();

  // Proper Julian Day Number
  const a = Math.floor((14 - (m + 1)) / 12);
  const yy = y + 4800 - a;
  const mm = (m + 1) + 12 * a - 3;
  const julianDay = d + Math.floor((153 * mm + 2) / 5) + 365 * yy
    + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;

  const l = julianDay - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719)
    + Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const lll = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hijriMonth = Math.floor((24 * lll) / 709);
  const hijriDay = lll - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  return {
    day: hijriDay,
    month: hijriMonth,
    year: hijriYear,
    monthName: HIJRI_MONTHS[hijriMonth - 1] || '',
  };
}

export function formatHijriDate(date: Date): string {
  const h = gregorianToHijri(date);
  return `${h.day} ${h.monthName} ${h.year} H`;
}

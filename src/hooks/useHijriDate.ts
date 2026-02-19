import { useState, useEffect } from 'react';
import { fetchJakimHijriDate, formatHijriDate, gregorianToHijri } from '@/lib/hijri';

interface HijriDateResult {
  hijriDate: string;
  hijriParts: { day: number; month: number; year: number; monthName: string } | null;
  loading: boolean;
  isRamadan: boolean;
  ramadanDay: number;
}

/**
 * Hook that fetches official JAKIM Hijri date, falling back to algorithmic conversion.
 * Caches the JAKIM result for the current day.
 */
export function useHijriDate(): HijriDateResult {
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  const fallback = gregorianToHijri(today);
  const fallbackStr = formatHijriDate(today);

  const [hijriDate, setHijriDate] = useState(fallbackStr);
  const [hijriParts, setHijriParts] = useState<HijriDateResult['hijriParts']>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Check sessionStorage cache first
    const cacheKey = `jakim_hijri_${todayKey}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setHijriDate(parsed.date);
        setHijriParts(parsed.parts);
        setLoading(false);
        return;
      } catch {}
    }

    fetchJakimHijriDate(today).then(jakimDate => {
      if (cancelled) return;
      if (jakimDate) {
        // Parse the JAKIM date string \"19 Sha'ban 1447 H\" to extract parts
        const match = jakimDate.match(/^(\d+)\s+(.+?)\s+(\d+)\s+H$/);
        if (match) {
          const HIJRI_MONTHS = [
            'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
            'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
            'Ramadhan', 'Shawwal', 'Dhul Qa\'dah', 'Dhul Hijjah',
          ];
          const day = parseInt(match[1]);
          const monthName = match[2];
          const year = parseInt(match[3]);
          const monthIdx = HIJRI_MONTHS.findIndex(m => m === monthName) + 1;
          const parts = { day, month: monthIdx || fallback.month, year, monthName };
          setHijriDate(jakimDate);
          setHijriParts(parts);
          // Cache in sessionStorage
          sessionStorage.setItem(cacheKey, JSON.stringify({ date: jakimDate, parts }));
        } else {
          setHijriDate(jakimDate);
        }
      }
      // If JAKIM fails, keep the algorithmic fallback (already set)
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [todayKey]);

  const isRamadan = hijriParts?.month === 9;
  const ramadanDay = isRamadan ? (hijriParts?.day || 0) : 0;

  return { hijriDate, hijriParts, loading, isRamadan, ramadanDay };
}

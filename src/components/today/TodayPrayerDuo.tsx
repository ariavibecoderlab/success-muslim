import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sunrise, Sun, CloudSun, Sunset, Moon, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrayerSettings } from '@/hooks/usePrayerSettings';
import {
  fetchPrayerTimes,
  formatPrayerTime,
  getNextPrayerIndex,
  type PrayerTimesData,
} from '@/lib/prayer-times';

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

export default function TodayPrayerDuo() {
  const { settings, loading } = usePrayerSettings();
  const [data, setData] = useState<PrayerTimesData | null>(null);

  const hasLocation = !!(
    settings && (settings.latitude != null || (settings.city && settings.country))
  );

  useEffect(() => {
    if (loading || !hasLocation) return;
    fetchPrayerTimes(settings).then(d => d && setData(d)).catch(() => {});
  }, [loading, hasLocation, settings]);

  if (loading || (hasLocation && !data)) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (!hasLocation) {
    return (
      <Link to="/iman/prayer-times">
        <Card className="p-4 rounded-2xl border-emerald-200 bg-emerald-50/50">
          <p className="text-sm font-semibold text-emerald-900">Setup prayer times</p>
          <p className="text-xs text-emerald-700/80 mt-0.5">Pick your location to begin</p>
        </Card>
      </Link>
    );
  }

  const nextIdx = getNextPrayerIndex(data!.timings);
  const now = data!.timings[nextIdx];
  const next = data!.timings[(nextIdx + 1) % data!.timings.length];
  const NowIcon = PRAYER_ICONS[nextIdx] || Sun;
  const NextIcon = PRAYER_ICONS[(nextIdx + 1) % PRAYER_ICONS.length] || Moon;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Link to="/iman/prayer-times">
        <Card className="p-3.5 rounded-2xl border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-md transition-shadow h-full">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/80">• Now</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-emerald-900">{now?.name}</p>
            <NowIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1 tabular-nums">
            {formatPrayerTime(now?.time || '')}
          </p>
        </Card>
      </Link>
      <Link to="/iman/prayer-times">
        <Card className="p-3.5 rounded-2xl border-border bg-card hover:shadow-md transition-shadow h-full">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Next</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base font-bold">{next?.name}</p>
            <NextIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1 mt-1 text-foreground">
            <span className="text-base font-semibold">View</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </Card>
      </Link>
    </div>
  );
}

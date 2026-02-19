import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sunrise, Sun, CloudSun, Sunset, Moon, CheckCircle2, CircleDot, CircleX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  fetchPrayerTimes,
  formatPrayerTime,
  getNextPrayerIndex,
  getCurrentPrayerIndex,
  getCountdownToNextPrayer,
  type PrayerTimesData,
} from '@/lib/prayer-times';
import {
  getTodaySalah,
  logSalah,
  type SalahStatus,
  type SalahName,
  SALAH_NAMES,
} from '@/lib/salah-storage';
import type { WidgetSize } from '@/lib/widget-registry';

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];
const API_TO_SALAH: Record<string, SalahName> = {
  Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha',
};

const STATUS_OPTIONS: { value: SalahStatus; label: string; icon: typeof CheckCircle2; colorClass: string }[] = [
  { value: 'ontime', label: 'On Time', icon: CheckCircle2, colorClass: 'text-primary' },
  { value: 'late', label: 'Late', icon: CircleDot, colorClass: 'text-accent-foreground' },
  { value: 'missed', label: 'Missed', icon: CircleX, colorClass: 'text-destructive' },
  { value: null, label: 'Clear', icon: CircleDot, colorClass: 'text-muted-foreground' },
];

export default function NextPrayerWidget({ size }: { size: WidgetSize }) {
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [salahLog, setSalahLog] = useState(getTodaySalah());
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    fetchPrayerTimes().then(d => d && setPrayerData(d));
  }, []);

  useEffect(() => {
    if (!prayerData) return;
    const nextIdx = getNextPrayerIndex(prayerData.timings);
    const tick = () => setCountdown(getCountdownToNextPrayer(prayerData.timings, nextIdx));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [prayerData]);

  const handleSalahStatus = useCallback((prayer: SalahName, status: SalahStatus) => {
    setSalahLog(logSalah(prayer, status));
  }, []);

  if (!prayerData) return null;

  const nextIdx = getNextPrayerIndex(prayerData.timings);
  const nextPrayer = prayerData.timings[nextIdx];
  const NextIcon = PRAYER_ICONS[nextIdx] || Sun;

  const prayers = prayerData.timings.map((t, i) => ({
    name: t.name,
    key: t.key as SalahName,
    time: formatPrayerTime(t.time),
    icon: PRAYER_ICONS[i],
    current: i === nextIdx,
    status: salahLog.prayers[API_TO_SALAH[t.key]]?.status ?? null,
  }));

  if (size === 'small') {
    return (
      <Link to="/iman/prayer-times">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <NextIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{nextPrayer?.name}</p>
              <p className="text-[10px] text-muted-foreground">in {countdown}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <NextIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{nextPrayer?.name} · in {countdown}</p>
              <p className="text-[10px] text-muted-foreground">{prayerData.city}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {prayers.map(p => {
            const statusColor = p.status === 'ontime' ? 'text-primary' : p.status === 'late' ? 'text-accent-foreground' : p.status === 'missed' ? 'text-destructive' : 'text-muted-foreground';
            const StatusIcon = p.status === 'ontime' ? CheckCircle2 : p.status === 'late' ? CircleDot : p.status === 'missed' ? CircleX : null;

            return (
              <Popover key={p.name}>
                <PopoverTrigger asChild>
                  <button className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors cursor-pointer hover:bg-secondary/80 ${
                    p.status === 'ontime' ? 'bg-primary/10 ring-1 ring-primary/20' :
                    p.status === 'late' ? 'bg-accent/10 ring-1 ring-accent/20' :
                    p.status === 'missed' ? 'bg-destructive/5 ring-1 ring-destructive/20' :
                    p.current ? 'bg-primary/5 ring-1 ring-primary/10' : ''
                  }`}>
                    <p.icon className={`h-3.5 w-3.5 ${p.status ? statusColor : p.current ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-[9px] font-medium ${p.status ? statusColor : 'text-muted-foreground'}`}>{p.name}</span>
                    <span className="text-[8px] text-muted-foreground">{p.time}</span>
                    {StatusIcon && <StatusIcon className={`h-2.5 w-2.5 ${statusColor}`} />}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-36 p-1.5" align="center" side="bottom">
                  <p className="text-[10px] font-medium text-muted-foreground px-2 py-1">{p.name}</p>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={String(opt.value)}
                      onClick={() => handleSalahStatus(p.key, opt.value)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-secondary transition-colors ${p.status === opt.value ? 'bg-secondary font-medium' : ''}`}
                    >
                      <opt.icon className={`h-3.5 w-3.5 ${opt.colorClass}`} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

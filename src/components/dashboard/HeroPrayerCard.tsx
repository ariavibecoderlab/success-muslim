import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sunrise, Sun, CloudSun, Sunset, Moon, CheckCircle2, Star, Clock, Bell } from 'lucide-react';
import { usePrayerSettings } from '@/hooks/usePrayerSettings';
import { toast } from 'sonner';
import { requestNotificationPermission, getNotificationPermission } from '@/hooks/usePrayerNotifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchPrayerTimes,
  formatPrayerTime,
  getNextPrayerIndex,
  getCountdownToNextPrayer,
  type PrayerTimesData,
} from '@/lib/prayer-times';
import { type SalahName, SALAH_NAMES } from '@/lib/salah-storage';
import { useSalahLog, useSalahMutation, useTodaySalahCount } from '@/hooks/useSalahQuery';
import { getTodayKey } from '@/lib/calculations';

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

export default function HeroPrayerCard() {
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [countdown, setCountdown] = useState('');
  const today = getTodayKey();
  const { data: salahLog } = useSalahLog(today);
  const salahMutation = useSalahMutation();
  const salahCount = useTodaySalahCount();

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

  const handleLogPrayer = useCallback((prayer: SalahName) => {
    salahMutation.mutate({ prayer, status: 'ontime', date: today });
  }, [today, salahMutation]);

  if (!prayerData) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-2xl overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-3 w-24 bg-white/20" />
          <Skeleton className="h-7 w-40 bg-white/20" />
          <Skeleton className="h-4 w-32 bg-white/20" />
          <Skeleton className="h-1.5 w-full bg-white/20" />
        </CardContent>
      </Card>
    );
  }

  const allDone = salahCount.logged >= 5;
  const nextIdx = getNextPrayerIndex(prayerData.timings);
  const nextPrayer = prayerData.timings[nextIdx];
  const NextIcon = PRAYER_ICONS[nextIdx] || Sun;
  const nextSalahName = nextPrayer?.key as SalahName;
  const nextAlreadyLogged = salahLog?.prayers[nextSalahName]?.status != null;

  if (allDone) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-2xl overflow-hidden">
        <CardContent className="p-4 text-center relative">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
          <Star className="h-8 w-8 mx-auto mb-2 text-yellow-200" />
          <p className="text-xl font-bold">MasyaAllah!</p>
          <p className="text-sm opacity-90 mt-1">Semua solat hari ini selesai</p>
          <div className="flex justify-center gap-2 mt-3">
            {SALAH_NAMES.map((name, i) => {
              const Icon = PRAYER_ICONS[i];
              return (
                <div key={name} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to="/iman/prayer-times">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-2xl overflow-hidden">
        <CardContent className="p-4 relative">
          {/* Decorative moon */}
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />

          {/* Label */}
          <p className="text-[10px] uppercase tracking-widest font-semibold text-white/60 mb-1.5">Next Prayer</p>

          {/* Prayer name + time */}
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-2xl font-bold leading-tight">{nextPrayer?.name}</p>
            </div>
            <p className="text-2xl font-bold leading-tight">{formatPrayerTime(nextPrayer?.time || '')}</p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-1.5 text-white/70 mb-2.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">in {countdown}</span>
          </div>

          {/* Progress bar */}
          <Progress value={(salahCount.logged / 5) * 100} className="h-1.5 bg-white/20 [&>div]:bg-white mb-1.5" />
          <p className="text-[11px] text-white/60">{salahCount.logged} of 5 prayers done today</p>

          {/* Buttons */}
          {!nextAlreadyLogged && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="flex-1 bg-white text-emerald-700 hover:bg-white/90 border-0 text-xs h-8 rounded-lg font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogPrayer(nextSalahName);
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Log {nextPrayer?.name}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 text-xs h-8 rounded-lg font-semibold"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const perm = getNotificationPermission();
                  if (perm === 'granted') {
                    toast.success(`Reminder set for ${nextPrayer?.name} at ${formatPrayerTime(nextPrayer?.time || '')}`);
                  } else if (perm === 'denied') {
                    toast.error('Notifications blocked. Please enable them in your browser settings.');
                  } else {
                    const result = await requestNotificationPermission();
                    if (result === 'granted') {
                      toast.success(`Reminder set for ${nextPrayer?.name} at ${formatPrayerTime(nextPrayer?.time || '')}`);
                    } else {
                      toast.error('Notification permission is required for reminders.');
                    }
                  }
                }}
              >
                <Bell className="h-3.5 w-3.5 mr-1.5" />
                Remind me
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

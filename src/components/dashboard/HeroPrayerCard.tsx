import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sunrise, Sun, CloudSun, Sunset, Moon, CheckCircle2, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

  if (!prayerData) return null;

  const allDone = salahCount.logged >= 5;
  const nextIdx = getNextPrayerIndex(prayerData.timings);
  const nextPrayer = prayerData.timings[nextIdx];
  const NextIcon = PRAYER_ICONS[nextIdx] || Sun;
  const nextSalahName = nextPrayer?.key as SalahName;
  const nextAlreadyLogged = salahLog?.prayers[nextSalahName]?.status != null;

  if (allDone) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <CardContent className="p-4 text-center">
          <Star className="h-8 w-8 mx-auto mb-2 text-yellow-200" />
          <p className="text-sm font-bold">MasyaAllah!</p>
          <p className="text-xs opacity-90">Semua solat hari ini selesai</p>
          <div className="flex justify-center gap-1.5 mt-3">
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
      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <NextIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">{nextPrayer?.name}</p>
                <p className="text-sm opacity-80">{formatPrayerTime(nextPrayer?.time || '')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70">dalam</p>
              <p className="text-sm font-semibold">{countdown}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-[10px] opacity-70 mb-1">
              <span>Solat hari ini</span>
              <span>{salahCount.logged}/5</span>
            </div>
            <Progress value={(salahCount.logged / 5) * 100} className="h-1.5 bg-white/20 [&>div]:bg-white" />
          </div>

          <div className="flex gap-1.5">
            {SALAH_NAMES.map((name, i) => {
              const status = salahLog?.prayers[name]?.status;
              const Icon = PRAYER_ICONS[i];
              return (
                <div
                  key={name}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[9px] ${
                    status ? 'bg-white/25' : 'bg-white/10'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{name.slice(0, 3)}</span>
                  {status && <CheckCircle2 className="h-2.5 w-2.5" />}
                </div>
              );
            })}
          </div>

          {!nextAlreadyLogged && (
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white border-0 text-xs h-8"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogPrayer(nextSalahName);
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Log {nextPrayer?.name}
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

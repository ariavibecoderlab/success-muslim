import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Flame, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  fetchPrayerTimes,
  getEffectiveTime,
} from '@/lib/prayer-times';

interface RamadanBannerProps {
  ramadanDay: number;
}

export default function RamadanBanner({ ramadanDay }: RamadanBannerProps) {
  const [iftarCountdown, setIftarCountdown] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    fetchPrayerTimes().then(data => {
      if (!data) return;
      const maghrib = data.timings.find(t => t.key === 'Maghrib');
      if (!maghrib) return;
      const tick = () => {
        const [h, m] = getEffectiveTime(maghrib).split(':').map(Number);
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
        const diff = target - now.getTime();
        if (diff <= 0) {
          setIftarCountdown('Sudah iftar!');
          return;
        }
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        setIftarCountdown(`${hrs}j ${mins}m`);
      };
      tick();
      interval = setInterval(tick, 60000);
    });
    return () => clearInterval(interval);
  }, []);

  const progress = (ramadanDay / 30) * 100;
  const isLast10 = ramadanDay > 20;
  const isLailatulQadr = ramadanDay === 27;

  let specialTitle = '';
  let specialSubtitle = '';
  if (isLailatulQadr) {
    specialTitle = 'Malam Laylatul Qadr — Lebih baik dari 1000 bulan';
    specialSubtitle = `Iftar dalam ${iftarCountdown} · Perbanyak ibadah malam ini`;
  } else if (isLast10) {
    specialTitle = '10 Malam Terakhir — Cari Laylatul Qadr';
    specialSubtitle = `Iftar dalam ${iftarCountdown} · Perbanyak ibadah malam ini`;
  } else {
    specialSubtitle = `Iftar dalam ${iftarCountdown}`;
  }

  return (
    <Link to="/health/fasting">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-700 to-orange-800 text-white rounded-2xl overflow-hidden">
        <CardContent className="p-5 relative">
          {/* Decorative crescent */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />

          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <p className="text-sm font-bold">Ramadan Day {ramadanDay} of 30</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <Flame className="h-3.5 w-3.5 text-yellow-200" />
              <span className="text-xs font-medium">{ramadanDay} day streak</span>
            </div>
          </div>

          {/* Special message */}
          {specialTitle && (
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-200 flex-shrink-0" />
              <p className="text-base font-bold">{specialTitle}</p>
            </div>
          )}

          {/* Subtitle */}
          {specialSubtitle && (
            <p className="text-xs opacity-80 mb-4">{specialSubtitle}</p>
          )}

          {/* Progress */}
          <p className="text-[11px] opacity-60 mb-1.5">{Math.round(progress)}% of Ramadan complete</p>
          <Progress value={progress} className="h-1.5 bg-white/20 [&>div]:bg-white" />
        </CardContent>
      </Card>
    </Link>
  );
}

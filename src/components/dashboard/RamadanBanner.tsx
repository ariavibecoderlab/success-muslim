import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  fetchPrayerTimes,
  getEffectiveTime,
  type PrayerTimesData,
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
        let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
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

  let specialMessage = '';
  if (isLailatulQadr) {
    specialMessage = 'Malam Laylatul Qadr — Lebih baik dari 1000 bulan';
  } else if (isLast10) {
    specialMessage = 'Masuk 10 malam terakhir — cari Laylatul Qadr';
  }

  return (
    <Link to="/health/fasting">
      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <p className="text-sm font-bold">Ramadan Hari {ramadanDay} / 30</p>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-yellow-200" />
              <span className="text-xs font-medium">{ramadanDay} hari</span>
            </div>
          </div>

          {specialMessage && (
            <p className="text-[11px] opacity-90 mb-2">{specialMessage}</p>
          )}

          <div className="flex items-center justify-between text-[10px] opacity-80 mb-1">
            <span>Iftar dalam {iftarCountdown}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-white/20 [&>div]:bg-white" />
        </CardContent>
      </Card>
    </Link>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useHijriDate } from '@/hooks/useHijriDate';
import { fetchPrayerTimes, getCountdownToNextPrayer, type PrayerTimesData } from '@/lib/prayer-times';
import type { WidgetSize } from '@/lib/widget-registry';

export default function RamadanFastingWidget({ size }: { size: WidgetSize }) {
  const { isRamadan, ramadanDay } = useHijriDate();
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [iftarCountdown, setIftarCountdown] = useState('');

  useEffect(() => {
    fetchPrayerTimes().then(d => d && setPrayerData(d));
  }, []);

  useEffect(() => {
    if (!prayerData) return;
    // Maghrib = index 3
    const tick = () => setIftarCountdown(getCountdownToNextPrayer(prayerData.timings, 3));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [prayerData]);

  if (!isRamadan) return null;

  if (size === 'small') {
    return (
      <Link to="/iman/ramadan">
        <Card className="hover:shadow-sm transition-shadow bg-primary/5">
          <CardContent className="p-3 text-center">
            <Moon className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">Day {ramadanDay}</p>
            <p className="text-[9px] text-muted-foreground">Ramadan</p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to="/iman/ramadan">
      <Card className="hover:shadow-sm transition-shadow bg-primary/5 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Moon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">🌙 Ramadan Fasting</p>
              <p className="text-xs text-muted-foreground">Iftar in {iftarCountdown}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Day {ramadanDay} of 30</span>
            <span className="flex items-center gap-0.5">
              {ramadanDay} day streak <Flame className="h-3 w-3 text-accent-foreground" />
            </span>
          </div>
          <Progress value={(ramadanDay / 30) * 100} className="h-1.5 mt-2" />
        </CardContent>
      </Card>
    </Link>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHijriDate } from '@/hooks/useHijriDate';
import {
  fetchPrayerTimes,
  getNextPrayerIndex,
  getCountdownToNextPrayer,
  formatPrayerTime,
  type PrayerTimesData,
} from '@/lib/prayer-times';

interface RotatingHeaderProps {
  firstName: string;
  isRamadan: boolean;
  ramadanDay: number;
  greeting: string;
}

export default function RotatingHeader({ firstName, isRamadan, ramadanDay, greeting }: RotatingHeaderProps) {
  const { hijriDate } = useHijriDate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [countdown, setCountdown] = useState('');

  const gregorianDate = new Date().toLocaleDateString('ms-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const titles = [
    `Salaam, ${firstName || 'Muslim'}`,
    hijriDate || '',
    gregorianDate,
  ].filter(Boolean);

  useEffect(() => {
    fetchPrayerTimes().then(d => d && setPrayerData(d));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(i => (i + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [titles.length]);

  useEffect(() => {
    if (!prayerData) return;
    const nextIdx = getNextPrayerIndex(prayerData.timings);
    const tick = () => setCountdown(getCountdownToNextPrayer(prayerData.timings, nextIdx));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [prayerData]);

  const nextPrayer = prayerData
    ? prayerData.timings[getNextPrayerIndex(prayerData.timings)]
    : null;

  const subtitle = isRamadan && ramadanDay > 0
    ? `Ramadan Hari ${ramadanDay} · ${nextPrayer ? nextPrayer.name + ' ' + formatPrayerTime(nextPrayer.time) : ''}`
    : nextPrayer
      ? `${nextPrayer.name} · ${formatPrayerTime(nextPrayer.time)} · ${countdown}`
      : greeting;

  return (
    <div className="flex flex-col min-w-0">
      <div className="h-5 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 text-sm font-bold tracking-tight text-foreground truncate"
          >
            {titles[activeIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

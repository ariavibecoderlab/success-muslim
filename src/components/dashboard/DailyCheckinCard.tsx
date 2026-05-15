import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { Sparkles, Check, BookOpen, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';
import { useTodaySalahCount } from '@/hooks/useSalahQuery';
import { useQuranReadingLog } from '@/hooks/useQuranReadingLog';

const POINTS = [10, 10, 15, 20, 25, 30, 150];

function CheckinSlide() {
  const { claimedToday, streakDay, pointsToday, claim, claiming } = useDailyCheckin();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <p className="text-sm font-semibold">
            {claimedToday ? 'Sudah check-in hari ini' : 'Daily Check-in'}
          </p>
        </div>
        {!claimedToday && (
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs h-8 px-4 rounded-full font-semibold"
            onClick={() => claim()}
            disabled={claiming}
          >
            {claiming ? 'Claiming…' : `Claim +${pointsToday}`}
          </Button>
        )}
        {claimedToday && (
          <span className="text-xs text-muted-foreground font-medium">+{pointsToday} pts</span>
        )}
      </div>
      <div className="flex items-center justify-center gap-1.5">
        {POINTS.map((pts, i) => {
          const dayNum = i + 1;
          const isDone = claimedToday ? dayNum <= streakDay : dayNum < streakDay;
          const isCurrent = dayNum === streakDay;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-800 text-white'
                    : isCurrent && !claimedToday
                      ? 'ring-2 ring-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : dayNum}
              </div>
              <span className="text-[9px] text-muted-foreground">+{pts}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SolatSlide() {
  const navigate = useNavigate();
  const salah = useTodaySalahCount();

  return (
    <div
      className="p-4 cursor-pointer"
      onClick={() => navigate('/deen-journey')}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="h-3.5 w-3.5 text-amber-500" />
          <p className="text-sm font-semibold">Track Solat</p>
        </div>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {salah.logged}/5 logged
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">
        {salah.logged === 0
          ? 'Belum ada solat dilog hari ini. Jom track!'
          : salah.logged === 5
            ? 'Alhamdulillah, semua solat dilog! 🎉'
            : `${salah.onTime} on time, ${salah.late} late${salah.missed ? `, ${salah.missed} missed` : ''}`}
      </p>
      <div className="flex gap-1 mt-2">
        {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) => (
          <div
            key={name}
            className={`flex-1 h-1.5 rounded-full ${
              salah.logged > 0 ? 'bg-emerald-500/30' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function QuranSlide() {
  const navigate = useNavigate();
  const { todayTotalPages, todayTotalAyahs, streak } = useQuranReadingLog();

  return (
    <div
      className="p-4 cursor-pointer"
      onClick={() => navigate('/deen-journey')}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-amber-500" />
          <p className="text-sm font-semibold">Bacaan Quran</p>
        </div>
        {streak > 0 && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            🔥 {streak} hari
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">
        {todayTotalPages > 0 || todayTotalAyahs > 0
          ? `Hari ini: ${todayTotalPages} halaman, ${todayTotalAyahs} ayat`
          : 'Belum baca Quran hari ini. Jom baca!'}
      </p>
      <div className="w-full h-1.5 rounded-full bg-muted mt-2">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{ width: `${Math.min((todayTotalPages / 5) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function DailyCheckinCard() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    loop: true,
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  // Auto-rotate every 5s
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden relative">
      <div ref={emblaRef} className="overflow-hidden" style={{ height: 110 }}>
        <div className="flex flex-col" style={{ height: 110 }}>
          <div className="min-h-0 shrink-0 grow-0" style={{ flexBasis: '100%' }}>
            <CheckinSlide />
          </div>
          <div className="min-h-0 shrink-0 grow-0" style={{ flexBasis: '100%' }}>
            <SolatSlide />
          </div>
          <div className="min-h-0 shrink-0 grow-0" style={{ flexBasis: '100%' }}>
            <QuranSlide />
          </div>
        </div>
      </div>
      {/* Dot indicators */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              selectedIndex === i ? 'bg-amber-500 h-3' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </Card>
  );
}

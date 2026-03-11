import { useState, useMemo } from 'react';
import { Check, Moon, Flame, Calendar, ChevronLeft, ChevronRight, Sun, Sunrise, Sunset } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SubPageLayout from '@/components/SubPageLayout';
import { useFastingLog, useFastingToggle } from '@/hooks/useHealthQuery';
import { usePrayerSettings } from '@/hooks/usePrayerSettings';
import { fetchPrayerTimes, formatPrayerTime, getEffectiveTime, type PrayerTimesData } from '@/lib/prayer-times';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isFuture, subDays, isBefore, startOfDay } from 'date-fns';
import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';

const IMAN_SIBLINGS = [
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/fasting', label: 'Fasting' },
  { path: '/iman/zakat', label: 'Zakat' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type FastingType = 'monday' | 'thursday' | 'white' | 'arafah' | 'ashura' | 'shawwal' | 'other';

const FASTING_TYPES: Record<FastingType, { label: string; description: string }> = {
  monday: { label: 'Monday', description: 'Sunnah - The Prophet ﷺ fasted Mondays' },
  thursday: { label: 'Thursday', description: 'Sunnah - The Prophet ﷺ fasted Thursdays' },
  white: { label: 'Ayyamul Bidh', description: '13th, 14th, 15th of Hijri month' },
  arafah: { label: 'Day of Arafah', description: '9th Dhul Hijjah' },
  ashura: { label: 'Ashura', description: '10th Muharram' },
  shawwal: { label: '6 of Shawwal', description: 'After Ramadan' },
  other: { label: 'Other', description: 'Voluntary fasting' },
};

const DeenFasting = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [highlightPicker, setHighlightPicker] = useState(false);
  const { data: fastingLog } = useFastingLog();
  const fastingToggle = useFastingToggle();
  const { settings, loading: settingsLoading } = usePrayerSettings();
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);

  // Load prayer times for suhoor/iftar
  const loadPrayer = useCallback(async () => {
    const result = await fetchPrayerTimes(settings);
    setPrayerData(result);
  }, [settings]);

  useEffect(() => {
    if (!settingsLoading) loadPrayer();
  }, [settingsLoading, loadPrayer]);

  // fastingLog is held in state above
  const minDate = subDays(startOfDay(new Date()), 90);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const getFastingType = (date: Date): FastingType | null => {
    const day = getDay(date);
    const dayOfMonth = date.getDate();
    if (day === 1) return 'monday';
    if (day === 4) return 'thursday';
    if (dayOfMonth >= 13 && dayOfMonth <= 15) return 'white';
    return null;
  };

  const isRecommended = (date: Date) => {
    return getFastingType(date) !== null;
  };

  const handleToggle = (dateKey: string) => {
    fastingToggle.mutate(dateKey);
  };

  // Stats
  const allFastedDates = Object.keys(fastingLog).filter(k => fastingLog[k]);
  const totalFastedAllTime = allFastedDates.length;
  const totalFastedThisMonth = days.filter(d => fastingLog[format(d, 'yyyy-MM-dd')]).length;
  const recommendedThisMonth = days.filter(d => isRecommended(d)).length;
  const recommendedHit = days.filter(d => isRecommended(d) && fastingLog[format(d, 'yyyy-MM-dd')]).length;

  // Streak
  const fastingStreak = useMemo(() => {
    let count = 0;
    const today = new Date();
    const d = new Date(today);
    for (let i = 0; i < 365; i++) {
      const key = format(d, 'yyyy-MM-dd');
      const dayOfWeek = getDay(d);
      // Only count recommended days for streak
      if (dayOfWeek === 1 || dayOfWeek === 4) {
        if (fastingLog[key]) count++;
        else if (i > 0) break;
      }
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [fastingLog]);

  // Suhoor & Iftar times from prayer data
  const fajrTime = prayerData?.timings.find(t => t.key === 'Fajr');
  const maghribTime = prayerData?.timings.find(t => t.key === 'Maghrib');

  // Next recommended fasting day
  const nextRecommended = useMemo(() => {
    const today = new Date();
    const d = new Date(today);
    for (let i = 0; i < 30; i++) {
      d.setDate(today.getDate() + i);
      if (isRecommended(d) && !fastingLog[format(d, 'yyyy-MM-dd')]) {
        const type = getFastingType(d);
        return { date: d, type };
      }
    }
    return null;
  }, [fastingLog]);

  return (
    <SubPageLayout title="Fasting Tracker" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/fasting">
      <div className="space-y-5">
        <BackdatePrompt moduleKey="deen-fasting" onLogPastData={() => {
          const y = new Date(); y.setDate(y.getDate() - 1);
          setSelectedDate(y); setCurrentMonth(y); setHighlightPicker(true);
        }} />
        <BackdateDatePicker selectedDate={selectedDate} onDateChange={(d) => { setSelectedDate(d); setCurrentMonth(d); }} compact highlight={highlightPicker} />

        {/* Suhoor & Iftar Card */}
        {prayerData && fajrTime && maghribTime && (
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 rounded-xl shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Moon className="h-5 w-5 text-white/80" />
                  </div>
                  <div>
                     <p className="text-[10px] text-white/70 uppercase tracking-wider">Today's Fasting</p>
                    <p className="text-xs text-white/60 mt-0.5">
                      {isRecommended(new Date()) ? `Recommended: ${FASTING_TYPES[getFastingType(new Date())!].label}` : 'No sunnah fast today'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={fastingLog[format(new Date(), 'yyyy-MM-dd')] ? 'default' : 'outline'}
                  onClick={() => handleToggle(format(new Date(), 'yyyy-MM-dd'))}
                  className="gap-1"
                >
                  {fastingLog[format(new Date(), 'yyyy-MM-dd')] ? (
                    <><Check className="h-3 w-3" /> Fasting</>
                  ) : 'Log Fast'}
                </Button>
              </div>

               <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Sunrise className="h-4 w-4 text-white/70 mx-auto mb-1" />
                  <p className="text-[10px] text-white/60">Suhoor ends</p>
                  <p className="text-sm font-bold">{formatPrayerTime(getEffectiveTime(fajrTime))}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Sunset className="h-4 w-4 text-white/70 mx-auto mb-1" />
                  <p className="text-[10px] text-white/60">Iftar</p>
                  <p className="text-sm font-bold">{formatPrayerTime(getEffectiveTime(maghribTime))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2">
           <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Flame className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{fastingStreak}</p>
              <p className="text-[9px] text-muted-foreground">Streak</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{totalFastedThisMonth}</p>
              <p className="text-[9px] text-muted-foreground">This Month</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Moon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{totalFastedAllTime}</p>
              <p className="text-[9px] text-muted-foreground">All Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Sunnah progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Sunnah Days This Month</h3>
              <span className="text-xs text-muted-foreground">{recommendedHit}/{recommendedThisMonth}</span>
            </div>
            <Progress value={recommendedThisMonth > 0 ? (recommendedHit / recommendedThisMonth) * 100 : 0} className="h-1.5" />
            {nextRecommended && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Next: {FASTING_TYPES[nextRecommended.type!].label} — {format(nextRecommended.date, 'EEEE, d MMM')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Month nav */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar */}
        <Card>
          <CardContent className="p-3">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map(day => {
                const key = format(day, 'yyyy-MM-dd');
                const fasted = !!fastingLog[key];
                const recommended = isRecommended(day);
                const isWhiteDay = day.getDate() >= 13 && day.getDate() <= 15;
                const today = isToday(day);
                const future = isFuture(day);
                const tooOld = isBefore(startOfDay(day), minDate);
                const disabled = future || tooOld;
                return (
                  <motion.button
                    key={key}
                    onClick={() => !disabled && handleToggle(key)}
                    whileTap={!disabled ? { scale: 0.9 } : {}}
                    className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center transition-all relative
                      ${fasted ? 'bg-primary text-primary-foreground shadow-sm' : 
                        recommended ? (isWhiteDay ? 'bg-accent/30 hover:bg-accent/50' : 'bg-secondary hover:bg-secondary/80') : 
                        'hover:bg-secondary/50'}
                      ${today ? 'ring-2 ring-primary/50 ring-offset-1 ring-offset-background' : ''}
                      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    disabled={disabled}
                  >
                    <span className="font-medium">{day.getDate()}</span>
                    {fasted && <Check className="h-2 w-2 absolute bottom-0.5" />}
                    {recommended && !fasted && (
                      <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary/50" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex gap-3 text-[10px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-secondary" /> Mon/Thu</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent/30" /> White Days</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary" /> Fasted</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary/50" /> Recommended</span>
        </div>

        {/* Hadith */}
        <Card className="bg-secondary/30 border-none">
          <CardContent className="p-4 text-center">
            <Moon className="h-5 w-5 mx-auto text-primary mb-2" />
            <p className="text-xs text-muted-foreground italic">
              "The Prophet ﷺ used to fast on Mondays and Thursdays."
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">— Tirmidhi</p>
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default DeenFasting;

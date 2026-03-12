import { Link } from 'react-router-dom';
import {
  Clock, CalendarCheck, Calculator, ChevronRight, Flame, Target,
  BookOpen, Star, HandHeart, ListChecks, Moon, Sunrise, Sun, Sunset,
  Settings2, MapPin, BarChart3, Heart, Compass, Megaphone,
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { useQadaSolat, useRamadhanQada } from '@/hooks/useQadaQuery';
import { useFidyahHistory } from '@/hooks/useFidyahQuery';
import { estimateCompletionDays, formatYearsMonths, getTodayKey } from '@/lib/calculations';
import { useSunnahStats, useSunnahLog } from '@/hooks/useSunnahQuery';
import { useDhikrDaily } from '@/hooks/useDhikrQuery';
import { useTodaySalahCount } from '@/hooks/useSalahQuery';
import { useHijriDate } from '@/hooks/useHijriDate';
import { Skeleton } from '@/components/ui/skeleton';
import { calcIman, type LifeScoreInput } from '@/lib/life-score';
import { getQuranDay } from '@/lib/quran-storage';
import { getFastingLog, todayKey } from '@/lib/health-storage';
import { usePrayerSettings } from '@/hooks/usePrayerSettings';
import { useQuranReadingLog } from '@/hooks/useQuranReadingLog';
import {
  fetchPrayerTimes,
  getNextPrayerIndex,
  getCurrentPrayerIndex,
  formatPrayerTime,
  getEffectiveTime,
  getCountdownToNextPrayer,
  type PrayerTimesData,
} from '@/lib/prayer-times';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect, useCallback } from 'react';

// ── Animation variants ────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ── StatsRing (matching Health) ───────────────────

const StatsRing = ({ pct, size = 56, stroke = 4, color, children }: {
  pct: number; size?: number; stroke?: number; color: string; children: React.ReactNode;
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="text-muted/20" stroke="currentColor" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          stroke={color}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// ── Prayer icons ──────────────────────────────────

const PRAYER_ICONS: Record<string, React.ReactNode> = {
  Fajr: <Sunrise className="h-3.5 w-3.5" />,
  Dhuhr: <Sun className="h-3.5 w-3.5" />,
  Asr: <Sun className="h-3.5 w-3.5" />,
  Maghrib: <Sunset className="h-3.5 w-3.5" />,
  Isha: <Moon className="h-3.5 w-3.5" />,
};

// ── Spiritual tools config ────────────────────────

const spiritualTools = [
  { icon: Target, title: 'Salah Log', path: '/iman/salah-log' },
  { icon: BookOpen, title: 'Quran', path: '/iman/quran' },
  { icon: HandHeart, title: 'Dhikr Counter', path: '/iman/dhikr' },
  { icon: ListChecks, title: 'Sunnah Tracker', path: '/iman/sunnah' },
  { icon: Calculator, title: 'Zakat', path: '/iman/zakat' },
  { icon: Heart, title: 'Sadaqah', path: '/iman/sadaqah' },
  { icon: Moon, title: 'Qiyam Planner', path: '/iman/qiyam' },
  { icon: Star, title: 'Ramadan', path: '/iman/ramadan' },
  { icon: Compass, title: 'Hajj & Umrah', path: '/iman/hajj' },
  { icon: Megaphone, title: 'Daily Da\'wah', path: '/iman/dakwah' },
];

const Iman = () => {
  const { settings, loading: settingsLoading } = usePrayerSettings();
  const { hasDoneToday: isDoneToday, streak: quranStreak, todayTotalPages, todayTotalAyahs } = useQuranReadingLog();
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [countdown, setCountdown] = useState('');

  const loadPrayer = useCallback(async () => {
    const result = await fetchPrayerTimes(settings);
    setPrayerData(result);
  }, [settings]);

  useEffect(() => {
    if (!settingsLoading) loadPrayer();
  }, [settingsLoading, loadPrayer]);

  // Countdown timer
  const nextIdx = prayerData ? getNextPrayerIndex(prayerData.timings) : 0;
  const currentIdx = prayerData ? getCurrentPrayerIndex(prayerData.timings) : -1;

  useEffect(() => {
    if (!prayerData) return;
    const tick = () => setCountdown(getCountdownToNextPrayer(prayerData.timings, nextIdx));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [prayerData, nextIdx]);

  // Data from React Query hooks
  const { data: qadaData } = useQadaSolat();
  const { data: ramadhanData } = useRamadhanQada();
  const { data: fidyahHistory = [] } = useFidyahHistory();
  const qadaSetup = qadaData?.setup ?? null;
  const qadaProgress = qadaData?.progress ?? { completedByPrayer: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, totalCompleted: 0, currentStreak: 0, longestStreak: 0, lastCompletedDate: null, dailyLogs: {} };
  const ramadhanSetup = ramadhanData?.setup ?? null;
  const ramadhanProgress = ramadhanData?.progress ?? { completedDates: [], currentStreak: 0, longestStreak: 0 };
  const hasQada = !!qadaSetup;
  const hasRamadhan = !!ramadhanSetup;
  const hasFidyah = fidyahHistory.length > 0;

  const { streak: sunnahStreak, items: allSunnahItems } = useSunnahStats();
  const { data: sunnahLog } = useSunnahLog();
  const sunnahItems = allSunnahItems.filter(i => i.enabled);
  const sunnahDone = sunnahLog.completed.filter(id => sunnahItems.find(i => i.id === id)).length;
  const { data: dailyDhikr } = useDhikrDaily();
  const salahCount = useTodaySalahCount();

  const { hijriDate, isRamadan, ramadanDay } = useHijriDate();
  const gregorianDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const nextPrayer = prayerData?.timings[nextIdx];

  // Iman score
  const imanInput = useMemo((): LifeScoreInput => {
    const quranDay = getQuranDay();
    const fastLog = getFastingLog();
    const tk = todayKey();
    return {
      salah: { onTime: salahCount.onTime, late: salahCount.late, logged: salahCount.logged },
      quranPagesRead: quranDay.pagesRead,
      sunnahEnabled: sunnahItems.length,
      sunnahCompleted: sunnahDone,
      dhikrCount: dailyDhikr?.totalCount ?? 0,
      isFastingToday: !!fastLog[tk],
      hydrationCups: 0, hydrationGoal: 8, sleepHours: null,
      mitsTotal: 0, mitsCompleted: 0, habitsTotal: 0, habitsDoneToday: 0,
    };
  }, [salahCount, sunnahItems, sunnahDone, dailyDhikr]);
  const imanPillar = calcIman(imanInput);
  const imanScore = imanPillar.score;

  // Stats ring percentages
  const salahPct = Math.round((salahCount.logged / 5) * 100);
  const dhikrPct = Math.min(Math.round((dailyDhikr?.totalCount ?? 0) / 100 * 100), 100);
  const quranPct = isDoneToday ? 100 : 0;
  const sunnahPct = sunnahItems.length > 0 ? Math.round((sunnahDone / sunnahItems.length) * 100) : 0;

  // Tool descriptions
  const getToolDesc = (path: string) => {
    switch (path) {
      case '/iman/quran':
        return isDoneToday
          ? `${todayTotalAyahs} ayah · ${todayTotalPages} pg`
          : quranStreak > 0 ? `${quranStreak}d streak · read today?` : 'Start reading';
      case '/iman/dhikr':
        return dailyDhikr.totalCount > 0 ? `${dailyDhikr.totalCount} today` : 'No dhikr yet today';
      case '/iman/sunnah':
        return sunnahItems.length > 0 ? `${sunnahDone}/${sunnahItems.length} done` : 'Set up checklist';
      case '/iman/salah-log':
        return `${salahCount.logged}/5 logged today`;
      case '/iman/zakat': return 'Calculate your zakat';
      case '/iman/sadaqah': return 'Track your giving';
      case '/iman/qiyam': return 'Tahajjud scheduler';
      case '/iman/ramadan': return 'Optimizer & tracker';
      case '/iman/hajj': return 'Step-by-step guide';
      case '/iman/dakwah': return 'Share daily reminders';
      default: return '';
    }
  };

  // Build tracker rows to merge into tools
  const trackerRows: { icon: typeof Clock; title: string; path: string; subtitle: string; pct?: number }[] = [];
  if (hasQada) {
    const remaining = qadaSetup!.totalPrayers - qadaProgress.totalCompleted;
    const pct = Math.round((qadaProgress.totalCompleted / qadaSetup!.totalPrayers) * 100);
    trackerRows.push({ icon: Clock, title: 'Qada Solat', path: '/qada-solat/track', subtitle: `${remaining.toLocaleString()} left · ${pct}%`, pct });
  } else {
    trackerRows.push({ icon: Clock, title: 'Qada Solat', path: '/qada-solat/setup', subtitle: 'Setup tracker' });
  }
  if (hasRamadhan) {
    const remaining = ramadhanSetup!.totalDays - ramadhanProgress.completedDates.length;
    const pct = Math.round((ramadhanProgress.completedDates.length / ramadhanSetup!.totalDays) * 100);
    trackerRows.push({ icon: CalendarCheck, title: 'Ramadhan Qada', path: '/ramadhan-qada/track', subtitle: `${remaining} days left · ${pct}%`, pct });
  } else {
    trackerRows.push({ icon: CalendarCheck, title: 'Ramadhan Qada', path: '/ramadhan-qada/setup', subtitle: 'Setup tracker' });
  }
  trackerRows.push({
    icon: Calculator,
    title: 'Fidyah',
    path: '/fidyah',
    subtitle: hasFidyah ? `Last: ${fidyahHistory[0].currency} ${fidyahHistory[0].total.toFixed(2)}` : 'Calculate fidyah',
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Iman" />

      <main className="max-w-md mx-auto w-full px-5 py-6 space-y-5 pb-28">

        {/* ── Prayer Times Hero Card ──────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <Link to="/iman/prayer-times">
            {prayerData && nextPrayer ? (
              <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-orange-600 to-orange-700 text-white">
                <CardContent className="p-5">
                  {isRamadan && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        Ramadan Day {ramadanDay}/30
                      </span>
                      <div className="flex-1 mx-3 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/50 rounded-full" style={{ width: `${(ramadanDay / 30) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Star className="h-6 w-6" />
                      </motion.div>
                      <div>
                        <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Next Prayer</p>
                        <p className="text-lg font-black tracking-tight leading-tight">{nextPrayer.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black tabular-nums tracking-tight">{countdown}</p>
                      <p className="text-[10px] text-white/70">
                        {formatPrayerTime(getEffectiveTime(nextPrayer))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-2">
                    {prayerData.timings.map((p, i) => (
                      <div
                        key={p.key}
                        className={`flex flex-col items-center gap-0.5 flex-1 ${
                          i === nextIdx ? 'text-white font-bold' :
                          i <= currentIdx ? 'text-white/40' : 'text-white/70'
                        }`}
                      >
                        <span className="text-[9px]">{p.name}</span>
                        <span className={`text-[11px] tabular-nums ${i === nextIdx ? 'font-bold' : ''}`}>
                          {formatPrayerTime(getEffectiveTime(p)).replace(/ (AM|PM)/, '')}
                        </span>
                        {i <= currentIdx && (
                          <div className="w-1 h-1 rounded-full bg-white/40" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-[10px] text-white/60">
                    <span>{hijriDate}{settings.city ? ` · ${settings.city}` : ''}</span>
                    <span>{gregorianDate}</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Skeleton className="h-16 rounded-xl" />
            )}
          </Link>
        </motion.div>

        {/* ── Iman Stats Rings + Score ────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today's Progress</h2>
        </motion.div>
        <motion.div className="grid grid-cols-4 gap-3" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={salahPct} color="hsl(25, 95%, 48%)">
              <span className="text-sm font-bold">{salahCount.logged}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-orange-600/80">Salah</p>
              <p className="text-[9px] text-muted-foreground">{salahCount.logged}/5</p>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={dhikrPct} color="hsl(25, 95%, 55%)">
              <span className="text-[10px] font-bold">{dailyDhikr?.totalCount ?? 0}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-orange-500/80">Dhikr</p>
              <p className="text-[9px] text-muted-foreground">count</p>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={quranPct} color="hsl(20, 90%, 42%)">
              <span className="text-sm font-bold">{isDoneToday ? '✓' : '—'}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-orange-700/80">Quran</p>
              <p className="text-[9px] text-muted-foreground">{todayTotalPages > 0 ? `${todayTotalPages} pg` : 'today'}</p>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={sunnahPct} color="hsl(25, 95%, 48%)">
              <span className="text-sm font-bold">{sunnahDone}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-orange-600/80">Sunnah</p>
              <p className="text-[9px] text-muted-foreground">{sunnahDone}/{sunnahItems.length}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Iman Score Bar ─────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-2 shrink-0">
              <BarChart3 className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-xs font-semibold">Iman Score</span>
            </div>
            <div className="flex-1 h-1.5 bg-orange-100 dark:bg-orange-950/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${imanScore}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
              />
            </div>
            <span className="text-xs font-bold text-orange-600 tabular-nums">{imanScore}</span>
          </div>
        </motion.div>

        {/* ── Spiritual Tools (compact rows) ─── */}
        <div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Spiritual Tools</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {spiritualTools.map((f) => (
              <motion.div key={f.path} variants={staggerItem}>
                <Link to={f.path} className="flex items-center gap-3 py-2.5 border-b border-border/30 active:scale-[0.98] transition-transform">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center shrink-0">
                    <f.icon className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold leading-tight">{f.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{getToolDesc(f.path)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Trackers (compact rows) ────────── */}
        <div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trackers</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {trackerRows.map((t) => (
              <motion.div key={t.title} variants={staggerItem}>
                <Link to={t.path} className="flex items-center gap-3 py-2.5 border-b border-border/30 active:scale-[0.98] transition-transform">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center shrink-0">
                    <t.icon className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold leading-tight">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{t.subtitle}</p>
                  </div>
                  {t.pct !== undefined && (
                    <span className="text-[11px] font-bold text-orange-600 tabular-nums shrink-0">{t.pct}%</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="h-4" />
      </main>
    </div>
  );
};

export default Iman;

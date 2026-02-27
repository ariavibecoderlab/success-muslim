import { Link } from 'react-router-dom';
import {
  Clock, CalendarCheck, Calculator, ChevronRight, Flame, Target,
  BookOpen, Star, HandHeart, ListChecks, Moon, Sunrise, Sun, Sunset,
  Settings2, MapPin, BarChart3, Heart, Compass, Megaphone,
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getQadaSetup, getQadaProgress, getRamadhanSetup, getRamadhanProgress, getFidyahHistory } from '@/lib/storage';
import { estimateCompletionDays, formatYearsMonths, getTodayKey } from '@/lib/calculations';
import { useSunnahStats, useSunnahLog } from '@/hooks/useSunnahQuery';
import { useDhikrDaily } from '@/hooks/useDhikrQuery';
import { useTodaySalahCount } from '@/hooks/useSalahQuery';
import { useHijriDate } from '@/hooks/useHijriDate';
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
import { motion, AnimatePresence } from 'framer-motion';
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

// ── Iman Quotes ───────────────────────────────────

const IMAN_QUOTES = [
  { text: "Verily, in the remembrance of Allah do hearts find rest.", source: "Quran 13:28" },
  { text: "The best of you are those who learn the Quran and teach it.", source: "Sahih Bukhari" },
  { text: "Prayer is the pillar of the religion.", source: "Hadith" },
  { text: "Whoever treads a path seeking knowledge, Allah will ease his way to Paradise.", source: "Sahih Muslim" },
  { text: "The five daily prayers are an expiation for what comes in between them.", source: "Sahih Muslim" },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Bukhari & Muslim" },
  { text: "The most beloved deed to Allah is the most regular and constant even if it were little.", source: "Sahih Bukhari" },
];

// ── Prayer icons ──────────────────────────────────

const PRAYER_ICONS: Record<string, React.ReactNode> = {
  Fajr: <Sunrise className="h-3.5 w-3.5" />,
  Dhuhr: <Sun className="h-3.5 w-3.5" />,
  Asr: <Sun className="h-3.5 w-3.5" />,
  Maghrib: <Sunset className="h-3.5 w-3.5" />,
  Isha: <Moon className="h-3.5 w-3.5" />,
};

// ── Feature card config ───────────────────────────

const spiritualTools = [
  { icon: BookOpen, title: 'Quran', path: '/iman/quran', gradient: 'from-amber-500 to-amber-600' },
  { icon: HandHeart, title: 'Dhikr Counter', path: '/iman/dhikr', gradient: 'from-pink-500 to-rose-600' },
  { icon: ListChecks, title: 'Sunnah Tracker', path: '/iman/sunnah', gradient: 'from-purple-500 to-purple-600' },
  { icon: Star, title: 'Prayer Times', path: '/iman/prayer-times', gradient: 'from-blue-500 to-blue-600' },
  { icon: Calculator, title: 'Zakat', path: '/iman/zakat', gradient: 'from-emerald-500 to-emerald-600' },
  { icon: Heart, title: 'Sadaqah', path: '/iman/sadaqah', gradient: 'from-rose-500 to-rose-600' },
  { icon: Moon, title: 'Qiyam Planner', path: '/iman/qiyam', gradient: 'from-indigo-500 to-indigo-600' },
  { icon: Star, title: 'Ramadan', path: '/iman/ramadan', gradient: 'from-orange-500 to-orange-600' },
  { icon: Compass, title: 'Hajj & Umrah', path: '/iman/hajj', gradient: 'from-teal-500 to-teal-600' },
  { icon: Megaphone, title: 'Daily Da\'wah', path: '/iman/dakwah', gradient: 'from-violet-500 to-violet-600' },
];

const Iman = () => {
  const { settings, loading: settingsLoading } = usePrayerSettings();
  const { hasDoneToday: isDoneToday, streak: quranStreak, todayTotalPages, todayTotalAyahs } = useQuranReadingLog();
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [countdown, setCountdown] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);

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

  // Quote rotation
  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setQuoteIndex(dayOfYear % IMAN_QUOTES.length);
  }, []);

  // Local data
  const qadaSetup = getQadaSetup();
  const qadaProgress = getQadaProgress();
  const ramadhanSetup = getRamadhanSetup();
  const ramadhanProgress = getRamadhanProgress();
  const fidyahHistory = getFidyahHistory();
  const hasQada = !!qadaSetup;
  const hasRamadhan = !!ramadhanSetup;
  const hasFidyah = fidyahHistory.length > 0;
  const hasAnyTracker = hasQada || hasRamadhan || hasFidyah;

  const todayQada = useMemo(() => {
    const today = getTodayKey();
    const log = qadaProgress.dailyLogs[today];
    return log ? Object.values(log).reduce((s: number, v: any) => s + v, 0) : 0;
  }, [qadaProgress]);

  const { streak: sunnahStreak, items: allSunnahItems } = useSunnahStats();
  const { data: sunnahLog } = useSunnahLog();
  const sunnahItems = allSunnahItems.filter(i => i.enabled);
  const sunnahDone = sunnahLog.completed.filter(id => sunnahItems.find(i => i.id === id)).length;
  const { data: dailyDhikr } = useDhikrDaily();
  const salahCount = useTodaySalahCount();

  const { hijriDate } = useHijriDate();
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

  // Tool descriptions for feature grid
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
      case '/iman/prayer-times':
        return nextPrayer ? `${nextPrayer.name} in ${countdown.split(' ').slice(0, 2).join(' ')}` : 'View times';
      case '/iman/zakat': return 'Calculate your zakat';
      case '/iman/sadaqah': return 'Track your giving';
      case '/iman/qiyam': return 'Tahajjud scheduler';
      case '/iman/ramadan': return 'Optimizer & tracker';
      case '/iman/hajj': return 'Step-by-step guide';
      case '/iman/dakwah': return 'Share daily reminders';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Iman" />

      <main className="max-w-md mx-auto w-full px-5 py-6 space-y-5 pb-28">

        {/* ── Prayer Times Hero Card ──────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <Link to="/iman/prayer-times">
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
              <CardContent className="p-5">
                {prayerData && nextPrayer ? (
                  <>
                    {/* Next prayer + countdown */}
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

                    {/* All 5 prayer times strip */}
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
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/70">Loading prayer times...</p>
                    <Settings2 className="h-4 w-4 text-white/50" />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* ── Date + Location ────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-center">
          <p className="text-sm font-semibold text-primary">{hijriDate}</p>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <p className="text-[11px] text-muted-foreground">{gregorianDate}</p>
            {settings.city && (
              <>
                <span className="text-[11px] text-muted-foreground">·</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" />{settings.city}
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* ── Iman Quote Banner ──────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card
            className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 cursor-pointer overflow-hidden"
            onClick={() => setQuoteIndex((prev) => (prev + 1) % IMAN_QUOTES.length)}
          >
            <CardContent className="p-3.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-1"
                >
                  <p className="text-xs font-medium text-foreground leading-relaxed">"{IMAN_QUOTES[quoteIndex].text}"</p>
                  <p className="text-[10px] text-muted-foreground">— {IMAN_QUOTES[quoteIndex].source}</p>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-1 mt-2">
                {IMAN_QUOTES.map((_, i) => (
                  <div key={i} className={`w-1 h-1 rounded-full transition-colors ${i === quoteIndex ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Iman Stats Rings ───────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today's Progress</h2>
        </motion.div>
        <motion.div className="grid grid-cols-4 gap-3" initial="hidden" animate="visible" variants={staggerContainer}>
          {/* Salah */}
          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={salahPct} color="hsl(160, 84%, 39%)">
              <span className="text-sm font-bold">{salahCount.logged}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-emerald-600">Salah</p>
              <p className="text-[9px] text-muted-foreground">{salahCount.logged}/5</p>
            </div>
          </motion.div>

          {/* Dhikr */}
          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={dhikrPct} color="hsl(330, 81%, 60%)">
              <span className="text-[10px] font-bold">{dailyDhikr?.totalCount ?? 0}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-pink-600">Dhikr</p>
              <p className="text-[9px] text-muted-foreground">count</p>
            </div>
          </motion.div>

          {/* Quran */}
          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={quranPct} color="hsl(38, 92%, 50%)">
              <span className="text-sm font-bold">{isDoneToday ? '✓' : '—'}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-amber-600">Quran</p>
              <p className="text-[9px] text-muted-foreground">{todayTotalPages > 0 ? `${todayTotalPages} pg` : 'today'}</p>
            </div>
          </motion.div>

          {/* Sunnah */}
          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={sunnahPct} color="hsl(271, 91%, 65%)">
              <span className="text-sm font-bold">{sunnahDone}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-purple-600">Sunnah</p>
              <p className="text-[9px] text-muted-foreground">{sunnahDone}/{sunnahItems.length}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Spiritual Tools Grid ───────────── */}
        <div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Spiritual Tools</h2>
          </motion.div>
          <motion.div className="grid grid-cols-2 gap-2.5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {spiritualTools.map((f) => (
              <motion.div key={f.path} variants={staggerItem}>
                <Link to={f.path}>
                  <Card className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                    <CardContent className="p-3.5 flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shrink-0`}>
                        <f.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold leading-tight">{f.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{getToolDesc(f.path)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}

            {/* Iman Score card */}
            <motion.div variants={staggerItem}>
              <Card className="cursor-default">
                <CardContent className="p-3.5 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold leading-tight">Iman Score</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      {imanScore}/100 · {imanScore >= 80 ? 'Excellent' : imanScore >= 60 ? 'Good' : imanScore >= 40 ? 'Building' : 'Needs work'}
                    </p>
                    <Progress value={imanScore} className="h-1 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Active Trackers ────────────────── */}
        {hasAnyTracker && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Active Trackers
            </h2>
            <div className="space-y-3">
              {hasQada && (
                <Link to="/qada-solat/track">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">Qada Solat</h3>
                            <p className="text-[10px] text-muted-foreground">
                              {(qadaSetup!.totalPrayers - qadaProgress.totalCompleted).toLocaleString()} remaining · ~{formatYearsMonths(estimateCompletionDays(qadaSetup!, qadaProgress.totalCompleted))} left
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          {(() => { const p = (qadaProgress.totalCompleted / qadaSetup!.totalPrayers) * 100; return p < 1 && qadaProgress.totalCompleted > 0 ? '<1' : Math.round(p); })()}%
                        </span>
                      </div>
                      <Progress value={(() => { const p = (qadaProgress.totalCompleted / qadaSetup!.totalPrayers) * 100; return qadaProgress.totalCompleted > 0 ? Math.max(p, 0.5) : 0; })()} className="h-1.5" />
                      <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Target className="h-2.5 w-2.5" /> Today: {todayQada}/{qadaSetup!.dailyTarget}</span>
                        <span className="flex items-center gap-0.5"><Flame className="h-2.5 w-2.5" /> {qadaProgress.currentStreak}d streak</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {hasRamadhan && (
                <Link to="/ramadhan-qada/track">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <CalendarCheck className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">Ramadhan Qada</h3>
                            <p className="text-[10px] text-muted-foreground">
                              {ramadhanSetup!.totalDays - ramadhanProgress.completedDates.length} days remaining
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          {Math.round((ramadhanProgress.completedDates.length / ramadhanSetup!.totalDays) * 100)}%
                        </span>
                      </div>
                      <Progress value={(ramadhanProgress.completedDates.length / ramadhanSetup!.totalDays) * 100} className="h-1.5" />
                    </CardContent>
                  </Card>
                </Link>
              )}

              {hasFidyah && (
                <Link to="/fidyah">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                          <Calculator className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Fidyah</h3>
                          <p className="text-[10px] text-muted-foreground">
                            Last: {fidyahHistory[0].currency} {fidyahHistory[0].total.toFixed(2)} ({fidyahHistory[0].days} days)
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Setup Actions ──────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {hasAnyTracker ? 'More Trackers' : 'Get Started'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock, title: 'Qada Solat', to: hasQada ? '/qada-solat/track' : '/qada-solat/setup', active: hasQada, gradient: 'from-blue-500 to-blue-600' },
              { icon: CalendarCheck, title: 'Ramadhan', to: hasRamadhan ? '/ramadhan-qada/track' : '/ramadhan-qada/setup', active: hasRamadhan, gradient: 'from-orange-500 to-orange-600' },
              { icon: Calculator, title: 'Fidyah', to: '/fidyah', active: hasFidyah, gradient: 'from-emerald-500 to-emerald-600' },
            ].map(item => (
              <Link key={item.title} to={item.to}>
                <Card className={`hover:shadow-sm transition-shadow ${item.active ? 'border-primary/20 bg-primary/5' : ''}`}>
                  <CardContent className="p-3 flex flex-col items-center gap-1.5 text-center">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      item.active ? `bg-gradient-to-br ${item.gradient}` : 'bg-secondary'
                    }`}>
                      <item.icon className={`h-4 w-4 ${item.active ? 'text-white' : 'text-secondary-foreground'}`} />
                    </div>
                    <span className="text-[11px] font-medium">{item.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="h-4" />
      </main>
    </div>
  );
};

export default Iman;

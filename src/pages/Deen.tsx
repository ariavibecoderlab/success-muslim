import { Link } from 'react-router-dom';
import {
  Clock, CalendarCheck, Calculator, ChevronRight, Flame, Target,
  BookOpen, Star, HandHeart, ListChecks, Moon, Sunrise, Sun, Sunset,
  Settings2, MapPin, BarChart3, Droplets,
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getQadaSetup, getQadaProgress, getRamadhanSetup, getRamadhanProgress, getFidyahHistory } from '@/lib/storage';
import { estimateCompletionDate, getTodayKey } from '@/lib/calculations';
import { getSunnahStreak, getDayLog, getSunnahItems } from '@/lib/sunnah-storage';
import { getDailyDhikr } from '@/lib/dhikr-storage';
import { getTodaySalahCount } from '@/lib/salah-storage';
import { formatHijriDate } from '@/lib/hijri';
import { usePrayerSettings } from '@/hooks/usePrayerSettings';
import { useQuranPrefs, useQuranSessions } from '@/hooks/useQuranData';
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

const PRAYER_ICONS: Record<string, React.ReactNode> = {
  Fajr: <Sunrise className="h-3.5 w-3.5" />,
  Dhuhr: <Sun className="h-3.5 w-3.5" />,
  Asr: <Sun className="h-3.5 w-3.5" />,
  Maghrib: <Sunset className="h-3.5 w-3.5" />,
  Isha: <Moon className="h-3.5 w-3.5" />,
};

const Deen = () => {
  const [, forceUpdate] = useState(0);
  const { settings, loading: settingsLoading } = usePrayerSettings();
  const { prefs } = useQuranPrefs();
  const { getSessions } = useQuranSessions();
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [countdown, setCountdown] = useState('');
  const [quranSessions, setQuranSessions] = useState<any[]>([]);

  useEffect(() => {
    const onFocus = () => forceUpdate(n => n + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Load prayer times
  const loadPrayer = useCallback(async () => {
    const result = await fetchPrayerTimes(settings);
    setPrayerData(result);
  }, [settings]);

  useEffect(() => {
    if (!settingsLoading) loadPrayer();
  }, [settingsLoading, loadPrayer]);

  // Load Quran sessions
  useEffect(() => {
    getSessions(30).then(s => setQuranSessions(s || []));
  }, []);

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

  const sunnahStreak = getSunnahStreak();
  const sunnahLog = getDayLog();
  const sunnahItems = getSunnahItems().filter(i => i.enabled);
  const sunnahDone = sunnahLog.completed.filter(id => sunnahItems.find(i => i.id === id)).length;
  const dailyDhikr = getDailyDhikr();
  const salahCount = getTodaySalahCount();

  // Quran stats
  const todayQuranPages = quranSessions
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((sum: number, s: any) => sum + Number(s.pages_read || 0), 0);
  const quranStreak = (() => {
    const dates = new Set(quranSessions.map((s: any) => s.date));
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      if (dates.has(d.toISOString().split('T')[0])) count++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();
  const totalAyahsRead = quranSessions.reduce((s: number, r: any) => s + (r.ayahs_read || 0), 0);
  const quranCompletion = Math.min(100, Math.round((totalAyahsRead / 6236) * 100));

  const hijriDate = formatHijriDate(new Date());
  const gregorianDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const nextPrayer = prayerData?.timings[nextIdx];

  // Deen score (simple: salah weight 50, sunnah 20, quran 15, dhikr 15)
  const deenScore = Math.round(
    (salahCount.logged / 5) * 50 +
    (sunnahItems.length > 0 ? (sunnahDone / sunnahItems.length) : 0) * 20 +
    Math.min(1, todayQuranPages / Math.max(1, prefs.daily_goal_pages)) * 15 +
    Math.min(1, dailyDhikr.totalCount / 100) * 15
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Iman" />

      <main className="max-w-4xl mx-auto px-5 py-4 space-y-4 pb-28">

        {/* Date header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="text-center"
        >
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

        {/* Prayer Times Hero Card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Link to="/deen/prayer-times">
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
              <CardContent className="p-4">
                {prayerData && nextPrayer ? (
                  <>
                    {/* Next prayer + countdown */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                          {PRAYER_ICONS[nextPrayer.key]}
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Next Prayer</p>
                          <p className="text-lg font-bold text-primary leading-tight">{nextPrayer.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold tabular-nums tracking-tight">{countdown}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatPrayerTime(getEffectiveTime(nextPrayer))}
                        </p>
                      </div>
                    </div>

                    {/* All 5 prayer times strip */}
                    <div className="flex items-center justify-between bg-background/50 rounded-lg p-2">
                      {prayerData.timings.map((p, i) => (
                        <div
                          key={p.key}
                          className={`flex flex-col items-center gap-0.5 flex-1 ${
                            i === nextIdx ? 'text-primary font-bold' :
                            i <= currentIdx ? 'text-muted-foreground/60' : 'text-muted-foreground'
                          }`}
                        >
                          <span className="text-[9px]">{p.name}</span>
                          <span className={`text-[11px] tabular-nums ${i === nextIdx ? 'font-bold' : ''}`}>
                            {formatPrayerTime(getEffectiveTime(p)).replace(/ (AM|PM)/, '')}
                          </span>
                          {i <= currentIdx && (
                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Loading prayer times...</p>
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Deen Summary Strip */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {[
              { icon: Star, label: `${salahCount.logged}/5`, sub: 'Salah', to: '/dashboard' },
              { icon: HandHeart, label: `${dailyDhikr.totalCount}`, sub: 'Dhikr', to: '/deen/dhikr' },
              { icon: BookOpen, label: `${todayQuranPages.toFixed(1)}p`, sub: 'Quran', to: '/deen/quran' },
              { icon: ListChecks, label: `${sunnahDone}/${sunnahItems.length}`, sub: 'Sunnah', to: '/deen/sunnah' },
            ].map(item => (
              <Link key={item.sub} to={item.to} className="flex-1 min-w-0">
                <Card className="hover:border-primary/20 transition-all">
                  <CardContent className="p-2.5 text-center">
                    <item.icon className="h-4 w-4 text-primary mx-auto" />
                    <p className="text-sm font-bold leading-tight mt-0.5">{item.label}</p>
                    <p className="text-[9px] text-muted-foreground">{item.sub}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Spiritual Tools — Icon Grid with Live Data */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Spiritual Tools
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Quran */}
            <Link to="/deen/quran">
              <Card className="hover:border-primary/20 transition-all h-full">
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Quran</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {quranCompletion > 0
                      ? `${quranCompletion}% complete${quranStreak > 0 ? ` · ${quranStreak}d streak` : ''}`
                      : 'Start reading'}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Dhikr */}
            <Link to="/deen/dhikr">
              <Card className="hover:border-primary/20 transition-all h-full">
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <HandHeart className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Dhikr Counter</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {dailyDhikr.totalCount > 0
                      ? `${dailyDhikr.totalCount} today · ${dailyDhikr.sessions.length} sessions`
                      : 'No dhikr yet today'}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Sunnah */}
            <Link to="/deen/sunnah">
              <Card className="hover:border-primary/20 transition-all h-full">
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Sunnah Tracker</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {sunnahItems.length > 0
                      ? `${sunnahDone}/${sunnahItems.length} done${sunnahStreak > 0 ? ` · ${sunnahStreak}d streak` : ''}`
                      : 'Set up your checklist'}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Prayer Times */}
            <Link to="/deen/prayer-times">
              <Card className="hover:border-primary/20 transition-all h-full">
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Prayer Times</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {nextPrayer ? `${nextPrayer.name} in ${countdown.split(' ').slice(0, 2).join(' ')}` : 'View times'}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Zakat */}
            <Link to="/deen/zakat">
              <Card className="hover:border-primary/20 transition-all h-full">
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <Calculator className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Zakat</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Calculate your zakat
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Deen Score */}
            <Card className="h-full">
              <CardContent className="p-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-semibold">Deen Score</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {deenScore}/100 · {deenScore >= 80 ? 'Excellent' : deenScore >= 60 ? 'Good' : deenScore >= 40 ? 'Building' : 'Needs work'}
                </p>
                <Progress value={deenScore} className="h-1 mt-1.5" />
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Active Trackers */}
        {hasAnyTracker && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
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
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">Qada Solat</h3>
                            <p className="text-[10px] text-muted-foreground">
                              {qadaSetup!.totalPrayers - qadaProgress.totalCompleted} remaining · Est. {estimateCompletionDate(qadaSetup!, qadaProgress.totalCompleted)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          {Math.round((qadaProgress.totalCompleted / qadaSetup!.totalPrayers) * 100)}%
                        </span>
                      </div>
                      <Progress value={(qadaProgress.totalCompleted / qadaSetup!.totalPrayers) * 100} className="h-1.5" />
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
                          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                            <CalendarCheck className="h-4 w-4 text-accent-foreground" />
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
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calculator className="h-4 w-4 text-primary" />
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

        {/* Setup Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {hasAnyTracker ? 'More Trackers' : 'Get Started'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock, title: 'Qada Solat', to: hasQada ? '/qada-solat/track' : '/qada-solat/setup', active: hasQada },
              { icon: CalendarCheck, title: 'Ramadhan', to: hasRamadhan ? '/ramadhan-qada/track' : '/ramadhan-qada/setup', active: hasRamadhan },
              { icon: Calculator, title: 'Fidyah', to: '/fidyah', active: hasFidyah },
            ].map(item => (
              <Link key={item.title} to={item.to}>
                <Card className={`hover:shadow-sm transition-shadow ${item.active ? 'border-primary/20 bg-primary/5' : ''}`}>
                  <CardContent className="p-3 flex flex-col items-center gap-1.5 text-center">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      item.active ? 'bg-primary/10' : 'bg-secondary'
                    }`}>
                      <item.icon className={`h-4 w-4 ${item.active ? 'text-primary' : 'text-secondary-foreground'}`} />
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

export default Deen;

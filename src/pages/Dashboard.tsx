import { Link, useNavigate } from 'react-router-dom';
import {
  Clock, CalendarCheck, Calculator, ChevronRight, Flame, Target,
  Moon, BookOpen, Droplets, Sun, Sunrise, Sunset, CloudSun,
  TrendingUp, CheckCircle2, Star, Heart, Sparkles, Settings, Shield, Megaphone,
  CircleDot, CircleAlert, CircleX, ListChecks, BedDouble, Plus,
  Utensils, Hand,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { getQadaSetup, getQadaProgress, getRamadhanSetup, getRamadhanProgress, getFidyahHistory } from '@/lib/storage';
import { estimateCompletionDate, getTodayKey } from '@/lib/calculations';
import { fetchPrayerTimes, formatPrayerTime, getNextPrayerIndex, getCurrentPrayerIndex, type PrayerTimesData } from '@/lib/prayer-times';
import { formatHijriDate } from '@/lib/hijri';
import { getSunnahStreak, getDayLog, getSunnahItems } from '@/lib/sunnah-storage';
import { getDailyDhikr } from '@/lib/dhikr-storage';
import { getTodaySalah, logSalah, getTodaySalahCount, type SalahStatus, type SalahName, SALAH_NAMES } from '@/lib/salah-storage';
import { getHydration, addCup, getSleepLog, todayKey as healthTodayKey } from '@/lib/health-storage';
import { getDailyTasks, getHabits, getHabitLog, getTodayKey as prodTodayKey } from '@/lib/productivity-storage';
import { calculateLifeScore, getScoreColor, getScoreLabel } from '@/lib/life-score';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import EditableText from '@/components/cms/EditableText';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

const STATUS_OPTIONS: { value: SalahStatus; label: string; icon: typeof CheckCircle2; colorClass: string }[] = [
  { value: 'ontime', label: 'On Time', icon: CheckCircle2, colorClass: 'text-primary' },
  { value: 'late', label: 'Late', icon: CircleDot, colorClass: 'text-accent-foreground' },
  { value: 'missed', label: 'Missed', icon: CircleX, colorClass: 'text-destructive' },
  { value: null, label: 'Clear', icon: CircleAlert, colorClass: 'text-muted-foreground' },
];

const API_TO_SALAH: Record<string, SalahName> = {
  Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha',
};

const QUOTES = [
  { text: '"The best of you are those who learn the Quran and teach it."', source: '— Sahih al-Bukhari' },
  { text: '"Verily, with hardship comes ease."', source: '— Quran 94:6' },
  { text: '"The strongest among you is the one who controls his anger."', source: '— Sahih al-Bukhari' },
];

// Life Score Ring component
const ScoreRing = ({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'hsl(var(--primary))' : score >= 50 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [, forceUpdate] = useState(0);
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [displayName, setDisplayName] = useState('');
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string }[]>([]);
  const [salahLog, setSalahLog] = useState(getTodaySalah());
  const navigate = useNavigate();

  const handleSalahStatus = useCallback((prayer: SalahName, status: SalahStatus) => {
    const updated = logSalah(prayer, status);
    setSalahLog(updated);
    forceUpdate(n => n + 1); // refresh life score
  }, []);

  useEffect(() => {
    const onFocus = () => forceUpdate(n => n + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('display_name').eq('id', user.id).single()
        .then(({ data }) => { if (data?.display_name) setDisplayName(data.display_name); });
      supabase.from('announcements').select('id, title, content').eq('is_active', true)
        .order('created_at', { ascending: false }).limit(3)
        .then(({ data }) => { if (data) setAnnouncements(data); });
    }
  }, [user]);

  useEffect(() => {
    fetchPrayerTimes().then(data => { if (data) setPrayerData(data); });
  }, []);

  // Life Score
  const lifeScore = useMemo(() => calculateLifeScore(), [salahLog, forceUpdate]);

  // Today's data
  const salahCount = getTodaySalahCount();
  const hydration = getHydration();
  const daily = getDailyTasks();
  const mitsCompleted = daily.tasks.filter(t => t.isMIT && t.completed).length;
  const mitCount = daily.tasks.filter(t => t.isMIT).length;
  const allTasksDone = daily.tasks.filter(t => t.completed).length;
  const habits = getHabits();
  const habitLog = getHabitLog();
  const habitsToday = habitLog[prodTodayKey()]?.length || 0;
  const sleepLog = getSleepLog();
  const todaySleep = sleepLog.find(e => e.date === healthTodayKey());
  const dailyDhikr = getDailyDhikr();

  const qadaSetup = getQadaSetup();
  const qadaProgress = getQadaProgress();
  const ramadhanSetup = getRamadhanSetup();
  const ramadhanProgress = getRamadhanProgress();
  const fidyahHistory = getFidyahHistory();
  const hasQada = !!qadaSetup;
  const hasRamadhan = !!ramadhanSetup;
  const hasFidyah = fidyahHistory.length > 0;

  const hijriDate = formatHijriDate(new Date());
  const gregorianDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const prayers = prayerData
    ? prayerData.timings.map((t, i) => ({
        name: t.name, key: t.key as SalahName, time: formatPrayerTime(t.time),
        icon: PRAYER_ICONS[i],
        passed: i <= getCurrentPrayerIndex(prayerData.timings),
        current: i === getNextPrayerIndex(prayerData.timings),
        status: salahLog.prayers[API_TO_SALAH[t.key]]?.status ?? null,
      }))
    : SALAH_NAMES.map((key, i) => ({
        name: ['Subuh', 'Zohor', 'Asar', 'Maghrib', 'Isyak'][i], key,
        time: '—', icon: PRAYER_ICONS[i], passed: false, current: false,
        status: salahLog.prayers[key]?.status ?? null,
      }));

  // Quick log actions
  const quickLogs = [
    { icon: Star, label: 'Prayer', path: '/deen', bg: 'bg-primary/10', color: 'text-primary' },
    { icon: BookOpen, label: 'Quran', path: '/deen/sunnah', bg: 'bg-primary/10', color: 'text-primary' },
    { icon: Hand, label: 'Dhikr', path: '/deen/dhikr', bg: 'bg-accent/15', color: 'text-accent-foreground' },
    { icon: Utensils, label: 'Fast', path: '/health/fasting', bg: 'bg-accent/15', color: 'text-accent-foreground' },
    { icon: Droplets, label: 'Water', action: () => { addCup(); forceUpdate(n => n + 1); }, bg: 'bg-primary/10', color: 'text-primary' },
    { icon: BedDouble, label: 'Sleep', path: '/health/sleep', bg: 'bg-secondary', color: 'text-secondary-foreground' },
    { icon: ListChecks, label: 'Tasks', path: '/productivity/tasks', bg: 'bg-primary/10', color: 'text-primary' },
    { icon: Flame, label: 'Habits', path: '/productivity/habits', bg: 'bg-accent/15', color: 'text-accent-foreground' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-primary flex items-center gap-2">
            <Moon className="h-5 w-5" />
            <EditableText elementKey="nav.brand" defaultText="Success Muslim" tag="span" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{gregorianDate} · {hijriDate}</span>
            {isAdmin && (
              <Link to="/admin" className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" title="Admin Panel">
                <Shield className="h-4 w-4 text-primary" />
              </Link>
            )}
            <Link to="/settings" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-5 py-6 space-y-5">
        {/* Announcements */}
        {announcements.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            {announcements.map(a => (
              <Card key={a.id} className="bg-accent/10 border-accent/20 mb-2">
                <CardContent className="p-3 flex items-start gap-3">
                  <Megaphone className="h-4 w-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Greeting + Life Score */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Card className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-xl font-bold mb-0.5">Assalamualaikum{displayName ? `, ${displayName}` : ''} 👋</h1>
                  <p className="text-muted-foreground text-sm mb-4">Your daily Life Score</p>
                  {/* Pillar bars */}
                  <div className="space-y-2">
                    {lifeScore.pillars.map(p => (
                      <div key={p.label} className="flex items-center gap-2">
                        <span className="text-[10px] font-medium w-16 text-muted-foreground">{p.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              p.score >= 80 ? 'bg-primary' : p.score >= 50 ? 'bg-accent' : 'bg-destructive'
                            }`}
                            style={{ width: `${p.score}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold w-7 text-right">{p.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <ScoreRing score={lifeScore.total} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Log Buttons */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Log</p>
          <div className="grid grid-cols-4 gap-2">
            {quickLogs.map(q => (
              <button
                key={q.label}
                onClick={() => q.action ? q.action() : navigate(q.path!)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-border hover:shadow-sm transition-all active:scale-95"
              >
                <div className={`w-9 h-9 rounded-xl ${q.bg} flex items-center justify-center`}>
                  <q.icon className={`h-4 w-4 ${q.color}`} />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{q.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Today's Prayers */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Today's Prayers</h2>
                    <p className="text-xs text-muted-foreground">
                      {salahCount.logged}/5 logged
                      {salahCount.onTime > 0 && <span className="text-primary"> · {salahCount.onTime} on time</span>}
                      {salahCount.late > 0 && <span className="text-accent-foreground"> · {salahCount.late} late</span>}
                      {salahCount.missed > 0 && <span className="text-destructive"> · {salahCount.missed} missed</span>}
                    </p>
                  </div>
                </div>
                {prayerData && <span className="text-[10px] text-muted-foreground">{prayerData.city}</span>}
              </div>
              <div className="flex items-center gap-1">
                {prayers.map(p => {
                  const statusColor = p.status === 'ontime' ? 'text-primary' : p.status === 'late' ? 'text-accent-foreground' : p.status === 'missed' ? 'text-destructive' : 'text-muted-foreground';
                  const StatusIcon = p.status === 'ontime' ? CheckCircle2 : p.status === 'late' ? CircleDot : p.status === 'missed' ? CircleX : null;
                  return (
                    <Popover key={p.name}>
                      <PopoverTrigger asChild>
                        <button className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl transition-colors cursor-pointer hover:bg-secondary/80 ${
                          p.status === 'ontime' ? 'bg-primary/10 ring-1 ring-primary/20'
                          : p.status === 'late' ? 'bg-accent/10 ring-1 ring-accent/20'
                          : p.status === 'missed' ? 'bg-destructive/5 ring-1 ring-destructive/20'
                          : p.current ? 'bg-primary/5 ring-1 ring-primary/10' : ''
                        }`}>
                          <p.icon className={`h-4 w-4 ${p.status ? statusColor : p.current ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-[10px] font-medium ${p.status ? statusColor : 'text-muted-foreground'}`}>{p.name}</span>
                          <span className="text-[9px] text-muted-foreground">{p.time}</span>
                          {StatusIcon && <StatusIcon className={`h-3 w-3 ${statusColor}`} />}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-1.5" align="center" side="bottom">
                        <p className="text-[10px] font-medium text-muted-foreground px-2 py-1">{p.name}</p>
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={String(opt.value)}
                            onClick={() => handleSalahStatus(p.key, opt.value)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-secondary transition-colors ${
                              p.status === opt.value ? 'bg-secondary font-medium' : ''
                            }`}
                          >
                            <opt.icon className={`h-3.5 w-3.5 ${opt.colorClass}`} />
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today Overview Cards */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Today's Overview</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Water */}
            <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => navigate('/health/hydration')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">Water</span>
                </div>
                <p className="text-2xl font-bold">{hydration.cups}<span className="text-sm font-normal text-muted-foreground">/{hydration.goal}</span></p>
                <Progress value={(hydration.cups / hydration.goal) * 100} className="h-1.5 mt-2" />
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => navigate('/productivity/tasks')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">MITs</span>
                </div>
                <p className="text-2xl font-bold">{mitsCompleted}<span className="text-sm font-normal text-muted-foreground">/{mitCount}</span></p>
                <Progress value={mitCount > 0 ? (mitsCompleted / mitCount) * 100 : 0} className="h-1.5 mt-2" />
              </CardContent>
            </Card>

            {/* Habits */}
            <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => navigate('/productivity/habits')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-4 w-4 text-accent-foreground" />
                  <span className="text-xs font-semibold">Habits</span>
                </div>
                <p className="text-2xl font-bold">{habitsToday}<span className="text-sm font-normal text-muted-foreground">/{habits.length || '—'}</span></p>
                <Progress value={habits.length > 0 ? (habitsToday / habits.length) * 100 : 0} className="h-1.5 mt-2" />
              </CardContent>
            </Card>

            {/* Sleep */}
            <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => navigate('/health/sleep')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BedDouble className="h-4 w-4 text-secondary-foreground" />
                  <span className="text-xs font-semibold">Sleep</span>
                </div>
                <p className="text-2xl font-bold">
                  {todaySleep ? `${todaySleep.duration}` : '—'}
                  <span className="text-sm font-normal text-muted-foreground">{todaySleep ? 'h' : ''}</span>
                </p>
                <Progress value={todaySleep ? Math.min((todaySleep.duration / 8) * 100, 100) : 0} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Dhikr + Sunnah mini stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <BookOpen className="h-4 w-4 text-accent-foreground mx-auto mb-1" />
              <p className="text-lg font-bold">{dailyDhikr.totalCount}</p>
              <p className="text-[10px] text-muted-foreground">Dhikr</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Flame className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{getSunnahStreak() || 0}</p>
              <p className="text-[10px] text-muted-foreground">Sunnah Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Target className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{allTasksDone}/{daily.tasks.length}</p>
              <p className="text-[10px] text-muted-foreground">All Tasks</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Qada / Ramadhan / Fidyah Progress */}
        {hasQada && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
            <Link to="/qada-solat/track">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Qada Solat</h3>
                        <p className="text-xs text-muted-foreground">
                          {qadaSetup!.totalPrayers - qadaProgress.totalCompleted} prayers remaining
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Progress value={(qadaProgress.totalCompleted / qadaSetup!.totalPrayers) * 100} className="h-2 mb-3" />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> Streak: {qadaProgress.currentStreak}d</span>
                    <span>Est. {estimateCompletionDate(qadaSetup!, qadaProgress.totalCompleted)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {hasRamadhan && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
            <Link to="/ramadhan-qada/track">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                        <CalendarCheck className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Ramadhan Qada</h3>
                        <p className="text-xs text-muted-foreground">
                          {ramadhanSetup!.totalDays - ramadhanProgress.completedDates.length} days remaining
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Progress value={(ramadhanProgress.completedDates.length / ramadhanSetup!.totalDays) * 100} className="h-2" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {hasFidyah && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
            <Link to="/fidyah">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Fidyah</h3>
                        <p className="text-xs text-muted-foreground">
                          Last: {fidyahHistory[0].currency} {fidyahHistory[0].total.toFixed(2)} ({fidyahHistory[0].days} days)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Inspirational Quote */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm italic leading-relaxed">{quote.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{quote.source}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="h-4" />
      </main>
    </div>
  );
};

export default Dashboard;

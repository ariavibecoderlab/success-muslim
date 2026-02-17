import { Link } from 'react-router-dom';
import {
  Clock, CalendarCheck, Calculator, ChevronRight, Flame, Target,
  Moon, BookOpen, Droplets, Sun, Sunrise, Sunset, CloudSun,
  TrendingUp, CheckCircle2, Star, Heart, Sparkles, Settings, Shield, Megaphone,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getQadaSetup, getQadaProgress, getRamadhanSetup, getRamadhanProgress, getFidyahHistory } from '@/lib/storage';
import { estimateCompletionDate, getTodayKey } from '@/lib/calculations';
import { fetchPrayerTimes, formatPrayerTime, getNextPrayerIndex, getCurrentPrayerIndex, type PrayerTimesData } from '@/lib/prayer-times';
import { formatHijriDate } from '@/lib/hijri';
import { getSunnahStreak, getDayLog, getSunnahItems } from '@/lib/sunnah-storage';
import { getDailyDhikr } from '@/lib/dhikr-storage';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

const DUMMY_HABITS = [
  { label: 'Morning Adhkar', streak: 12, done: true },
  { label: 'Quran Tilawah', streak: 7, done: true },
  { label: 'Evening Adhkar', streak: 5, done: false },
  { label: 'Tahajjud', streak: 3, done: false },
];

const QUOTES = [
  { text: '"The best of you are those who learn the Quran and teach it."', source: '— Sahih al-Bukhari' },
  { text: '"Verily, with hardship comes ease."', source: '— Quran 94:6' },
  { text: '"The strongest among you is the one who controls his anger."', source: '— Sahih al-Bukhari' },
];

const Dashboard = () => {
  const [, forceUpdate] = useState(0);
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [displayName, setDisplayName] = useState('');
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string }[]>([]);

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
    fetchPrayerTimes().then(data => {
      if (data) setPrayerData(data);
    });
  }, []);

  const qadaSetup = getQadaSetup();
  const qadaProgress = getQadaProgress();
  const ramadhanSetup = getRamadhanSetup();
  const ramadhanProgress = getRamadhanProgress();
  const fidyahHistory = getFidyahHistory();

  const todayQada = useMemo(() => {
    const today = getTodayKey();
    const log = qadaProgress.dailyLogs[today];
    if (!log) return 0;
    return Object.values(log).reduce((s, v) => s + v, 0);
  }, [qadaProgress]);

  const hasQada = !!qadaSetup;
  const hasRamadhan = !!ramadhanSetup;
  const hasFidyah = fidyahHistory.length > 0;

  // Real sunnah data
  const sunnahItems = getSunnahItems().filter(i => i.enabled);
  const sunnahLog = getDayLog();
  const sunnahDone = sunnahLog.completed.filter(id => sunnahItems.find(i => i.id === id)).length;
  const sunnahStreak = getSunnahStreak();
  const dailyDhikr = getDailyDhikr();

  // Use real sunnah data for habits widget if available, fallback to dummy
  const habits = sunnahItems.length > 0
    ? sunnahItems.slice(0, 4).map(i => ({
        label: i.label,
        streak: sunnahStreak,
        done: sunnahLog.completed.includes(i.id),
      }))
    : DUMMY_HABITS;
  const habitsDone = habits.filter(h => h.done).length;

  // Prayer data
  const prayers = prayerData
    ? prayerData.timings.map((t, i) => ({
        name: t.name,
        time: formatPrayerTime(t.time),
        icon: PRAYER_ICONS[i],
        done: i <= getCurrentPrayerIndex(prayerData.timings),
        current: i === getNextPrayerIndex(prayerData.timings),
      }))
    : [
        { name: 'Subuh', time: '—', icon: Sunrise, done: false, current: false },
        { name: 'Zohor', time: '—', icon: Sun, done: false, current: false },
        { name: 'Asar', time: '—', icon: CloudSun, done: false, current: false },
        { name: 'Maghrib', time: '—', icon: Sunset, done: false, current: false },
        { name: 'Isyak', time: '—', icon: Moon, done: false, current: false },
      ];

  const prayersDone = prayers.filter(p => p.done).length;
  const hijriDate = formatHijriDate(new Date());
  const gregorianDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

   return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-primary flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Success Muslim
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

        {/* Greeting */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-2xl font-bold mb-0.5">Assalamualaikum{displayName ? `, ${displayName}` : ''} 👋</h1>
          <p className="text-muted-foreground text-sm">Your spiritual dashboard</p>
        </motion.div>

        {/* Daily Prayer Widget */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Today's Prayers</h2>
                    <p className="text-xs text-muted-foreground">{prayersDone}/5 passed</p>
                  </div>
                </div>
                {prayerData && (
                  <span className="text-[10px] text-muted-foreground">{prayerData.city}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {prayers.map(p => (
                  <div
                    key={p.name}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl transition-colors ${
                      p.current
                        ? 'bg-primary/10 ring-1 ring-primary/20'
                        : p.done
                        ? 'bg-secondary'
                        : ''
                    }`}
                  >
                    <p.icon className={`h-4 w-4 ${p.done ? 'text-primary' : p.current ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-[10px] font-medium ${p.done ? 'text-primary' : 'text-muted-foreground'}`}>{p.name}</span>
                    <span className="text-[9px] text-muted-foreground">{p.time}</span>
                    {p.done && <CheckCircle2 className="h-3 w-3 text-primary" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Flame className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-bold">{sunnahStreak || 0}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Sunnah Streak</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-lg font-bold">{dailyDhikr.totalCount}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Dhikr Today</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                <Droplets className="h-4 w-4 text-secondary-foreground" />
              </div>
              <span className="text-lg font-bold">{sunnahDone}/{sunnahItems.length || '—'}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Sunnah Done</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Habits */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <h2 className="text-sm font-semibold">Daily Habits</h2>
                </div>
                <span className="text-xs text-muted-foreground">{habitsDone}/{habits.length} done</span>
              </div>
              <div className="space-y-2.5">
                {habits.map(h => (
                  <div key={h.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        h.done ? 'bg-primary border-primary' : 'border-border'
                      }`}>
                        {h.done && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className={`text-sm ${h.done ? 'line-through text-muted-foreground' : ''}`}>{h.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3 w-3" />
                      <span>{h.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Qada / Ramadhan / Fidyah Progress */}
        {hasQada && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
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
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Today: {todayQada}/{qadaSetup!.dailyTarget}</span>
                    <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> Streak: {qadaProgress.currentStreak}d</span>
                    <span>Est. {estimateCompletionDate(qadaSetup!, qadaProgress.totalCompleted)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {hasRamadhan && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
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
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
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
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
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

        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock, title: 'Qada Solat', to: hasQada ? '/qada-solat/track' : '/qada-solat/setup' },
              { icon: CalendarCheck, title: 'Ramadhan', to: hasRamadhan ? '/ramadhan-qada/track' : '/ramadhan-qada/setup' },
              { icon: Calculator, title: 'Fidyah', to: '/fidyah' },
            ].map(item => (
              <Link key={item.title} to={item.to}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <span className="text-xs font-medium">{item.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Weekly Progress */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={9}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <h2 className="text-sm font-semibold">This Week</h2>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-20">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const heights = [65, 80, 45, 90, 100, 70, 0];
                  const isToday = new Date().getDay() === (i + 1) % 7;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-md transition-colors ${
                          isToday ? 'bg-primary' : heights[i] >= 80 ? 'bg-primary/80' : 'bg-primary/30'
                        }`}
                        style={{ height: `${Math.max(heights[i], 8)}%` }}
                      />
                      <span className={`text-[9px] ${isToday ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{day}</span>
                    </div>
                  );
                })}
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

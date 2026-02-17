import { Link } from 'react-router-dom';
import {
  Clock, CalendarCheck, Calculator, ChevronRight, Flame, Target,
  Moon, BookOpen, Droplets, Sun, Sunrise, Sunset, CloudSun,
  TrendingUp, CheckCircle2, Star, Heart, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getQadaSetup, getQadaProgress, getRamadhanSetup, getRamadhanProgress, getFidyahHistory } from '@/lib/storage';
import { estimateCompletionDate, getTodayKey } from '@/lib/calculations';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

// Dummy data for widgets
const DUMMY_PRAYERS = [
  { name: 'Subuh', time: '5:42 AM', icon: Sunrise, done: true },
  { name: 'Zohor', time: '1:15 PM', icon: Sun, done: true },
  { name: 'Asar', time: '4:38 PM', icon: CloudSun, done: false, current: true },
  { name: 'Maghrib', time: '7:22 PM', icon: Sunset, done: false },
  { name: 'Isyak', time: '8:35 PM', icon: Moon, done: false },
];

const DUMMY_HABITS = [
  { label: 'Morning Adhkar', streak: 12, done: true },
  { label: 'Quran Tilawah', streak: 7, done: true },
  { label: 'Evening Adhkar', streak: 5, done: false },
  { label: 'Tahajjud', streak: 3, done: false },
];

const DUMMY_QUOTE = {
  text: '"The best of you are those who learn the Quran and teach it."',
  source: '— Sahih al-Bukhari',
};

const Dashboard = () => {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const onFocus = () => forceUpdate(n => n + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
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

  const prayersDone = DUMMY_PRAYERS.filter(p => p.done).length;
  const habitsDone = DUMMY_HABITS.filter(h => h.done).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-primary flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Success Muslim
          </Link>
          <span className="text-xs text-muted-foreground">17 Feb 2026 · 18 Sha'ban 1447</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-5 py-6 space-y-5">
        {/* Greeting */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-2xl font-bold mb-0.5">Assalamualaikum 👋</h1>
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
                    <p className="text-xs text-muted-foreground">{prayersDone}/5 completed</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {Math.round((prayersDone / 5) * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                {DUMMY_PRAYERS.map(p => (
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
              <span className="text-lg font-bold">12</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Day Streak</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-lg font-bold">3</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Pages Today</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                <Droplets className="h-4 w-4 text-secondary-foreground" />
              </div>
              <span className="text-lg font-bold">6/8</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Glasses</span>
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
                <span className="text-xs text-muted-foreground">{habitsDone}/{DUMMY_HABITS.length} done</span>
              </div>
              <div className="space-y-2.5">
                {DUMMY_HABITS.map(h => (
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
                <p className="text-sm italic leading-relaxed">{DUMMY_QUOTE.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{DUMMY_QUOTE.source}</p>
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
                  const isToday = i === 6;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-md transition-colors ${
                          isToday ? 'bg-muted' : heights[i] >= 80 ? 'bg-primary' : 'bg-primary/40'
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

        {/* Bottom spacer */}
        <div className="h-4" />
      </main>
    </div>
  );
};

export default Dashboard;

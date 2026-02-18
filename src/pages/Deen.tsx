import { Link } from 'react-router-dom';
import {
  Moon, Clock, CalendarCheck, Calculator, ChevronRight, Flame, Target,
  BookOpen, Star, HandHeart, ListChecks,
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getQadaSetup, getQadaProgress, getRamadhanSetup, getRamadhanProgress, getFidyahHistory } from '@/lib/storage';
import { estimateCompletionDate, getTodayKey } from '@/lib/calculations';
import { getSunnahStreak, getDayLog, getSunnahItems } from '@/lib/sunnah-storage';
import { getDailyDhikr } from '@/lib/dhikr-storage';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import EditableText from '@/components/cms/EditableText';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const DEEN_FEATURES = [
  { icon: HandHeart, title: 'Dhikr Counter', desc: 'Tasbih & daily counting', to: '/deen/dhikr' },
  { icon: Calculator, title: 'Zakat Calculator', desc: 'Calculate your zakat', to: '/deen/zakat' },
  { icon: ListChecks, title: 'Sunnah Tracker', desc: 'Daily sunnah checklist', to: '/deen/sunnah' },
  { icon: BookOpen, title: 'Quran Tracker', desc: 'Daily tilawah & khatam', to: '/deen/quran' },
  { icon: Star, title: 'Prayer Times', desc: 'Azan times by location', to: '/deen/prayer-times' },
];

const Deen = () => {
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
  const hasAny = hasQada || hasRamadhan || hasFidyah;

  const sunnahStreak = getSunnahStreak();
  const sunnahLog = getDayLog();
  const sunnahItems = getSunnahItems().filter(i => i.enabled);
  const sunnahDone = sunnahLog.completed.filter(id => sunnahItems.find(i => i.id === id)).length;
  const dailyDhikr = getDailyDhikr();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Deen" />

      <main className="max-w-4xl mx-auto px-5 py-6 space-y-5">
        {/* Hero */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-5">
              <EditableText elementKey="deen.hero.title" defaultText="Spiritual Journey" tag="h1" className="text-lg font-bold mb-1" />
              <EditableText elementKey="deen.hero.desc" defaultText="Track your ibadah, settle spiritual debts, and grow closer to Allah." tag="p" className="text-sm text-muted-foreground" />
              {(sunnahStreak > 0 || dailyDhikr.totalCount > 0) && (
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  {sunnahStreak > 0 && (
                    <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-primary" /> {sunnahStreak}d sunnah streak</span>
                  )}
                  {dailyDhikr.totalCount > 0 && (
                    <span>{dailyDhikr.totalCount} dhikr today</span>
                  )}
                  {sunnahItems.length > 0 && (
                    <span>{sunnahDone}/{sunnahItems.length} sunnah</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Trackers */}
        {hasAny && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <EditableText elementKey="deen.trackers.title" defaultText="Active Trackers" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
            <div className="space-y-3">
              {hasQada && (
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
                        <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {qadaProgress.currentStreak}d streak</span>
                        <span>Est. {estimateCompletionDate(qadaSetup!, qadaProgress.totalCompleted)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {hasRamadhan && (
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
              )}

              {hasFidyah && (
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
              )}
            </div>
          </motion.div>
        )}

        {/* Setup Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {hasAny ? 'Add More' : 'Get Started'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock, title: 'Qada Solat', to: hasQada ? '/qada-solat/track' : '/qada-solat/setup', active: hasQada },
              { icon: CalendarCheck, title: 'Ramadhan', to: hasRamadhan ? '/ramadhan-qada/track' : '/ramadhan-qada/setup', active: hasRamadhan },
              { icon: Calculator, title: 'Fidyah', to: '/fidyah', active: hasFidyah },
            ].map(item => (
              <Link key={item.title} to={item.to}>
                <Card className={`hover:shadow-sm transition-shadow ${item.active ? 'border-primary/20 bg-primary/5' : ''}`}>
                  <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.active ? 'bg-primary/10' : 'bg-secondary'
                    }`}>
                      <item.icon className={`h-5 w-5 ${item.active ? 'text-primary' : 'text-secondary-foreground'}`} />
                    </div>
                    <span className="text-xs font-medium">{item.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Deen Features */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <EditableText elementKey="deen.spiritual.title" defaultText="Spiritual Tools" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
          <div className="space-y-2">
            {DEEN_FEATURES.map((f, i) => (
              <Link key={f.title} to={f.to}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <f.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <EditableText elementKey={`deen.feature.${i}.title`} defaultText={f.title} tag="p" className="text-sm font-medium" />
                        <EditableText elementKey={`deen.feature.${i}.desc`} defaultText={f.desc} tag="p" className="text-[11px] text-muted-foreground" />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* spacer */}

        <div className="h-4" />
      </main>
    </div>
  );
};

export default Deen;

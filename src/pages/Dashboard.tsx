import { Link } from 'react-router-dom';
import { Clock, CalendarCheck, Calculator, ChevronRight, Flame, Target, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getQadaSetup, getQadaProgress, getRamadhanSetup, getRamadhanProgress, getFidyahHistory } from '@/lib/storage';
import { estimateCompletionDate, getTodayKey } from '@/lib/calculations';
import { PRAYER_NAMES, PrayerType } from '@/lib/types';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
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
  const isEmpty = !hasQada && !hasRamadhan && !hasFidyah;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-primary flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Success Muslim
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-1">Assalamualaikum 👋</h1>
        <p className="text-muted-foreground mb-8">Your spiritual dashboard</p>

        {isEmpty ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm mb-6">Start by setting up one of these features:</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Clock, title: 'Qada Solat', desc: 'Calculate & track your missed prayers', to: '/qada-solat/setup', color: 'text-primary' },
                { icon: CalendarCheck, title: 'Ramadhan Qada', desc: 'Track your missed fasts', to: '/ramadhan-qada/setup', color: 'text-primary' },
                { icon: Calculator, title: 'Fidyah Calculator', desc: 'Calculate your fidyah', to: '/fidyah', color: 'text-primary' },
              ].map((item, i) => (
                <motion.div key={item.title} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <Link to={item.to}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-6">
                        <item.icon className={`h-8 w-8 ${item.color} mb-4`} />
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                        <div className="flex items-center text-primary text-sm mt-4 font-medium">
                          Set up now <ChevronRight className="h-4 w-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {hasQada && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                <Link to="/qada-solat/track">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Qada Solat</h3>
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
                        <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> Streak: {qadaProgress.currentStreak} days</span>
                        <span>Est. {estimateCompletionDate(qadaSetup!, qadaProgress.totalCompleted)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )}

            {hasRamadhan && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                <Link to="/ramadhan-qada/track">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <CalendarCheck className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Ramadhan Qada</h3>
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
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
                <Link to="/fidyah">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Fidyah</h3>
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

            {/* Quick add buttons for missing features */}
            {(!hasQada || !hasRamadhan) && (
              <div className="flex gap-3 mt-6">
                {!hasQada && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/qada-solat/setup">+ Qada Solat</Link>
                  </Button>
                )}
                {!hasRamadhan && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/ramadhan-qada/setup">+ Ramadhan Qada</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

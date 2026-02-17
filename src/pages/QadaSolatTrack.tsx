import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Target, TrendingUp, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getQadaSetup, getQadaProgress, logQadaPrayer, undoQadaPrayer } from '@/lib/storage';
import { estimateCompletionDate, getTodayKey } from '@/lib/calculations';
import { PRAYER_NAMES, PrayerType } from '@/lib/types';
import { motion } from 'framer-motion';

const PRAYERS: PrayerType[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const QadaSolatTrack = () => {
  const setup = getQadaSetup();
  const [progress, setProgress] = useState(getQadaProgress());
  const today = getTodayKey();
  const todayLog = progress.dailyLogs[today] || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
  const todayTotal = Object.values(todayLog).reduce((s, v) => s + v, 0);

  const handleToggle = (prayer: PrayerType) => {
    if (todayLog[prayer] > 0) {
      setProgress(undoQadaPrayer(prayer));
    } else {
      setProgress(logQadaPrayer(prayer));
    }
  };

  if (!setup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold mb-2">No setup found</p>
            <p className="text-sm text-muted-foreground mb-4">Please complete the setup wizard first.</p>
            <Link to="/qada-solat/setup" className="text-primary font-medium text-sm">Go to Setup →</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const remaining = setup.totalPrayers - progress.totalCompleted;
  const pct = Math.min((progress.totalCompleted / setup.totalPrayers) * 100, 100);

  const encouragement = todayTotal >= setup.dailyTarget
    ? "Alhamdulillah! Target reached today! 🌟"
    : todayTotal > 0
    ? "Keep going, you're doing great!"
    : "Bismillah, start your qada for today";

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="font-semibold">Qada Solat</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Overall progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{pct.toFixed(1)}%</p>
              </div>
              <p className="text-sm text-muted-foreground">{progress.totalCompleted.toLocaleString()} / {setup.totalPrayers.toLocaleString()}</p>
            </div>
            <Progress value={pct} className="h-3 mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Target className="h-3.5 w-3.5" />
                  <span className="text-xs">Remaining</span>
                </div>
                <p className="font-semibold text-sm">{remaining.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Flame className="h-3.5 w-3.5" />
                  <span className="text-xs">Streak</span>
                </div>
                <p className="font-semibold text-sm">{progress.currentStreak} days</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs">Best</span>
                </div>
                <p className="font-semibold text-sm">{progress.longestStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's target */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Today's Qada</h2>
            <span className="text-sm text-muted-foreground">{todayTotal} / {setup.dailyTarget}</span>
          </div>
          <div className="space-y-2">
            {PRAYERS.map((prayer, i) => {
              const done = todayLog[prayer] > 0;
              return (
                <motion.button
                  key={prayer}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleToggle(prayer)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${done ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                >
                  {done ? (
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`font-medium text-sm ${done ? 'text-primary' : ''}`}>{PRAYER_NAMES[prayer]}</span>
                  {done && <span className="ml-auto text-xs text-primary font-medium">Done</span>}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Encouragement */}
        <motion.p
          key={encouragement}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground italic py-4"
        >
          {encouragement}
        </motion.p>

        {/* Completion estimate */}
        <p className="text-center text-xs text-muted-foreground">
          Estimated completion: {estimateCompletionDate(setup, progress.totalCompleted)}
        </p>
      </main>
    </div>
  );
};

export default QadaSolatTrack;

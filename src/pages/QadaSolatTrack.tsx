import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Flame, Target, TrendingUp, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getQadaSetup, getQadaProgress, logQadaPrayer, undoQadaPrayer } from '@/lib/storage';
import { estimateCompletionDate, getTodayKey } from '@/lib/calculations';
import { PRAYER_NAMES, PrayerType } from '@/lib/types';
import { motion } from 'framer-motion';
import SubPageLayout from '@/components/SubPageLayout';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';

const PRAYERS: PrayerType[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const IMAN_TRACKERS = [
  { path: '/qada-solat/track', label: 'Qada Solat' },
  { path: '/ramadhan-qada/track', label: 'Ramadhan' },
  { path: '/fidyah', label: 'Fidyah' },
];

const QadaSolatTrack = () => {
  const setup = getQadaSetup();
  const [progress, setProgress] = useState(getQadaProgress());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateKey === getTodayKey();
  const dayLog = progress.dailyLogs[dateKey] || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
  const dayTotal = Object.values(dayLog).reduce((s, v) => s + v, 0);

  const handleIncrement = (prayer: PrayerType) => {
    setProgress(logQadaPrayer(prayer, 1, dateKey));
  };

  const handleDecrement = (prayer: PrayerType) => {
    if (dayLog[prayer] > 0) {
      setProgress(undoQadaPrayer(prayer, dateKey));
    }
  };

  if (!setup) {
    return (
      <SubPageLayout title="Qada Solat" backTo="/iman">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg font-semibold mb-2">No setup found</p>
              <p className="text-sm text-muted-foreground mb-4">Please complete the setup wizard first.</p>
              <Link to="/qada-solat/setup" className="text-primary font-medium text-sm">Go to Setup →</Link>
            </CardContent>
          </Card>
        </div>
      </SubPageLayout>
    );
  }

  const remaining = setup.totalPrayers - progress.totalCompleted;
  const pct = Math.min((progress.totalCompleted / setup.totalPrayers) * 100, 100);

  const encouragement = dayTotal >= setup.dailyTarget
    ? "Alhamdulillah! Target reached! 🌟"
    : dayTotal > 0
    ? "Keep going, you're doing great!"
    : "Bismillah, start your qada";

  return (
    <SubPageLayout title="Qada Solat" backTo="/iman" siblingRoutes={IMAN_TRACKERS} currentPath="/qada-solat/track">
      <BackdatePrompt moduleKey="qada-solat" onLogPastData={() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        setSelectedDate(yesterday);
      }} />
      <div className="space-y-6">
        <BackdateDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
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
            <h2 className="font-semibold">{isToday ? "Today's Qada" : format(selectedDate, 'd MMM yyyy')}</h2>
            <span className="text-sm text-muted-foreground">{dayTotal} / {setup.dailyTarget}</span>
          </div>
          <div className="space-y-2">
          {PRAYERS.map((prayer, i) => {
              const count = dayLog[prayer] || 0;
              const done = count > 0;
              return (
                <motion.div
                  key={prayer}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${done ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  {done ? (
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`font-medium text-sm ${done ? 'text-primary' : ''}`}>{PRAYER_NAMES[prayer]}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => handleDecrement(prayer)}
                      disabled={count === 0}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm font-bold hover:bg-muted disabled:opacity-30 transition-all"
                    >−</button>
                    <span className={`text-sm font-bold w-6 text-center ${done ? 'text-primary' : 'text-muted-foreground'}`}>{count}</span>
                    <button
                      onClick={() => handleIncrement(prayer)}
                      className="w-7 h-7 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-sm font-bold text-primary hover:bg-primary/20 transition-all"
                    >+</button>
                  </div>
                </motion.div>
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
      </div>
    </SubPageLayout>
  );
};

export default QadaSolatTrack;

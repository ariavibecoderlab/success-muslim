import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getRamadhanSetup, getRamadhanProgress, toggleRamadhanDay } from '@/lib/storage';
import { isRecommendedFastingDay } from '@/lib/calculations';
import { motion } from 'framer-motion';
import SubPageLayout from '@/components/SubPageLayout';
import { fadeUp, staggerContainer, staggerItem } from '@/components/dashboard/constants';

const IMAN_TRACKERS = [
  { path: '/qada-solat/track', label: 'Qada Solat' },
  { path: '/ramadhan-qada/track', label: 'Ramadhan' },
  { path: '/fidyah', label: 'Fidyah' },
];

function getStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort().reverse();
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    prev.setDate(prev.getDate() - 1);
    if (prev.toISOString().split('T')[0] === curr.toISOString().split('T')[0]) {
      streak++;
    } else break;
  }
  return streak;
}

const RamadhanQadaTrack = () => {
  const setup = getRamadhanSetup();
  const [progress, setProgress] = useState(getRamadhanProgress());

  const upcomingDays = useMemo(() => {
    const days: { date: Date; key: string; recommended: boolean }[] = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        key: d.toISOString().split('T')[0],
        recommended: isRecommendedFastingDay(d),
      });
    }
    return days;
  }, []);

  if (!setup) {
    return (
      <SubPageLayout title="Ramadhan Qada" backTo="/iman">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-semibold mb-1">No setup found</p>
              <p className="text-[10px] text-muted-foreground mb-3">Please complete the setup first.</p>
              <Link to="/ramadhan-qada/setup" className="text-primary font-medium text-[10px]">Go to Setup →</Link>
            </CardContent>
          </Card>
        </div>
      </SubPageLayout>
    );
  }

  const completed = progress.completedDates.length;
  const remaining = setup.totalDays - completed;
  const pct = Math.min((completed / setup.totalDays) * 100, 100);
  const streak = getStreak(progress.completedDates);

  const handleToggle = (key: string) => {
    if (completed >= setup.totalDays && !progress.completedDates.includes(key)) return;
    setProgress(toggleRamadhanDay(key));
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SubPageLayout title="Ramadhan Qada" backTo="/iman" siblingRoutes={IMAN_TRACKERS} currentPath="/ramadhan-qada/track">
      <motion.div className="space-y-5" variants={staggerContainer} initial="hidden" animate="visible">
        {/* Hero card */}
        <motion.div variants={staggerItem}>
          <Card className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-200/30 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Progress</p>
                  <p className="text-lg font-bold leading-tight">{completed} / {setup.totalDays} days</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">{pct.toFixed(0)}%</p>
                </div>
              </div>
              <Progress value={pct} className="h-1.5 mb-2" />
              <div className="flex items-center justify-between">
                {remaining > 0 ? (
                  <p className="text-[10px] text-muted-foreground">{remaining} days remaining</p>
                ) : (
                  <p className="text-[10px] text-primary font-medium">Alhamdulillah! All fasts completed! 🌟</p>
                )}
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-[10px] font-medium text-orange-600">
                    <Flame className="h-3 w-3" />
                    {streak} day streak
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming days */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Days</h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Star className="h-2.5 w-2.5 text-accent" /> Recommended
            </p>
          </div>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-1.5">
              <div className="divide-y divide-border">
                {upcomingDays.map((day, i) => {
                  const isDone = progress.completedDates.includes(day.key);
                  return (
                    <motion.button
                      key={day.key}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.015 }}
                      onClick={() => handleToggle(day.key)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${isDone ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-medium ${isDone ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          {isDone ? <Check className="h-3.5 w-3.5" /> : day.date.getDate()}
                        </div>
                        <p className="text-[13px] font-medium">{dayNames[day.date.getDay()]}, {day.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {day.recommended && <Star className="h-3 w-3 text-accent" />}
                        {isDone && <span className="text-[10px] text-primary font-medium">Done</span>}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </SubPageLayout>
  );
};

export default RamadhanQadaTrack;

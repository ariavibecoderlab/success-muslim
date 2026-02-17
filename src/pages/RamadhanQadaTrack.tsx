import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getRamadhanSetup, getRamadhanProgress, toggleRamadhanDay } from '@/lib/storage';
import { isRecommendedFastingDay } from '@/lib/calculations';
import { motion } from 'framer-motion';
import SubPageLayout from '@/components/SubPageLayout';

const DEEN_TRACKERS = [
  { path: '/qada-solat/track', label: 'Qada Solat' },
  { path: '/ramadhan-qada/track', label: 'Ramadhan' },
  { path: '/fidyah', label: 'Fidyah' },
];

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
      <SubPageLayout title="Ramadhan Qada" backTo="/deen">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg font-semibold mb-2">No setup found</p>
              <p className="text-sm text-muted-foreground mb-4">Please complete the setup first.</p>
              <Link to="/ramadhan-qada/setup" className="text-primary font-medium text-sm">Go to Setup →</Link>
            </CardContent>
          </Card>
        </div>
      </SubPageLayout>
    );
  }

  const completed = progress.completedDates.length;
  const remaining = setup.totalDays - completed;
  const pct = Math.min((completed / setup.totalDays) * 100, 100);

  const handleToggle = (key: string) => {
    if (completed >= setup.totalDays && !progress.completedDates.includes(key)) return;
    setProgress(toggleRamadhanDay(key));
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SubPageLayout title="Ramadhan Qada" backTo="/deen" siblingRoutes={DEEN_TRACKERS} currentPath="/ramadhan-qada/track">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{completed} / {setup.totalDays} days</p>
              </div>
              <p className="text-sm font-medium text-primary">{pct.toFixed(0)}%</p>
            </div>
            <Progress value={pct} className="h-3" />
            {remaining > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{remaining} days remaining</p>
            )}
            {remaining <= 0 && (
              <p className="text-xs text-primary font-medium mt-2">Alhamdulillah! All fasts completed! 🌟</p>
            )}
          </CardContent>
        </Card>

        <div>
          <h3 className="font-semibold mb-3">Upcoming Days</h3>
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
            <Star className="h-3 w-3 text-accent" /> = Recommended fasting day (Mon, Thu, White Days)
          </p>
          <div className="space-y-2">
            {upcomingDays.map((day, i) => {
              const isDone = progress.completedDates.includes(day.key);
              return (
                <motion.button
                  key={day.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => handleToggle(day.key)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isDone ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${isDone ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {isDone ? <Check className="h-4 w-4" /> : day.date.getDate()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{dayNames[day.date.getDay()]}, {day.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {day.recommended && <Star className="h-4 w-4 text-accent" />}
                    {isDone && <span className="text-xs text-primary font-medium">Completed</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </SubPageLayout>
  );
};

export default RamadhanQadaTrack;

import { useState, useMemo, useCallback } from 'react';
import { TrendingDown, TrendingUp, Target, Plus, Flame, Award, CalendarDays, Minus, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import SubPageLayout from '@/components/SubPageLayout';
import { getWeightLog, addWeightEntry, getWeightGoal, setWeightGoal as saveWeightGoal, todayKey, getBMI, saveBMI, calculateBMI, calculateTDEE } from '@/lib/health-storage';
import { format, parseISO, differenceInDays, subDays, isAfter, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/steps', label: 'Steps' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
];

type ChartRange = '7d' | '30d' | 'all';

const MILESTONES = [
  { key: 'first_log', label: 'First Log', desc: 'You started your journey!' },
  { key: 'lost_1kg', label: '-1 kg', desc: 'First kilogram down!' },
  { key: 'lost_5kg', label: '-5 kg', desc: 'Serious progress!' },
  { key: 'halfway', label: 'Halfway', desc: 'You\'re halfway to your goal!' },
  { key: 'goal', label: 'Goal Reached', desc: 'You did it!' },
];

function getStreak(log: { date: string }[]): number {
  if (log.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i <= 60; i++) {
    const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
    if (log.some(e => e.date === checkDate)) {
      streak++;
    } else if (i > 0) break;
  }
  return streak;
}

function getWeekTrend(log: { date: string; weight: number }[]): number | null {
  if (log.length < 2) return null;
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const recentEntries = log.filter(e => isAfter(parseISO(e.date), weekAgo));
  if (recentEntries.length < 2) return null;
  const first = recentEntries[0].weight;
  const last = recentEntries[recentEntries.length - 1].weight;
  return +(last - first).toFixed(1);
}

function checkMilestones(log: { date: string; weight: number }[], goalWeight: number | null): string[] {
  const achieved: string[] = [];
  if (log.length >= 1) achieved.push('first_log');
  if (log.length >= 2) {
    const startWeight = log[0].weight;
    const currentWeight = log[log.length - 1].weight;
    const lost = startWeight - currentWeight;
    if (lost >= 1) achieved.push('lost_1kg');
    if (lost >= 5) achieved.push('lost_5kg');
    if (goalWeight && goalWeight < startWeight) {
      const totalToLose = startWeight - goalWeight;
      if (lost >= totalToLose / 2) achieved.push('halfway');
      if (lost >= totalToLose) achieved.push('goal');
    }
  }
  return achieved;
}

const HealthWeight = () => {
  const [log, setLog] = useState(getWeightLog);
  const [newWeight, setNewWeight] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [chartRange, setChartRange] = useState<ChartRange>('30d');
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateKey === todayKey();

  const goalVal = getWeightGoal();
  const latest = log[log.length - 1];
  const streak = useMemo(() => getStreak(log), [log]);
  const weekTrend = useMemo(() => getWeekTrend(log), [log]);
  const milestones = useMemo(() => checkMilestones(log, goalVal), [log, goalVal]);

  const kgRemaining = latest && goalVal ? +(latest.weight - goalVal).toFixed(1) : null;
  const progressPercent = useMemo(() => {
    if (!goalVal || log.length < 1) return 0;
    const start = log[0].weight;
    const current = latest?.weight ?? start;
    const total = start - goalVal;
    if (total <= 0) return 100;
    const done = start - current;
    return Math.min(100, Math.max(0, (done / total) * 100));
  }, [log, goalVal, latest]);

  const chartData = useMemo(() => {
    let filtered = log;
    if (chartRange === '7d') filtered = log.filter(e => isAfter(parseISO(e.date), subDays(new Date(), 7)));
    else if (chartRange === '30d') filtered = log.filter(e => isAfter(parseISO(e.date), subDays(new Date(), 30)));
    return filtered.map(e => ({
      date: format(parseISO(e.date), chartRange === 'all' ? 'MMM dd' : 'dd/MM'),
      weight: e.weight,
    }));
  }, [log, chartRange]);

  const handleAdd = () => {
    const w = parseFloat(newWeight);
    if (!w || w < 20 || w > 300) return;

    const prevMilestones = checkMilestones(log, goalVal);
    addWeightEntry({ date: dateKey, weight: w });

    // Auto-update BMI only if logging for today
    if (isToday) {
      const bmiData = getBMI();
      if (bmiData) {
        const newBmi = calculateBMI(w, bmiData.height);
        const newTdee = calculateTDEE(w, bmiData.height, bmiData.age, bmiData.gender, bmiData.activityLevel);
        saveBMI({ ...bmiData, weight: w, bmi: newBmi, tdee: newTdee, date: todayKey() });
      }
    }

    const updatedLog = getWeightLog();
    setLog(updatedLog);
    setNewWeight('');
    setLogDialogOpen(false);

    // Check for new milestones
    const newMilestones = checkMilestones(updatedLog, goalVal);
    const justAchieved = newMilestones.filter(m => !prevMilestones.includes(m));
    if (justAchieved.length > 0) {
      const milestone = MILESTONES.find(m => m.key === justAchieved[justAchieved.length - 1]);
      if (milestone) {
        setCelebrationMsg(milestone.desc);
        setTimeout(() => setCelebrationMsg(null), 4000);
      }
    }

    const dateLabel = isToday ? 'today' : format(selectedDate, 'd MMM');
    toast({ title: 'Weight logged', description: `${w} kg recorded for ${dateLabel}.` });
  };

  const handleSetGoal = () => {
    const g = parseFloat(goalInput);
    if (!g || g < 20 || g > 300) return;
    saveWeightGoal(g);
    setGoalDialogOpen(false);
    setGoalInput('');
    toast({ title: 'Goal set', description: `Target: ${g} kg` });
  };

  const dateLogged = log.some(e => e.date === dateKey);

  const handleBackdatePrompt = () => {
    setSelectedDate(subDays(new Date(), 1));
  };

  return (
    <SubPageLayout title="Weight Tracker" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/weight">
      <div className="space-y-5">
        {/* Backdate */}
        <BackdatePrompt moduleKey="weight" onLogPastData={handleBackdatePrompt} />
        <BackdateDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Celebration overlay */}
        <AnimatePresence>
          {celebrationMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-lg text-center"
            >
              <Award className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-bold">{celebrationMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero: Current Weight */}
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Weight</p>
                <motion.p
                  key={latest?.weight}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold tracking-tight"
                >
                  {latest?.weight ?? '—'}
                  <span className="text-lg font-normal text-muted-foreground ml-1">kg</span>
                </motion.p>
                {weekTrend !== null && (
                  <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${weekTrend <= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {weekTrend <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {weekTrend > 0 ? '+' : ''}{weekTrend} kg this week
                  </div>
                )}
              </div>

              {/* Log button */}
              <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" className="h-14 w-14 rounded-2xl shadow-md">
                    <Plus className="h-6 w-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xs">
                  <DialogHeader>
                    <DialogTitle>Log Weight{!isToday ? ` — ${format(selectedDate, 'd MMM')}` : ''}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline" size="icon" className="rounded-full h-10 w-10"
                        onClick={() => setNewWeight(prev => {
                          const v = parseFloat(prev || (latest?.weight?.toString() ?? '70'));
                          return Math.max(20, v - 0.1).toFixed(1);
                        })}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={newWeight || (latest?.weight?.toString() ?? '')}
                        onChange={e => setNewWeight(e.target.value)}
                        className="text-center text-2xl font-bold h-14"
                        placeholder="70.0"
                        step="0.1"
                        autoFocus
                      />
                      <Button
                        variant="outline" size="icon" className="rounded-full h-10 w-10"
                        onClick={() => setNewWeight(prev => {
                          const v = parseFloat(prev || (latest?.weight?.toString() ?? '70'));
                          return (v + 0.1).toFixed(1);
                        })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleAdd} className="w-full h-11">
                      {dateLogged ? (isToday ? 'Update Today' : `Update ${format(selectedDate, 'd MMM')}`) : 'Log Weight'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Goal progress */}
            {goalVal && kgRemaining !== null && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Goal: {goalVal} kg</span>
                  <span className="font-medium">
                    {kgRemaining > 0 ? `${kgRemaining} kg to go` : 'Goal reached!'}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
              </div>
            )}

            {!goalVal && (
              <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="mt-3 text-xs text-primary gap-1">
                    <Target className="h-3 w-3" /> Set a goal weight
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xs">
                  <DialogHeader>
                    <DialogTitle>Set Goal Weight</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <Input
                      type="number"
                      value={goalInput}
                      onChange={e => setGoalInput(e.target.value)}
                      placeholder="65"
                      className="text-center text-xl font-bold h-12"
                      autoFocus
                    />
                    <Button onClick={handleSetGoal} className="w-full">Set Goal</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* Streak & Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="p-3 text-center">
              <Flame className="h-4 w-4 mx-auto text-accent mb-1" />
              <p className="text-lg font-bold">{streak}</p>
              <p className="text-[10px] text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <CalendarDays className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{log.length}</p>
              <p className="text-[10px] text-muted-foreground">Total Logs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Award className="h-4 w-4 mx-auto text-accent mb-1" />
              <p className="text-lg font-bold">{milestones.length}/{MILESTONES.length}</p>
              <p className="text-[10px] text-muted-foreground">Milestones</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-1">
                {([['7d', '7D'], ['30d', '30D'], ['all', 'All']] as const).map(([val, label]) => (
                  <Button
                    key={val}
                    variant={chartRange === val ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs px-3 rounded-full"
                    onClick={() => setChartRange(val)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={35} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#weightGrad)" dot={{ r: 3, fill: 'hsl(var(--primary))' }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold">Milestones</p>
            <div className="space-y-2">
              {MILESTONES.map((m) => {
                const achieved = milestones.includes(m.key);
                return (
                  <div
                    key={m.key}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${achieved ? 'bg-primary/10' : 'bg-secondary/30 opacity-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${achieved ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                    </div>
                    {achieved && <p className="text-xs text-primary font-medium">Done</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Goal edit (if already set) */}
        {goalVal && (
          <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                <Target className="h-3 w-3" /> Change Goal ({goalVal} kg)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs">
              <DialogHeader>
                <DialogTitle>Update Goal Weight</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  type="number"
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  placeholder={goalVal.toString()}
                  className="text-center text-xl font-bold h-12"
                  autoFocus
                />
                <Button onClick={handleSetGoal} className="w-full">Update Goal</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SubPageLayout>
  );
};

export default HealthWeight;

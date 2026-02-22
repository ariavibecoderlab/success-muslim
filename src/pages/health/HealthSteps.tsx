import { useState, useCallback } from 'react';
import { Footprints, Plus, Trash2, TrendingUp, Flame, MapPin, Link } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import SubPageLayout from '@/components/SubPageLayout';
import {
  getStepsToday, addStepLog, deleteStepLog, getStepsPrefs, setStepsTarget,
  getStepsHistory, getStepsStreak, getTotalStepsAllTime, getBestDayThisWeek,
  getWeeklyAverage, calcDistance, calcCalories, getAllLogs, getStepsForDate,
  type ActivityType,
} from '@/lib/steps-storage';
import { format, subDays } from 'date-fns';
import StepsCalendarHeatmap from '@/components/health/StepsCalendarHeatmap';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
  { path: '/health/steps', label: 'Steps' },
];

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: string }[] = [
  { value: 'walking', label: 'Walking', icon: '🚶' },
  { value: 'running', label: 'Running', icon: '🏃' },
  { value: 'hiking', label: 'Hiking', icon: '🧗' },
  { value: 'others', label: 'Others', icon: '🛒' },
];

const TARGET_PRESETS = [5000, 7500, 10000, 12500];

const MILESTONES = [
  { key: 'first', label: 'First day hitting target', threshold: 1, type: 'streak' },
  { key: '7day', label: '7-day streak', threshold: 7, type: 'streak' },
  { key: '30day', label: '30-day streak', threshold: 30, type: 'streak' },
  { key: '100k', label: '100,000 steps total', threshold: 100000, type: 'total' },
  { key: '1m', label: '1,000,000 steps total', threshold: 1000000, type: 'total' },
];

const HealthSteps = () => {
  const [, rerender] = useState(0);
  const refresh = useCallback(() => rerender(n => n + 1), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stepsInput, setStepsInput] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('walking');
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [customTarget, setCustomTarget] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');

  const prefs = getStepsPrefs();
  const { total: daySteps, logs: dayLogs } = isToday ? getStepsToday() : getStepsForDate(dateKey);
  const progress = Math.min((daySteps / prefs.dailyTarget) * 100, 100);
  const targetHit = daySteps >= prefs.dailyTarget;
  const history = getStepsHistory(7);
  const streak = getStepsStreak();
  const totalAllTime = getTotalStepsAllTime();
  const bestDay = getBestDayThisWeek();
  const weeklyAvg = getWeeklyAverage();
  const dayDistance = calcDistance(daySteps, prefs.strideLengthCm);
  const dayCalories = calcCalories(daySteps);

  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (progress / 100) * circumference;
  const ringColor = targetHit ? 'hsl(142, 71%, 45%)' : 'hsl(38, 92%, 50%)';

  const handleLog = () => {
    const steps = parseInt(stepsInput);
    if (!steps || steps <= 0) return;
    addStepLog(steps, activityType, undefined, isToday ? undefined : dateKey);
    setStepsInput('');
    setActivityType('walking');
    setDialogOpen(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteStepLog(id);
    refresh();
  };

  const handleSetTarget = (target: number) => {
    setStepsTarget(target);
    setShowTargetPicker(false);
    setCustomTarget('');
    refresh();
  };

  const handleBackdatePrompt = () => {
    setSelectedDate(subDays(new Date(), 1));
  };

  const chartData = history.map(h => ({
    ...h,
    fill: h.steps >= prefs.dailyTarget ? 'hsl(142, 71%, 45%)' : 'hsl(var(--muted-foreground) / 0.3)',
  }));

  const earnedMilestones = MILESTONES.filter(m =>
    m.type === 'streak' ? streak >= m.threshold : totalAllTime >= m.threshold
  );

  const dayLabel = isToday ? "Today's" : format(selectedDate, 'd MMM');

  return (
    <SubPageLayout title="Steps Tracker" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/steps">
      <div className="space-y-5">
        {/* Backdate */}
        <BackdatePrompt moduleKey="steps" onLogPastData={handleBackdatePrompt} />
        <BackdateDatePicker selectedDate={selectedDate} onDateChange={(d) => { setSelectedDate(d); refresh(); }} />

        {/* Hero Ring */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
              <circle
                cx="80" cy="80" r="70" fill="none"
                stroke={ringColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Footprints className="h-6 w-6 text-primary mb-1" />
              <p className="text-3xl font-bold">{daySteps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">/ {prefs.dailyTarget.toLocaleString()} steps</p>
            </div>
          </div>
          {targetHit && (
            <p className="text-sm font-medium text-primary mt-2">MashaAllah! Target reached!</p>
          )}
        </div>

        {/* Log Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full gap-2">
              <Plus className="h-4 w-4" /> Log Steps{!isToday ? ` — ${format(selectedDate, 'd MMM')}` : ''}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Steps{!isToday ? ` — ${format(selectedDate, 'd MMM')}` : ''}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Number of steps</label>
                <Input
                  type="number"
                  placeholder="e.g. 3200"
                  value={stepsInput}
                  onChange={e => setStepsInput(e.target.value)}
                  min={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Activity type</label>
                <div className="grid grid-cols-4 gap-2">
                  {ACTIVITY_TYPES.map(a => (
                    <button
                      key={a.value}
                      onClick={() => setActivityType(a.value)}
                      className={`p-2 rounded-lg text-center text-xs border transition-colors ${
                        activityType === a.value
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:bg-secondary/50'
                      }`}
                    >
                      <span className="text-lg block mb-0.5">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleLog} className="w-full" disabled={!stepsInput || parseInt(stepsInput) <= 0}>
                Add Steps
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Day's Summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{dayLabel} Summary</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <Footprints className="h-4 w-4 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{daySteps.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">steps</p>
              </div>
              <div>
                <MapPin className="h-4 w-4 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{(dayDistance / 1000).toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">km</p>
              </div>
              <div>
                <Flame className="h-4 w-4 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{dayCalories}</p>
                <p className="text-[10px] text-muted-foreground">kcal</p>
              </div>
            </div>
            {dayLogs.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                {dayLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' · '}{log.steps.toLocaleString()} steps · {log.activityType}
                    </span>
                    <button onClick={() => handleDelete(log.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <Card><CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">{isToday ? 'Today' : format(selectedDate, 'd MMM')}</p>
            <p className="text-lg font-bold">{daySteps.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Weekly Avg</p>
            <p className="text-lg font-bold">{weeklyAvg.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Best Day</p>
            <p className="text-lg font-bold">{bestDay.toLocaleString()}</p>
          </CardContent></Card>
        </div>

        {/* Weekly Bar Chart */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Last 7 Days</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <ReferenceLine y={prefs.dailyTarget} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1} />
                <Bar dataKey="steps" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))">
                  {chartData.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Target Setting */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Target</p>
                <p className="text-lg font-bold">{prefs.dailyTarget.toLocaleString()} steps</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowTargetPicker(!showTargetPicker)}>
                Change
              </Button>
            </div>
            {showTargetPicker && (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {TARGET_PRESETS.map(t => (
                    <Button
                      key={t}
                      variant={prefs.dailyTarget === t ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSetTarget(t)}
                    >
                      {t.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Custom"
                    value={customTarget}
                    onChange={e => setCustomTarget(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const v = parseInt(customTarget);
                      if (v > 0) handleSetTarget(v);
                    }}
                    disabled={!customTarget || parseInt(customTarget) <= 0}
                  >
                    Set
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  WHO recommends 10,000 steps/day ≈ 7.6 km · ~400 calories
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Heatmap */}
        <StepsCalendarHeatmap logs={getAllLogs()} dailyTarget={prefs.dailyTarget} />

        {/* Streak & Milestones */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Streak & Milestones</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak} day{streak !== 1 ? 's' : ''}</p>
                <p className="text-xs text-muted-foreground">consecutive days hitting target</p>
              </div>
            </div>
            {earnedMilestones.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {earnedMilestones.map(m => (
                  <span key={m.key} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                    {m.label}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sunnah Nudge */}
        {targetHit && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <Footprints className="h-5 w-5 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground italic">
                The Prophet ﷺ encouraged walking. Every step counts as sadaqah for your body.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Coming Soon */}
        <Card className="bg-secondary/50">
          <CardContent className="p-4 text-center">
            <Link className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              Connect your smartwatch or phone to auto-sync steps — coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default HealthSteps;
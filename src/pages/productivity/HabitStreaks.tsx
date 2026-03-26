import { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Flame, Check, X, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SubPageLayout from '@/components/SubPageLayout';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, getDay } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';
import {
  useHabits, useHabitLog, useAddHabit, useDeleteHabit, useToggleHabit,
  getHabitStreak, getHeatmapData,
} from '@/hooks/useHabitsQuery';
import { getTodayKey, getLongestStreak, getHabitCompletionRate, isHabitScheduledForDate, type Habit } from '@/lib/productivity-storage';

const SIBLING_ROUTES = [
  { path: '/productivity/tasks', label: 'Daily Tasks' },
  { path: '/productivity/habits', label: 'Habit Streaks' },
  { path: '/productivity/life-areas', label: 'Life Areas' },
];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FREQ_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'custom', label: 'Custom' },
] as const;

const CELEBRATION_MILESTONES = [7, 30, 100];

const HabitStreaksPage = () => {
  const { data: habits = [] } = useHabits();
  const { data: log = {} } = useHabitLog();
  const addHabitMut = useAddHabit();
  const deleteHabitMut = useDeleteHabit();
  const toggleHabitMut = useToggleHabit();
  const [newName, setNewName] = useState('');
  const [newFreq, setNewFreq] = useState<'daily' | 'weekdays' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [highlightPicker, setHighlightPicker] = useState(false);
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);
  const [celebration, setCelebration] = useState<{ name: string; milestone: number } | null>(null);
  const [searchParams] = useSearchParams();

  const today = getTodayKey();
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateKey === today;

  useEffect(() => {
    if (searchParams.get('backdate') === '1') {
      setSelectedDate(subDays(new Date(), 1));
      setHighlightPicker(true);
    }
  }, [searchParams]);

  const handleAdd = useCallback(() => {
    if (!newName.trim()) return;
    const frequency = newFreq === 'custom' ? customDays : newFreq;
    addHabitMut.mutate({ name: newName.trim(), frequency });
    setNewName('');
    setNewFreq('daily');
    setCustomDays([]);
    setShowAddForm(false);
  }, [newName, newFreq, customDays, addHabitMut]);

  const handleDelete = useCallback((id: string) => {
    deleteHabitMut.mutate(id);
  }, [deleteHabitMut]);

  const handleToggle = useCallback((habit: Habit) => {
    const wasDone = log[dateKey]?.includes(habit.id) || false;
    toggleHabitMut.mutate({ habitId: habit.id, date: dateKey });

    // Check celebration after toggle (only if completing)
    if (!wasDone) {
      const currentStreak = getHabitStreak(habit.id) + 1; // +1 since we just toggled
      const milestone = CELEBRATION_MILESTONES.find(m => m === currentStreak);
      if (milestone) {
        setCelebration({ name: habit.name, milestone });
        setTimeout(() => setCelebration(null), 3000);
      }
    }
  }, [dateKey, log, toggleHabitMut]);

  const handleLogPastData = useCallback(() => {
    setSelectedDate(subDays(new Date(), 1));
    setHighlightPicker(true);
  }, []);

  const toggleCustomDay = (day: number) => {
    setCustomDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const heatmap = getHeatmapData(112);
  const scheduledHabits = habits.filter(h => isHabitScheduledForDate(h, dateKey));

  return (
    <SubPageLayout
      title="Habit Streaks"
      backTo="/productivity"
      siblingRoutes={SIBLING_ROUTES}
      currentPath="/productivity/habits"
    >
      <div className="space-y-4">
        {/* Celebration overlay */}
        <AnimatePresence>
          {celebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-card border-2 border-primary rounded-2xl p-6 shadow-xl text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-lg font-bold">{celebration.milestone} Day Streak!</p>
                <p className="text-sm text-muted-foreground">{celebration.name}</p>
                <div className="mt-2 flex justify-center gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: -40 - Math.random() * 60, opacity: 0, x: (Math.random() - 0.5) * 80 }}
                      transition={{ duration: 1.5, delay: i * 0.1 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <BackdatePrompt moduleKey="habits" onLogPastData={handleLogPastData} />
        <BackdateDatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          highlight={highlightPicker}
          compact
        />

        {/* Heatmap */}
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Activity</p>
          <HeatmapGrid data={heatmap} />
          <div className="flex items-center justify-end gap-0.5 mt-1.5 text-[9px] text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-2.5 h-2.5 rounded-sm ${getHeatColor(level)}`} />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Add habit */}
        {!showAddForm ? (
          <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full h-9 text-sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Habit
          </Button>
        ) : (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-card rounded-xl border border-border p-3 space-y-3"
          >
            <Input
              placeholder="Habit name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="h-9 text-sm"
              autoFocus
            />
            {/* Frequency picker */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Frequency</p>
              <div className="flex gap-1.5">
                {FREQ_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setNewFreq(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      newFreq === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {newFreq === 'custom' && (
              <div className="flex gap-1">
                {DAYS.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => toggleCustomDay(i)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      customDays.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" className="flex-1 h-8 text-xs" disabled={!newName.trim()}>
                Add
              </Button>
              <Button onClick={() => { setShowAddForm(false); setNewName(''); }} size="sm" variant="outline" className="h-8 text-xs">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Habits list */}
        {scheduledHabits.length > 0 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              {isToday ? "Today's Habits" : format(selectedDate, 'd MMM yyyy')}
            </p>
            <div className="space-y-1">
              {scheduledHabits.map(habit => {
                const done = log[dateKey]?.includes(habit.id) || false;
                const streak = getHabitStreak(habit.id);
                const freqLabel = getFrequencyLabel(habit);
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border bg-card"
                  >
                    <button
                      onClick={() => handleToggle(habit)}
                      className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                        done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/40'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setDetailHabit(habit)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-sm">{habit.name}</p>
                      <div className="flex items-center gap-2">
                        {streak > 0 && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Flame className="h-2.5 w-2.5 text-amber-500" /> {streak}d
                          </p>
                        )}
                        {freqLabel && (
                          <p className="text-[10px] text-muted-foreground">{freqLabel}</p>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="text-muted-foreground/30 hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Show non-scheduled habits if any */}
        {habits.length > scheduledHabits.length && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              Not scheduled today
            </p>
            <div className="space-y-1 opacity-50">
              {habits.filter(h => !isHabitScheduledForDate(h, dateKey)).map(habit => (
                <div key={habit.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border bg-card">
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                    <X className="h-3 w-3 text-muted-foreground/30" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{habit.name}</p>
                    <p className="text-[10px] text-muted-foreground">{getFrequencyLabel(habit)}</p>
                  </div>
                  <button onClick={() => handleDelete(habit.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors flex-shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {habits.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Add habits to start building streaks.
          </p>
        )}
      </div>

      {/* Habit Detail Sheet */}
      <Sheet open={!!detailHabit} onOpenChange={() => setDetailHabit(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
          {detailHabit && <HabitDetailContent habit={detailHabit} log={log} />}
        </SheetContent>
      </Sheet>
    </SubPageLayout>
  );
};

function HabitDetailContent({ habit, log }: { habit: Habit; log: Record<string, string[]> }) {
  const streak = getHabitStreak(habit.id);
  const longest = getLongestStreak(habit.id);
  const rate = getHabitCompletionRate(habit.id, 30);

  // Mini heatmap for last 30 days
  const today = new Date();
  const miniHeatmap = Array.from({ length: 30 }, (_, i) => {
    const key = format(subDays(today, 29 - i), 'yyyy-MM-dd');
    return { date: key, done: log[key]?.includes(habit.id) || false };
  });

  return (
    <div className="space-y-4 pb-4">
      <SheetHeader>
        <SheetTitle className="text-base">{habit.name}</SheetTitle>
      </SheetHeader>
      <div className="flex gap-2">
        {[
          { label: 'Current', value: `${streak}d`, icon: Flame, color: 'text-amber-500' },
          { label: 'Longest', value: `${longest}d`, icon: Trophy, color: 'text-primary' },
          { label: '30d Rate', value: `${rate}%`, icon: TrendingUp, color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="flex-1 bg-muted/30 rounded-lg py-3 text-center">
            <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Last 30 Days</p>
        <div className="flex flex-wrap gap-1">
          {miniHeatmap.map(d => (
            <div
              key={d.date}
              className={`w-5 h-5 rounded-sm ${d.done ? 'bg-primary' : 'bg-muted'}`}
              title={d.date}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getFrequencyLabel(habit: Habit): string {
  if (!habit.frequency || habit.frequency === 'daily') return '';
  if (habit.frequency === 'weekdays') return 'Weekdays';
  if (Array.isArray(habit.frequency)) {
    return habit.frequency.map(d => DAYS[d]).join(' ');
  }
  return '';
}

function HeatmapGrid({ data }: { data: { date: string; count: number }[] }) {
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  const firstDate = new Date(data[0]?.date || new Date());
  const dayOfWeek = getDay(firstDate);
  for (let i = 0; i < dayOfWeek; i++) {
    currentWeek.push({ date: '', count: -1 });
  }

  data.forEach(d => {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="flex gap-px overflow-x-auto">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-px">
          {week.map((day, di) => (
            <div
              key={di}
              className={`w-2.5 h-2.5 rounded-sm ${day.count < 0 ? 'bg-transparent' : getHeatColor(day.count)}`}
              title={day.date ? `${day.date}: ${day.count}` : ''}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function getHeatColor(count: number): string {
  if (count <= 0) return 'bg-muted';
  if (count === 1) return 'bg-primary/20';
  if (count === 2) return 'bg-primary/40';
  if (count === 3) return 'bg-primary/60';
  return 'bg-primary/80';
}

export default HabitStreaksPage;

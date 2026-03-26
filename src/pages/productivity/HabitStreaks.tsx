import { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Flame, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import SubPageLayout from '@/components/SubPageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, getDay } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';
import {
  useHabits, useHabitLog, useAddHabit, useDeleteHabit, useToggleHabit,
  getHabitStreak, getHeatmapData, getLongestStreak, getHabitCompletionRate, getHabitHeatmapData,
} from '@/hooks/useHabitsQuery';
import { getTodayKey, isHabitScheduledForDate, type Habit } from '@/lib/productivity-storage';

const SIBLING_ROUTES = [
  { path: '/productivity/tasks', label: 'Daily Tasks' },
  { path: '/productivity/habits', label: 'Habit Streaks' },
  { path: '/productivity/life-areas', label: 'Life Areas' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const HabitStreaksPage = () => {
  const { data: habits = [] } = useHabits();
  const { data: log = {} } = useHabitLog();
  const addHabitMut = useAddHabit();
  const deleteHabitMut = useDeleteHabit();
  const toggleHabitMut = useToggleHabit();
  const [newName, setNewName] = useState('');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekdays' | number[]>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [highlightPicker, setHighlightPicker] = useState(false);
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);
  const [searchParams] = useSearchParams();
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

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
    addHabitMut.mutate({ name: newName.trim(), frequency: newFrequency });
    setNewName('');
    setNewFrequency('daily');
  }, [newName, newFrequency, addHabitMut]);

  const handleToggle = useCallback((habitId: string) => {
    toggleHabitMut.mutate({ habitId, date: dateKey });
    // Check for milestone
    const streak = getHabitStreak(habitId);
    if ([7, 30, 100].includes(streak + 1)) {
      setCelebrateId(habitId);
      setTimeout(() => setCelebrateId(null), 2500);
    }
  }, [dateKey, toggleHabitMut]);

  const heatmap = getHeatmapData(112);

  return (
    <SubPageLayout title="Habit Streaks" backTo="/productivity" siblingRoutes={SIBLING_ROUTES} currentPath="/productivity/habits">
      <div className="space-y-4">
        <BackdatePrompt moduleKey="habits" onLogPastData={() => { setSelectedDate(subDays(new Date(), 1)); setHighlightPicker(true); }} />
        <BackdateDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} highlight={highlightPicker} compact />

        {/* Celebration */}
        <AnimatePresence>
          {celebrateId && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center"
            >
              <p className="text-2xl mb-1">🎉</p>
              <p className="text-sm font-semibold text-primary">Milestone reached!</p>
              <p className="text-xs text-muted-foreground">Keep the streak going!</p>
            </motion.div>
          )}
        </AnimatePresence>

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
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="New habit..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 h-9 text-sm"
            />
            <Button onClick={handleAdd} size="icon" className="h-9 w-9" disabled={!newName.trim()}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          {/* Frequency selector */}
          <div className="flex gap-1.5">
            {(['daily', 'weekdays'] as const).map(f => (
              <button
                key={f}
                onClick={() => setNewFrequency(f)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                  newFrequency === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
                }`}
              >
                {f === 'daily' ? 'Daily' : 'Weekdays'}
              </button>
            ))}
            <button
              onClick={() => setNewFrequency(Array.isArray(newFrequency) ? 'daily' : [1, 3, 5])}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                Array.isArray(newFrequency) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
              }`}
            >
              Custom
            </button>
          </div>
          {Array.isArray(newFrequency) && (
            <div className="flex gap-1">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const arr = [...newFrequency];
                    const idx = arr.indexOf(i);
                    if (idx >= 0) arr.splice(idx, 1);
                    else arr.push(i);
                    setNewFrequency(arr.sort());
                  }}
                  className={`w-7 h-7 rounded-full text-[10px] font-medium transition-colors ${
                    newFrequency.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Habits list */}
        {habits.length > 0 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              {isToday ? "Today's Habits" : format(selectedDate, 'd MMM yyyy')}
            </p>
            <div className="space-y-1">
              {habits.map(habit => {
                const scheduled = isHabitScheduledForDate(habit, selectedDate);
                const done = log[dateKey]?.includes(habit.id) || false;
                const streak = getHabitStreak(habit.id);
                const freq = habit.frequency || 'daily';
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border bg-card ${!scheduled ? 'opacity-40' : ''}`}
                  >
                    <button
                      onClick={() => handleToggle(habit.id)}
                      disabled={!scheduled}
                      className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                        done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/40'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button onClick={() => setDetailHabit(habit)} className="flex-1 min-w-0 text-left">
                      <p className="text-sm">{habit.name}</p>
                      <div className="flex items-center gap-2">
                        {streak > 0 && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Flame className="h-2.5 w-2.5 text-amber-500" /> {streak}d
                          </p>
                        )}
                        {freq !== 'daily' && (
                          <div className="flex gap-0.5">
                            {DAY_LABELS.map((l, i) => {
                              const active = freq === 'weekdays' ? (i >= 1 && i <= 5) : (Array.isArray(freq) && freq.includes(i));
                              return (
                                <span key={i} className={`text-[7px] w-3 text-center ${active ? 'text-primary font-bold' : 'text-muted-foreground/30'}`}>
                                  {l}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </button>
                    <button onClick={() => deleteHabitMut.mutate(habit.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {habits.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">Add habits to start building streaks.</p>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!detailHabit} onOpenChange={() => setDetailHabit(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          {detailHabit && <HabitDetailContent habit={detailHabit} log={log} />}
        </SheetContent>
      </Sheet>
    </SubPageLayout>
  );
};

function HabitDetailContent({ habit, log }: { habit: Habit; log: Record<string, string[]> }) {
  const streak = getHabitStreak(habit.id);
  const longest = getLongestStreak(habit.id);
  const rate = getHabitCompletionRate(habit.id);
  const heatmap = getHabitHeatmapData(habit.id, 60);

  return (
    <div className="space-y-4 pb-4">
      <SheetHeader>
        <SheetTitle className="text-base">{habit.name}</SheetTitle>
      </SheetHeader>

      <div className="flex gap-2">
        {[
          { label: 'Current', value: `${streak}d` },
          { label: 'Longest', value: `${longest}d` },
          { label: '30d Rate', value: `${rate}%` },
        ].map(s => (
          <div key={s.label} className="flex-1 bg-muted/30 rounded-lg py-2.5 text-center">
            <p className="text-lg font-semibold text-primary">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mini heatmap */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Last 60 Days</p>
        <div className="flex flex-wrap gap-px">
          {heatmap.map(d => (
            <div
              key={d.date}
              className={`w-3 h-3 rounded-sm ${d.done ? 'bg-primary/70' : 'bg-muted'}`}
              title={d.date}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatmapGrid({ data }: { data: { date: string; count: number }[] }) {
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];
  const firstDate = new Date(data[0]?.date || new Date());
  const dayOfWeek = getDay(firstDate);
  for (let i = 0; i < dayOfWeek; i++) currentWeek.push({ date: '', count: -1 });
  data.forEach(d => {
    currentWeek.push(d);
    if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="flex gap-px overflow-x-auto">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-px">
          {week.map((day, di) => (
            <div key={di} className={`w-2.5 h-2.5 rounded-sm ${day.count < 0 ? 'bg-transparent' : getHeatColor(day.count)}`} title={day.date ? `${day.date}: ${day.count}` : ''} />
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

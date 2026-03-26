import { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Flame, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SubPageLayout from '@/components/SubPageLayout';
import { motion } from 'framer-motion';
import { format, subDays, getDay } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';
import {
  useHabits, useHabitLog, useAddHabit, useDeleteHabit, useToggleHabit,
  getHabitStreak, getHeatmapData,
} from '@/hooks/useHabitsQuery';
import { getTodayKey } from '@/lib/productivity-storage';

const SIBLING_ROUTES = [
  { path: '/productivity/tasks', label: 'Daily Tasks' },
  { path: '/productivity/habits', label: 'Habit Streaks' },
  { path: '/productivity/life-areas', label: 'Life Areas' },
];

const HabitStreaksPage = () => {
  const { data: habits = [] } = useHabits();
  const { data: log = {} } = useHabitLog();
  const addHabitMut = useAddHabit();
  const deleteHabitMut = useDeleteHabit();
  const toggleHabitMut = useToggleHabit();
  const [newName, setNewName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [highlightPicker, setHighlightPicker] = useState(false);
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
    addHabitMut.mutate({ name: newName.trim() });
    setNewName('');
  }, [newName, addHabitMut]);

  const handleDelete = useCallback((id: string) => {
    deleteHabitMut.mutate(id);
  }, [deleteHabitMut]);

  const handleToggle = useCallback((habitId: string) => {
    toggleHabitMut.mutate({ habitId, date: dateKey });
  }, [dateKey, toggleHabitMut]);

  const handleLogPastData = useCallback(() => {
    setSelectedDate(subDays(new Date(), 1));
    setHighlightPicker(true);
  }, []);

  const heatmap = getHeatmapData(112);

  return (
    <SubPageLayout
      title="Habit Streaks"
      backTo="/productivity"
      siblingRoutes={SIBLING_ROUTES}
      currentPath="/productivity/habits"
    >
      <div className="space-y-4">
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

        {/* Habits list */}
        {habits.length > 0 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              {isToday ? "Today's Habits" : format(selectedDate, 'd MMM yyyy')}
            </p>
            <div className="space-y-1">
              {habits.map(habit => {
                const done = log[dateKey]?.includes(habit.id) || false;
                const streak = getHabitStreak(habit.id);
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border bg-card"
                  >
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                        done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/40'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{habit.name}</p>
                      {streak > 0 && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Flame className="h-2.5 w-2.5 text-amber-500" /> {streak}d
                        </p>
                      )}
                    </div>
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

        {habits.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Add habits to start building streaks.
          </p>
        )}
      </div>
    </SubPageLayout>
  );
};

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

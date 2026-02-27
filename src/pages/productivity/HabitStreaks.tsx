import { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Flame, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import SubPageLayout from '@/components/SubPageLayout';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, getDay } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';
import {
  getHabits,
  addHabit,
  deleteHabit,
  getHabitLog,
  toggleHabitForDate,
  getHabitStreak,
  getHeatmapData,
  getTodayKey,
  Habit,
  HabitLog,
} from '@/lib/productivity-storage';

const SIBLING_ROUTES = [
  { path: '/productivity/tasks', label: 'Daily Tasks' },
  { path: '/productivity/habits', label: 'Habit Streaks' },
  { path: '/productivity/life-areas', label: 'Life Areas' },
];

const HabitStreaksPage = () => {
  const [habits, setHabits] = useState<Habit[]>(() => getHabits());
  const [log, setLog] = useState<HabitLog>(() => getHabitLog());
  const [newName, setNewName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [highlightPicker, setHighlightPicker] = useState(false);
  const [searchParams] = useSearchParams();

  const today = getTodayKey();
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateKey === today;

  // Handle ?backdate=1 from Settings "Log Past Data"
  useEffect(() => {
    if (searchParams.get('backdate') === '1') {
      setSelectedDate(subDays(new Date(), 1));
      setHighlightPicker(true);
    }
  }, [searchParams]);

  const handleAdd = useCallback(() => {
    if (!newName.trim()) return;
    setHabits(addHabit(newName.trim()));
    setNewName('');
  }, [newName]);

  const handleDelete = useCallback((id: string) => {
    setHabits(deleteHabit(id));
  }, []);

  const handleToggle = useCallback((habitId: string) => {
    setLog(toggleHabitForDate(habitId, dateKey));
  }, [dateKey]);

  const handleLogPastData = useCallback(() => {
    setSelectedDate(subDays(new Date(), 1));
    setHighlightPicker(true);
  }, []);

  const heatmap = getHeatmapData(112); // 16 weeks

  return (
    <SubPageLayout
      title="Habit Streaks"
      backTo="/productivity"
      siblingRoutes={SIBLING_ROUTES}
      currentPath="/productivity/habits"
    >
      <div className="space-y-6">
        {/* Backdate prompt */}
        <BackdatePrompt moduleKey="habits" onLogPastData={handleLogPastData} />

        {/* Date picker */}
        <div className="flex items-center justify-between">
          <BackdateDatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            highlight={highlightPicker}
            compact
          />
        </div>

        {/* Heatmap */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold">Activity Heatmap</h3>
            </div>
            <HeatmapGrid data={heatmap} />
            <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getHeatColor(level)}`}
                />
              ))}
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Add habit */}
        <div className="flex gap-2">
          <Input
            placeholder="New habit..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1"
          />
          <Button onClick={handleAdd} size="icon" disabled={!newName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Habits for selected date */}
        {habits.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {isToday ? "Today's Habits" : `Habits for ${format(selectedDate, 'd MMM yyyy')}`}
            </h3>
            <div className="space-y-2">
              {habits.map(habit => {
                const done = log[dateKey]?.includes(habit.id) || false;
                const streak = getHabitStreak(habit.id);
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      done ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
                    }`}
                  >
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${done ? 'text-primary' : ''}`}>{habit.name}</p>
                      {streak > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Flame className="h-3 w-3 text-accent" /> {streak} day streak
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {habits.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Flame className="h-10 w-10 mx-auto mb-3 text-accent/40" />
            <p className="text-sm">Add habits to start building streaks!</p>
          </div>
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
    <div className="flex gap-0.5 overflow-x-auto">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-0.5">
          {week.map((day, di) => (
            <div
              key={di}
              className={`w-3 h-3 rounded-sm ${day.count < 0 ? 'bg-transparent' : getHeatColor(day.count)}`}
              title={day.date ? `${day.date}: ${day.count} habits` : ''}
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

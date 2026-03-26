import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Circle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDailyTasks, useToggleTask, useTaskStreak } from '@/hooks/useTasksQuery';
import { useHabits, useHabitLog, useToggleHabit } from '@/hooks/useHabitsQuery';
import { getTodayKey, getWeeklyCompletionData, getLatestLifeAreaEntry, isHabitScheduledForDate } from '@/lib/productivity-storage';
import { format } from 'date-fns';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const Productivity = () => {
  const navigate = useNavigate();
  const today = getTodayKey();
  const { data: daily } = useDailyTasks(today);
  const { data: habits = [] } = useHabits();
  const { data: log = {} } = useHabitLog();
  const { data: streak = 0 } = useTaskStreak();
  const toggleTask = useToggleTask();
  const toggleHabit = useToggleHabit();
  const latestLA = getLatestLifeAreaEntry();

  const tasks = daily?.tasks ?? [];
  const mits = tasks.filter(t => t.isMIT);
  const mitsCompleted = mits.filter(t => t.completed).length;

  // Productivity Score
  const mitPct = mits.length > 0 ? (mitsCompleted / mits.length) * 100 : 0;
  const scheduledHabits = habits.filter(h => isHabitScheduledForDate(h, new Date()));
  const habitsDone = scheduledHabits.filter(h => log[today]?.includes(h.id)).length;
  const habitPct = scheduledHabits.length > 0 ? (habitsDone / scheduledHabits.length) * 100 : 0;
  const lifeAvg = latestLA
    ? (latestLA.scores.reduce((a, s) => a + s.score, 0) / latestLA.scores.length) * 10
    : 50;
  const productivityScore = Math.round(mitPct * 0.4 + habitPct * 0.3 + lifeAvg * 0.3);

  const weeklyData = getWeeklyCompletionData();
  const maxPct = Math.max(...weeklyData.map(d => d.pct), 1);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 pt-4 pb-2">
        <h1 className="text-base font-semibold">Productivity</h1>
      </div>

      <motion.main
        className="max-w-md mx-auto px-4 py-3 space-y-4"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Score Ring + Weekly Sparkline */}
        <motion.div variants={item} className="flex gap-3">
          {/* Score Ring */}
          <div className="bg-card rounded-xl border border-border p-3 flex flex-col items-center justify-center w-28 flex-shrink-0">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${productivityScore} ${100 - productivityScore}`}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{productivityScore}</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Score</p>
          </div>

          {/* Weekly Sparkline */}
          <div className="flex-1 bg-card rounded-xl border border-border p-3">
            <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground mb-2">This Week</p>
            <div className="flex items-end gap-1 h-12">
              {weeklyData.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className={`w-full rounded-sm transition-all duration-300 ${
                      d.pct > 0 ? 'bg-primary/70' : 'bg-muted'
                    }`}
                    style={{ height: `${Math.max((d.pct / maxPct) * 100, 8)}%`, minHeight: 3 }}
                  />
                  <span className="text-[8px] text-muted-foreground">
                    {format(new Date(d.date), 'EEE').charAt(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div variants={item} className="flex gap-2">
          {[
            { label: 'MITs', value: `${mitsCompleted}/${mits.length}`, color: 'text-amber-500' },
            { label: 'Habits', value: `${habitsDone}/${scheduledHabits.length}`, color: 'text-primary' },
            { label: 'Streak', value: `${streak}d`, color: 'text-amber-500' },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-card rounded-lg border border-border py-2 text-center">
              <p className={`text-base font-semibold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Inline MITs */}
        {mits.length > 0 && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Today's MITs</p>
              <button onClick={() => navigate('/productivity/tasks')} className="text-[10px] text-primary">View all</button>
            </div>
            <div className="space-y-1">
              {mits.map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleTask.mutate({ taskId: task.id, date: today })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border bg-card text-left active:bg-muted/60 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.text}
                  </span>
                  <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Habit Quick Row */}
        {scheduledHabits.length > 0 && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Habits</p>
              <button onClick={() => navigate('/productivity/habits')} className="text-[10px] text-primary">View all</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {scheduledHabits.map(habit => {
                const done = log[today]?.includes(habit.id) || false;
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit.mutate({ habitId: habit.id, date: today })}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all flex-shrink-0 ${
                      done
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {done ? '✓' : habit.name.charAt(0)}
                    </div>
                    <span className="text-[9px] text-muted-foreground max-w-[52px] truncate">{habit.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Nav pills */}
        <motion.div variants={item}>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {[
              { title: 'Daily Tasks', sub: 'Pomodoro timer & MITs', path: '/productivity/tasks' },
              { title: 'Habit Streaks', sub: 'Track daily habits', path: '/productivity/habits' },
              { title: 'Life Areas', sub: 'Self-assessment radar', path: '/productivity/life-areas' },
            ].map((f, idx, arr) => (
              <button
                key={f.title}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted/40 transition-colors active:bg-muted/60 ${
                  idx < arr.length - 1 ? 'border-b border-border' : ''
                }`}
                onClick={() => navigate(f.path)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground">{f.sub}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Productivity;

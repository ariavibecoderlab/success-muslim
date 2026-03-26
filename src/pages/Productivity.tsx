import { useNavigate } from 'react-router-dom';
import { ListChecks, Target, Flame, ChevronRight, CheckCircle2, Circle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { useDailyTasks, useToggleTask, useTaskStreak } from '@/hooks/useTasksQuery';
import { useHabits, useHabitLog, useToggleHabit } from '@/hooks/useHabitsQuery';
import { useLatestLifeAreaEntry } from '@/hooks/useLifeAreasQuery';
import { getTodayKey, getWeeklyCompletionData, isHabitScheduledForDate } from '@/lib/productivity-storage';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const Productivity = () => {
  const navigate = useNavigate();
  const today = getTodayKey();
  const { data: daily } = useDailyTasks(today);
  const toggleTask = useToggleTask();
  const { data: habits = [] } = useHabits();
  const { data: log = {} } = useHabitLog();
  const toggleHabit = useToggleHabit();
  const { data: streak = 0 } = useTaskStreak();
  const latestLA = useLatestLifeAreaEntry();

  const tasks = daily?.tasks ?? [];
  const mits = tasks.filter(t => t.isMIT);
  const mitsCompleted = mits.filter(t => t.completed).length;

  const scheduledHabits = habits.filter(h => isHabitScheduledForDate(h, today));
  const habitsToday = log[today]?.length || 0;
  const habitPct = scheduledHabits.length > 0 ? Math.round((habitsToday / scheduledHabits.length) * 100) : 0;

  const lifeAvg = latestLA
    ? latestLA.scores.reduce((a, s) => a + s.score, 0) / latestLA.scores.length
    : 5;

  // Productivity score: MITs 40%, habits 30%, life areas 30%
  const mitPct = mits.length > 0 ? (mitsCompleted / mits.length) * 100 : 100;
  const productivityScore = Math.round(mitPct * 0.4 + habitPct * 0.3 + (lifeAvg * 10) * 0.3);

  const weeklyData = getWeeklyCompletionData();

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
        {/* Score Ring + Weekly Chart */}
        <motion.div variants={item} className="flex gap-3">
          {/* Score Ring */}
          <div className="bg-card rounded-xl border border-border p-3 flex flex-col items-center justify-center w-28 flex-shrink-0">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${productivityScore * 0.974} 100`}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{productivityScore}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Score</p>
          </div>

          {/* Weekly Sparkline */}
          <div className="flex-1 bg-card rounded-xl border border-border p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">This Week</p>
            <div className="flex items-end gap-1.5 h-12">
              {weeklyData.map((d, i) => {
                const avg = Math.round((d.taskPct + d.habitPct) / 2);
                const isToday = d.date === today;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full relative" style={{ height: '36px' }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-sm transition-all ${isToday ? 'bg-primary' : 'bg-primary/30'}`}
                        style={{ height: `${Math.max(avg, 4)}%` }}
                      />
                    </div>
                    <span className={`text-[8px] ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {DAY_LABELS[new Date(d.date).getDay()]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Inline MITs */}
        {mits.length > 0 && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Today's MITs</p>
              <button onClick={() => navigate('/productivity/tasks')} className="text-[10px] text-primary">See all</button>
            </div>
            <div className="space-y-1">
              {mits.map(task => (
                <motion.button
                  key={task.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleTask.mutate({ taskId: task.id, date: today })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border bg-card text-left"
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
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Habit Quick-Row */}
        {scheduledHabits.length > 0 && (
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Habits · {habitsToday}/{scheduledHabits.length}
              </p>
              <button onClick={() => navigate('/productivity/habits')} className="text-[10px] text-primary">Details</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {scheduledHabits.map(habit => {
                const done = log[today]?.includes(habit.id) || false;
                return (
                  <motion.button
                    key={habit.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleHabit.mutate({ habitId: habit.id, date: today })}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border min-w-[60px] transition-colors ${
                      done ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {done ? '✓' : habit.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[9px] text-muted-foreground truncate max-w-[56px]">{habit.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Nav pills */}
        <motion.div variants={item}>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {[
              {
                icon: ListChecks,
                title: 'Daily Tasks',
                sub: `${mitsCompleted}/${mits.length} MITs done`,
                path: '/productivity/tasks',
              },
              {
                icon: Flame,
                title: 'Habit Streaks',
                sub: `${habitsToday}/${scheduledHabits.length} today`,
                path: '/productivity/habits',
              },
              {
                icon: Target,
                title: 'Life Areas',
                sub: `${(lifeAvg).toFixed(1)}/10 avg`,
                path: '/productivity/life-areas',
              },
            ].map((f, idx, arr) => (
              <button
                key={f.title}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted/40 transition-colors active:bg-muted/60 ${
                  idx < arr.length - 1 ? 'border-b border-border' : ''
                }`}
                onClick={() => navigate(f.path)}
              >
                <f.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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

import { useNavigate } from 'react-router-dom';
import { ListChecks, Target, Flame, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDailyTasks, getTaskStreak, getHabits, getHabitLog, getTodayKey, getLatestLifeAreaEntry } from '@/lib/productivity-storage';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const Productivity = () => {
  const navigate = useNavigate();
  const daily = getDailyTasks();
  const habits = getHabits();
  const log = getHabitLog();
  const today = getTodayKey();
  const streak = getTaskStreak();
  const latestLA = getLatestLifeAreaEntry();

  const mitsCompleted = daily.tasks.filter(t => t.isMIT && t.completed).length;
  const mitCount = daily.tasks.filter(t => t.isMIT).length;
  const habitsToday = log[today]?.length || 0;
  const avgScore = latestLA
    ? (latestLA.scores.reduce((a, s) => a + s.score, 0) / latestLA.scores.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
        <h1 className="text-base font-semibold">Productivity</h1>
      </div>

      <motion.main
        className="max-w-lg mx-auto px-4 py-3 space-y-4"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Quick stats */}
        <motion.div variants={item} className="flex gap-2">
          {[
            { label: 'MITs', value: `${mitsCompleted}/${mitCount}`, icon: Star, color: 'text-amber-500' },
            { label: 'Streak', value: `${streak}d`, icon: Flame, color: 'text-amber-500' },
            { label: 'Life', value: avgScore, icon: Target, color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-card rounded-lg border border-border py-2.5 text-center">
              <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Feature list */}
        <motion.div variants={item}>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {[
              {
                icon: ListChecks,
                title: 'Daily Tasks',
                sub: `${mitsCompleted}/${mitCount} MITs done`,
                path: '/productivity/tasks',
              },
              {
                icon: Flame,
                title: 'Habit Streaks',
                sub: `${habitsToday}/${habits.length} today`,
                path: '/productivity/habits',
              },
              {
                icon: Target,
                title: 'Life Areas',
                sub: `${avgScore}/10 avg`,
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

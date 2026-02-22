import { useNavigate } from 'react-router-dom';
import { ListChecks, Target, Flame, CheckCircle2, Star } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { getDailyTasks, getTaskStreak, getHabits, getHabitLog, getTodayKey, getLatestLifeAreaEntry } from '@/lib/productivity-storage';

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

  const features = [
    {
      icon: ListChecks,
      title: 'Daily Tasks',
      desc: '3 MITs to focus your day',
      stat: `${mitsCompleted}/${mitCount} MITs`,
      path: '/productivity/tasks',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Flame,
      title: 'Habit Streaks',
      desc: 'Build consistency with heatmaps',
      stat: `${habitsToday}/${habits.length} today`,
      path: '/productivity/habits',
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: Target,
      title: 'Life Areas',
      desc: 'Monthly self-assessment radar',
      stat: `${avgScore}/10 avg`,
      path: '/productivity/life-areas',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Productivity" />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero stats */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <ListChecks className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Plan with Purpose</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            Execute with tawakkul. Your Islamic productivity hub.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card>
            <CardContent className="p-3 text-center">
              <Star className="h-4 w-4 text-accent mx-auto mb-1" />
              <p className="text-lg font-bold">{mitsCompleted}/{mitCount}</p>
              <p className="text-xs text-muted-foreground">MITs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Flame className="h-4 w-4 text-accent mx-auto mb-1" />
              <p className="text-lg font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Target className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{avgScore}</p>
              <p className="text-xs text-muted-foreground">Life Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature cards */}
        <div className="space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-border"
                onClick={() => navigate(f.path)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">{f.stat}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Productivity;

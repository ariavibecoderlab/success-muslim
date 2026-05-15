import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth, isAfter, subDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { IFSession } from '@/lib/health-storage';

interface Props {
  sessions: IFSession[];
}

function getSessionDates(sessions: IFSession[]): Record<string, { count: number; completed: number }> {
  const map: Record<string, { count: number; completed: number }> = {};
  for (const s of sessions) {
    if (!s.startTime) continue;
    const key = format(new Date(s.startTime), 'yyyy-MM-dd');
    if (!map[key]) map[key] = { count: 0, completed: 0 };
    map[key].count++;
    if (s.completed) map[key].completed++;
  }
  return map;
}

function getHeatColor(data: { count: number; completed: number } | undefined): string {
  if (!data || data.count === 0) return 'bg-secondary';
  if (data.completed > 0) return 'bg-primary';
  return 'bg-primary/30';
}

function calculateStreak(sessions: IFSession[]): number {
  const completedDates = new Set<string>();
  for (const s of sessions) {
    if (s.completed && s.startTime) {
      completedDates.add(format(new Date(s.startTime), 'yyyy-MM-dd'));
    }
  }

  let streak = 0;
  let day = new Date();

  // Check today first; if not fasted today, start from yesterday
  const todayKey = format(day, 'yyyy-MM-dd');
  if (!completedDates.has(todayKey)) {
    day = subDays(day, 1);
  }

  while (completedDates.has(format(day, 'yyyy-MM-dd'))) {
    streak++;
    day = subDays(day, 1);
  }

  return streak;
}

function getWeeklyCount(sessions: IFSession[]): number {
  const weekAgo = subDays(new Date(), 7);
  return sessions.filter(s => 
    s.completed && s.startTime && new Date(s.startTime) >= weekAgo
  ).length;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function FastingCalendarHeatmap({ sessions }: Props) {
  const [month, setMonth] = useState(new Date());
  const today = new Date();

  const dateMap = useMemo(() => getSessionDates(sessions), [sessions]);
  const streak = useMemo(() => calculateStreak(sessions), [sessions]);
  const weeklyCount = useMemo(() => getWeeklyCount(sessions), [sessions]);

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const firstDayOffset = getDay(days[0]);
  const completedDays = days.filter(d => dateMap[format(d, 'yyyy-MM-dd')]?.completed).length;
  const totalFasts = days.reduce((sum, d) => sum + (dateMap[format(d, 'yyyy-MM-dd')]?.count || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Streak + Weekly Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">{streak} day{streak !== 1 ? 's' : ''}</p>
              <p className="text-[10px] text-muted-foreground">Current Streak</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold leading-tight">{weeklyCount}</p>
            <p className="text-[10px] text-muted-foreground">This Week</p>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fasting History</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth(m => subMonths(m, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">{format(month, 'MMMM yyyy')}</span>
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              onClick={() => setMonth(m => addMonths(m, 1))}
              disabled={isSameMonth(month, today) || isAfter(month, today)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar grid */}
        <motion.div className="grid grid-cols-7 gap-1" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.008 } } }}>
          {WEEKDAYS.map(d => (
            <div key={d} className="text-[9px] text-muted-foreground text-center font-medium">{d}</div>
          ))}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const data = dateMap[key];
            const isFuture = isAfter(day, today);
            const isToday = isSameDay(day, today);
            return (
              <motion.div
                key={key}
                variants={{ hidden: { opacity: 0, scale: 0.7 }, visible: { opacity: 1, scale: 1 } }}
                className={`aspect-square rounded-sm flex items-center justify-center text-[9px] ${
                  isFuture ? 'bg-secondary/30 text-muted-foreground/30' : getHeatColor(data)
                } ${data?.completed ? 'text-primary-foreground font-medium' : 'text-foreground/70'} ${
                  isToday ? 'ring-1 ring-primary' : ''
                }`}
                title={`${format(day, 'MMM d')}: ${data?.count || 0} fast(s)`}
              >
                {day.getDate()}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <span className="text-[9px] text-muted-foreground">No fast</span>
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <div className="w-3 h-3 rounded-sm bg-primary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-[9px] text-muted-foreground">Completed</span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50">
          <div className="text-center">
            <p className="text-sm font-bold">{totalFasts}</p>
            <p className="text-[9px] text-muted-foreground">Total Fasts</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">{completedDays}</p>
            <p className="text-[9px] text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">{days.length > 0 ? Math.round((completedDays / days.length) * 100) : 0}%</p>
            <p className="text-[9px] text-muted-foreground">Consistency</p>
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth, isAfter } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StepLog {
  date: string;
  steps: number;
}

interface Props {
  logs: StepLog[];
  dailyTarget: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getHeatColor(steps: number, target: number): string {
  if (steps === 0) return 'bg-secondary';
  const ratio = steps / target;
  if (ratio >= 1) return 'bg-primary';
  if (ratio >= 0.75) return 'bg-primary/70';
  if (ratio >= 0.5) return 'bg-primary/45';
  if (ratio >= 0.25) return 'bg-primary/25';
  return 'bg-primary/10';
}

export default function StepsCalendarHeatmap({ logs, dailyTarget }: Props) {
  const [month, setMonth] = useState(new Date());
  const today = new Date();

  const dayTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of logs) {
      map[l.date] = (map[l.date] || 0) + l.steps;
    }
    return map;
  }, [logs]);

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const firstDayOffset = getDay(days[0]);

  const monthTotal = days.reduce((sum, d) => sum + (dayTotals[format(d, 'yyyy-MM-dd')] || 0), 0);
  const activeDays = days.filter(d => (dayTotals[format(d, 'yyyy-MM-dd')] || 0) > 0).length;
  const targetDays = days.filter(d => (dayTotals[format(d, 'yyyy-MM-dd')] || 0) >= dailyTarget).length;
  const avgSteps = activeDays > 0 ? Math.round(monthTotal / days.length) : 0;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Overview</p>
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

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-[9px] text-muted-foreground text-center font-medium">{d}</div>
          ))}

          {/* Offset cells */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const steps = dayTotals[key] || 0;
            const isFuture = isAfter(day, today);
            return (
              <div
                key={key}
                className={`aspect-square rounded-sm flex items-center justify-center text-[9px] relative group ${
                  isFuture ? 'bg-secondary/30 text-muted-foreground/30' : getHeatColor(steps, dailyTarget)
                } ${steps >= dailyTarget ? 'text-primary-foreground font-medium' : 'text-foreground/70'}`}
                title={`${format(day, 'MMM d')}: ${steps.toLocaleString()} steps`}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <span className="text-[9px] text-muted-foreground">Less</span>
          {['bg-secondary', 'bg-primary/10', 'bg-primary/25', 'bg-primary/45', 'bg-primary/70', 'bg-primary'].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[9px] text-muted-foreground">More</span>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-border/50">
          <div className="text-center">
            <p className="text-sm font-bold">{monthTotal.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">{avgSteps.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">Daily Avg</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">{activeDays}</p>
            <p className="text-[9px] text-muted-foreground">Active Days</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">{targetDays}</p>
            <p className="text-[9px] text-muted-foreground">Target Hit</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

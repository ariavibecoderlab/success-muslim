import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Timer, Flame, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getIFSessions } from '@/lib/health-storage';
import { getCurrentStage, getNextStage } from '@/lib/fasting-stages';
import { format } from 'date-fns';
import type { WidgetSize } from '@/lib/widget-registry';
import { useFastingStore } from '@/stores/fastingStore';

function calculateStreak(sessions: ReturnType<typeof getIFSessions>): number {
  const completedDates = new Set(
    sessions.filter(s => s.completed && s.startTime).map(s => s.startTime.slice(0, 10))
  );
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (completedDates.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (streak === 0) {
      d.setDate(d.getDate() - 1);
      if (!completedDates.has(d.toISOString().slice(0, 10))) break;
    } else break;
  }
  return streak;
}

export default function IFFastingWidget({ size }: { size: WidgetSize }) {
  const { isActiveFast, activeFast: active, elapsedSeconds, hydrate, tick, endFast } = useFastingStore();
  const sessions = getIFSessions();

  useEffect(() => { hydrate(); }, []);

  useEffect(() => {
    if (!isActiveFast) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isActiveFast]);

  // ===== INACTIVE STATE =====
  if (!isActiveFast || !active) {
    const lastFast = sessions.find(s => s.completed);
    const streak = calculateStreak(sessions);

    return (
      <Link to="/health/if-timer">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Timer className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">IF Timer</p>
                {lastFast ? (
                  <p className="text-xs text-muted-foreground">
                    Last: {format(new Date(lastFast.startTime), 'dd MMM')} · {lastFast.mode}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No fasts yet</p>
                )}
              </div>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">{streak} day streak</span>
              </div>
            )}
            <div className="flex justify-end">
              <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                <Play className="h-3 w-3" /> Start Fast
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // ===== ACTIVE STATE =====
  const elapsed = elapsedSeconds * 1000;
  const elapsedHours = elapsedSeconds / 3600;
  const total = active.fastingHours * 3600000;
  const remaining = Math.max(0, total - elapsed);
  const progress = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0;

  const start = new Date(active.startTime).getTime();
  const stage = getCurrentStage(elapsedHours);
  const next = getNextStage(elapsedHours);
  const endTime = new Date(start + total);

  const totalSec = elapsedSeconds;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const elapsedStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  const formatNextLevel = () => {
    if (!next) return null;
    const hrs = Math.floor(next.hoursUntil);
    const mins = Math.round((next.hoursUntil - hrs) * 60);
    return `${next.stage.name} in ${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
  };

  return (
    <Link to="/health/if-timer">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Timer className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  Lv.{stage.level}
                </span>
                <p className="text-sm font-semibold truncate">You're fasting!</p>
              </div>
              <p className="text-xs font-mono font-bold text-foreground">{elapsedStr}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Ends: {format(endTime, 'HH:mm, dd MMM')}</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <Progress value={progress} className="h-1.5" />

          <div className="flex items-center justify-between">
            {next ? (
              <p className="text-[10px] text-muted-foreground">{formatNextLevel()}</p>
            ) : (
              <p className="text-[10px] text-primary font-medium">Max stage!</p>
            )}
            <Button
              size="sm" variant="outline" className="text-xs h-6 px-2"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); endFast(true); }}
            >
              End Fast
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

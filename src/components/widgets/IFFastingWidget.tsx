import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getActiveIF, stopIF } from '@/lib/health-storage';
import { getCurrentStage, getNextStage } from '@/lib/fasting-stages';
import type { WidgetSize } from '@/lib/widget-registry';

export default function IFFastingWidget({ size }: { size: WidgetSize }) {
  const [active, setActive] = useState(getActiveIF());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) {
    return (
      <Link to="/health/if-timer">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Timer className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">IF Fasting</p>
              <p className="text-xs text-muted-foreground">No active fast</p>
            </div>
            <span className="text-[10px] text-primary font-medium">Start Fast →</span>
          </CardContent>
        </Card>
      </Link>
    );
  }

  const start = new Date(active.startTime).getTime();
  const elapsed = Math.max(0, now - start);
  const elapsedHours = elapsed / 3600000;
  const total = active.fastingHours * 3600000;
  const remaining = Math.max(0, total - elapsed);
  const progress = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0;

  const stage = getCurrentStage(elapsedHours);
  const next = getNextStage(elapsedHours);
  const StageIcon = stage.icon;

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const remainingText = remaining <= 0 ? 'Complete!' : `${h}h ${m}m remaining`;

  const formatNextLevel = () => {
    if (!next) return null;
    const hrs = Math.floor(next.hoursUntil);
    const mins = Math.round((next.hoursUntil - hrs) * 60);
    return `Next level in: ${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
  };

  return (
    <Link to="/health/if-timer">
      <Card>
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <StageIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  Lv.{stage.level}
                </span>
                <p className="text-sm font-semibold truncate">{stage.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{remainingText}</p>
            </div>
          </div>

          <Progress value={progress} className="h-1.5" />

          <div className="flex items-center justify-between">
            {next && (
              <p className="text-[10px] text-muted-foreground">{formatNextLevel()}</p>
            )}
            {!next && (
              <p className="text-[10px] text-primary font-medium">Max stage reached!</p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6 px-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopIF(true);
                setActive(null);
              }}
            >
              Break Fast
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getActiveIF, stopIF } from '@/lib/health-storage';
import type { WidgetSize } from '@/lib/widget-registry';

export default function IFFastingWidget({ size }: { size: WidgetSize }) {
  const [active, setActive] = useState(getActiveIF());
  const [remaining, setRemaining] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const start = new Date(active.startTime).getTime();
      const end = start + active.fastingHours * 3600000;
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setRemaining('Complete!');
        setProgress(100);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${h}h ${m}m remaining`);
      setProgress(((now - start) / (end - start)) * 100);
    };
    tick();
    const interval = setInterval(tick, 60000);
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

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Timer className="h-4 w-4 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">⏱️ IF Fasting Active</p>
            <p className="text-xs text-muted-foreground">{remaining}</p>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 mb-2" />
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-7"
          onClick={(e) => {
            e.preventDefault();
            stopIF(true);
            setActive(null);
          }}
        >
          Break Fast
        </Button>
      </CardContent>
    </Card>
  );
}

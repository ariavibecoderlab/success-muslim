import { Footprints } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getStepsToday, getStepsPrefs, getStepsStreak } from '@/lib/steps-storage';
import type { WidgetSize } from '@/lib/widget-registry';

export default function StepsWidget({ size }: { size: WidgetSize }) {
  const { total } = getStepsToday();
  const prefs = getStepsPrefs();
  const streak = getStepsStreak();
  const pct = Math.min(Math.round((total / prefs.dailyTarget) * 100), 100);

  if (size === 'small') {
    return (
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-3 text-center">
          <Footprints className="h-4 w-4 mx-auto text-primary mb-1" />
          <p className="text-sm font-bold">{total.toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">Steps</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Footprints className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Steps Today</p>
            <p className="text-xs text-muted-foreground">{total.toLocaleString()} / {prefs.dailyTarget.toLocaleString()} · {pct}%</p>
          </div>
        </div>
        <Progress value={pct} className="h-1.5" />
        {streak > 0 && (
          <p className="text-[10px] text-muted-foreground mt-1.5">{streak} day streak</p>
        )}
      </CardContent>
    </Card>
  );
}

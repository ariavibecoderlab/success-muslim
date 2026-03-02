import { Link } from 'react-router-dom';
import { ListChecks } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDailyTasks } from '@/hooks/useTasksQuery';
import { getTodayKey } from '@/lib/productivity-storage';
import type { WidgetSize } from '@/lib/widget-registry';

export default function TasksTodayWidget({ size }: { size: WidgetSize }) {
  const { data: daily } = useDailyTasks(getTodayKey());
  const tasks = daily?.tasks ?? [];
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  if (size === 'small') {
    return (
      <Link to="/productivity/tasks">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 text-center">
            <ListChecks className="h-4 w-4 mx-auto text-accent-foreground mb-1" />
            <p className="text-sm font-bold">{done}/{total}</p>
            <p className="text-[9px] text-muted-foreground">Tasks</p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to="/productivity/tasks">
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <ListChecks className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">✅ Tasks Today</p>
                <p className="text-xs text-muted-foreground">{done} / {total} done</p>
              </div>
            </div>
            {total === 0 && (
              <span className="text-[10px] text-primary font-medium">Add Tasks →</span>
            )}
          </div>
          {total > 0 && (
            <>
              <Progress value={pct} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{pct}%</p>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

import { Link } from 'react-router-dom';
import { BedDouble } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getSleepLog, sleepQuality } from '@/lib/health-storage';
import type { WidgetSize } from '@/lib/widget-registry';

export default function SleepWidget({ size }: { size: WidgetSize }) {
  const log = getSleepLog();
  const lastEntry = log.length > 0 ? log[log.length - 1] : null;

  if (!lastEntry) {
    return (
      <Link to="/health/sleep">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <BedDouble className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">😴 Sleep</p>
              <p className="text-xs text-muted-foreground">No data logged yet</p>
            </div>
            <span className="text-[10px] text-primary font-medium">Log Sleep →</span>
          </CardContent>
        </Card>
      </Link>
    );
  }

  const quality = sleepQuality(lastEntry.duration);
  const emoji = lastEntry.duration >= 7 && lastEntry.duration <= 9 ? '😊' : lastEntry.duration < 6 ? '😴' : '😐';

  if (size === 'small') {
    return (
      <Link to="/health/sleep">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 text-center">
            <BedDouble className="h-4 w-4 mx-auto text-secondary-foreground mb-1" />
            <p className="text-sm font-bold">{lastEntry.duration}h</p>
            <p className="text-[9px] text-muted-foreground">Sleep</p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to="/health/sleep">
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <BedDouble className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">😴 Sleep Last Night</p>
              <p className="text-xs text-muted-foreground">
                {lastEntry.duration} hours · <span className={quality.color}>{quality.label}</span> {emoji}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

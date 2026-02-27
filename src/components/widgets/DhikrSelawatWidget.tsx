import { Link } from 'react-router-dom';
import { HandHeart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDhikrDaily } from '@/hooks/useDhikrQuery';
import type { WidgetSize } from '@/lib/widget-registry';

export default function DhikrSelawatWidget({ size }: { size: WidgetSize }) {
  const { data: daily } = useDhikrDaily();
  const selawatSession = daily.sessions.find(s => s.presetId === 'salawat');
  const selawatCount = selawatSession?.count || 0;
  const selawatTarget = selawatSession?.target || 100;
  const dhikrTarget = 1000;

  if (size === 'small') {
    return (
      <Link to="/iman/dhikr">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 text-center">
            <HandHeart className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">{daily.totalCount}</p>
            <p className="text-[9px] text-muted-foreground">Dhikr</p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to="/iman/dhikr">
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <HandHeart className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-semibold">Dhikr & Selawat</p>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Dhikr</span>
                <span className="font-medium">{daily.totalCount.toLocaleString()}/{dhikrTarget.toLocaleString()}</span>
              </div>
              <Progress value={Math.min((daily.totalCount / dhikrTarget) * 100, 100)} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Selawat</span>
                <span className="font-medium">{selawatCount}/{selawatTarget}</span>
              </div>
              <Progress value={Math.min((selawatCount / selawatTarget) * 100, 100)} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

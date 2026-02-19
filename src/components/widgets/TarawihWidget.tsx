import { Link } from 'react-router-dom';
import { Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useHijriDate } from '@/hooks/useHijriDate';
import type { WidgetSize } from '@/lib/widget-registry';

export default function TarawihWidget({ size }: { size: WidgetSize }) {
  const { isRamadan, ramadanDay } = useHijriDate();

  if (!isRamadan) return null;

  const nightsRemaining = 30 - ramadanDay;

  if (size === 'small') {
    return (
      <Link to="/iman/ramadan">
        <Card className="hover:shadow-sm transition-shadow bg-primary/5">
          <CardContent className="p-3 text-center">
            <Moon className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">Night {ramadanDay}</p>
            <p className="text-[9px] text-muted-foreground">Tarawih</p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to="/iman/ramadan">
      <Card className="hover:shadow-sm transition-shadow bg-primary/5 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Moon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">🌙 Tarawih Tonight</p>
              <p className="text-[10px] text-muted-foreground">Night {ramadanDay} · {nightsRemaining} nights remaining</p>
            </div>
          </div>
          <Progress value={(ramadanDay / 30) * 100} className="h-1.5" />
        </CardContent>
      </Card>
    </Link>
  );
}

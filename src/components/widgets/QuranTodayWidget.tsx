import { Link } from 'react-router-dom';
import { BookOpen, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getQuranDay, getQuranStreak } from '@/lib/quran-storage';
import type { WidgetSize } from '@/lib/widget-registry';

export default function QuranTodayWidget({ size }: { size: WidgetSize }) {
  const today = getQuranDay();
  const streak = getQuranStreak();

  if (size === 'small') {
    return (
      <Link to="/iman/quran">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 text-center">
            <BookOpen className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">{today.pagesRead}</p>
            <p className="text-[9px] text-muted-foreground">Pages</p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to="/iman/quran">
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-semibold">Quran Today</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              {today.juzNumber && <p className="text-xs text-muted-foreground">Juz {today.juzNumber} · Page {today.pagesRead}</p>}
              <p className="text-xs text-muted-foreground">
                {today.pagesRead} pages read
                {streak > 0 && (
                  <span className="inline-flex items-center gap-0.5 ml-1">
                    · {streak} day streak <Flame className="h-3 w-3 text-accent-foreground inline" />
                  </span>
                )}
              </p>
            </div>
            {today.pagesRead === 0 && (
              <span className="text-[10px] text-primary font-medium">Start Reading →</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

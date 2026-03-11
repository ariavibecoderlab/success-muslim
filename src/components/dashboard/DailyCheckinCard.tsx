import { Sparkles, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';

const POINTS = [10, 10, 15, 20, 25, 30, 150];

export default function DailyCheckinCard() {
  const { claimedToday, streakDay, pointsToday, claim, claiming } = useDailyCheckin();
  const displayDay = streakDay;

  return (
    <Card className="border-0 shadow-sm rounded-2xl">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <p className="text-base font-semibold">
              {claimedToday ? 'Sudah check-in hari ini' : 'Daily Check-in'}
            </p>
          </div>
          {!claimedToday && (
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs h-8 px-4 rounded-full font-semibold"
              onClick={() => claim()}
              disabled={claiming}
            >
              Claim +{pointsToday}
            </Button>
          )}
          {claimedToday && (
            <span className="text-xs text-muted-foreground font-medium">+{pointsToday} pts</span>
          )}
        </div>

        {/* 7-day dots */}
        <div className="flex items-center justify-center gap-2">
          {POINTS.map((pts, i) => {
            const dayNum = i + 1;
            const isDone = claimedToday ? dayNum <= streakDay : dayNum < streakDay;
            const isCurrent = dayNum === displayDay;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-800 text-white'
                      : isCurrent && !claimedToday
                        ? 'ring-2 ring-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : dayNum}
                </div>
                <span className="text-[9px] text-muted-foreground">+{pts}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

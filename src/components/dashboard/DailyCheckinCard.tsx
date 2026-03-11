import { Sparkles, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';

const POINTS = [10, 10, 15, 20, 25, 30, 150];

export default function DailyCheckinCard() {
  const { claimedToday, streakDay, pointsToday, claim, claiming } = useDailyCheckin();
  const displayDay = claimedToday ? streakDay : streakDay;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {claimedToday ? 'Sudah check-in hari ini' : `Daily Check-in`}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {claimedToday
                  ? `+${pointsToday} pts hari ini`
                  : `Hari ${displayDay}/7 · +${pointsToday} pts`}
              </p>
            </div>
          </div>
          {claimedToday ? (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-4 w-4 text-primary" />
            </div>
          ) : (
            <Button
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => claim()}
              disabled={claiming}
            >
              Claim
            </Button>
          )}
        </div>

        {/* 7-day dots */}
        <div className="flex items-center gap-1.5 justify-center">
          {POINTS.map((pts, i) => {
            const dayNum = i + 1;
            const isDone = claimedToday ? dayNum <= streakDay : dayNum < streakDay;
            const isCurrent = dayNum === displayDay;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
                    isDone
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent && !claimedToday
                        ? 'ring-2 ring-primary bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isDone ? <Check className="h-2.5 w-2.5" /> : dayNum}
                </div>
                <span className="text-[7px] text-muted-foreground">+{pts}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

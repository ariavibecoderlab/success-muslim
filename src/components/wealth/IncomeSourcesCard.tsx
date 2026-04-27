import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIncomeSources } from '@/hooks/useIncomeSources';
import { getIncomeCategory } from '@/lib/wealth-categories';

type Period = 'today' | 'week' | 'month';

const PERIOD_LABEL: Record<Period, string> = {
  today: 'today',
  week: 'this week',
  month: 'this month',
};

export default function IncomeSourcesCard() {
  const navigate = useNavigate();
  const { data, isLoading } = useIncomeSources();
  const [period, setPeriod] = useState<Period>('month');

  if (isLoading || !data) return null;

  const bucket = data[period];
  const todayTotal = data.today.total;
  const weekTotal = data.week.total;

  const handleLogIncome = () => {
    navigate('/wealth/budget', { state: { openAdd: true, type: 'income' } });
  };

  return (
    <Card className="mb-4 border-border shadow-sm">
      <CardContent className="p-4">
        {/* Header + period toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Income Sources
            </h3>
          </div>
          <div className="flex bg-muted rounded-full p-0.5 text-[10px] font-medium">
            {(['today', 'week', 'month'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-full transition-colors capitalize ${
                  period === p
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p === 'today' ? 'Day' : p === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-primary tabular-nums">
              {bucket.total.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground">{PERIOD_LABEL[period]}</span>
          </div>
          {bucket.count > 0 && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {bucket.count} {bucket.count === 1 ? 'entry' : 'entries'} across {bucket.sources.length} {bucket.sources.length === 1 ? 'source' : 'sources'}
            </p>
          )}
        </div>

        {/* Source breakdown or empty state */}
        {bucket.sources.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-center mb-3">
            <p className="text-xs text-muted-foreground">
              No income recorded {PERIOD_LABEL[period]}
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-3">
            {bucket.sources.map(s => {
              const cat = getIncomeCategory(s.category);
              const Icon = cat.icon;
              return (
                <div key={s.category} className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${cat.color}1f` }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-medium truncate">
                        {cat.label}
                        <span className="text-muted-foreground font-normal ml-1">
                          · {s.count} {s.count === 1 ? 'entry' : 'entries'}
                        </span>
                      </span>
                      <span className="text-xs font-semibold tabular-nums whitespace-nowrap">
                        {s.amount.toLocaleString()}
                        <span className="text-[10px] text-muted-foreground font-normal ml-1">
                          {s.pct}%
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-muted overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.max(2, s.pct)}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Today / Week mini-stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted-foreground">Today</p>
            <p className="text-sm font-semibold tabular-nums">
              {todayTotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted-foreground">This Week</p>
            <p className="text-sm font-semibold tabular-nums">
              {weekTotal.toLocaleString()}
            </p>
          </div>
        </div>

        <Button onClick={handleLogIncome} className="w-full h-9 gap-1.5" size="sm">
          <Plus className="h-3.5 w-3.5" /> Log income
        </Button>
      </CardContent>
    </Card>
  );
}

import { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getIncomeCategory } from '@/lib/wealth-categories';
import {
  formatLastEntry,
  type IncomeSource,
  type IncomeTransaction,
} from '@/hooks/useIncomeSources';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: IncomeSource | null;
  history: { month: string; total: number }[];
  recent: IncomeTransaction[];
  onQuickAdd: (category: string) => void;
  formatAmount: (n: number) => string;
}

export default function IncomeSourceDetailSheet({
  open,
  onOpenChange,
  source,
  history,
  recent,
  onQuickAdd,
  formatAmount,
}: Props) {
  const cat = source ? getIncomeCategory(source.category) : null;
  const Icon = cat?.icon;

  const chartData = useMemo(
    () =>
      history.map(h => ({
        label: format(parseISO(`${h.month}-01`), 'MMM'),
        total: h.total,
      })),
    [history],
  );

  const maxValue = useMemo(
    () => Math.max(0, ...chartData.map(d => d.total)),
    [chartData],
  );

  if (!source || !cat) return null;

  const trendIcon =
    source.trendPct === null ? (
      <Minus className="h-3 w-3" />
    ) : source.trendPct > 0 ? (
      <ArrowUpRight className="h-3 w-3" />
    ) : source.trendPct < 0 ? (
      <ArrowDownRight className="h-3 w-3" />
    ) : (
      <Minus className="h-3 w-3" />
    );

  const trendColor =
    source.trendPct === null
      ? 'text-muted-foreground'
      : source.trendPct > 0
      ? 'text-emerald-600'
      : source.trendPct < 0
      ? 'text-destructive'
      : 'text-muted-foreground';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-w-md mx-auto p-4 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${cat.color}1f` }}
            >
              {Icon && <Icon className="h-5 w-5" style={{ color: cat.color }} />}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base">{cat.label}</SheetTitle>
              <p className="text-[11px] text-muted-foreground">
                Last entry {formatLastEntry(source.lastEntryDate)} · {source.count} {source.count === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold tabular-nums">{formatAmount(source.amount)}</p>
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${trendColor}`}>
                {trendIcon}
                {source.trendPct === null
                  ? 'no prior'
                  : `${source.trendPct > 0 ? '+' : ''}${source.trendPct}%`}
              </span>
            </div>
          </div>
        </SheetHeader>

        {/* 6-month chart */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Last 6 months
          </p>
          {maxValue === 0 ? (
            <div className="h-24 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center">
              <p className="text-[11px] text-muted-foreground">No history for this source</p>
            </div>
          ) : (
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid hsl(var(--border))',
                      fontSize: 11,
                      padding: '4px 8px',
                    }}
                    formatter={(v: number) => [formatAmount(v), cat.label]}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={cat.color} fillOpacity={i === chartData.length - 1 ? 1 : 0.55} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent entries */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Recent entries
          </p>
          {recent.length === 0 ? (
            <p className="text-[11px] text-muted-foreground py-2">No entries in last 90 days.</p>
          ) : (
            <div className="rounded-lg border border-border divide-y divide-border">
              {recent.map((t, i) => (
                <div key={t.id ?? i} className="flex items-center gap-2 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {t.description || cat.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(parseISO(t.date), 'd MMM yyyy')}
                    </p>
                  </div>
                  <p className="text-xs font-semibold tabular-nums">
                    {formatAmount(Number(t.amount || 0))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full gap-1.5"
          onClick={() => {
            onOpenChange(false);
            // Defer slightly so the sheet finishes closing before the inline form opens.
            setTimeout(() => onQuickAdd(source.category), 150);
          }}
        >
          <Plus className="h-4 w-4" /> Add to {cat.label}
        </Button>
      </SheetContent>
    </Sheet>
  );
}

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Plus,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Trophy,
  Sparkles,
  CalendarRange,
  X as XIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import {
  useIncomeSources,
  formatLastEntry,
  type IncomeSource,
} from '@/hooks/useIncomeSources';
import { INCOME_CATEGORIES, getIncomeCategory } from '@/lib/wealth-categories';
import Sparkline from './Sparkline';
import InlineIncomeQuickAdd from './InlineIncomeQuickAdd';
import IncomeSourceDetailSheet from './IncomeSourceDetailSheet';

type Period = 'today' | 'week' | 'month';

const PERIOD_SHORT: Record<Period, string> = { today: 'Day', week: 'Week', month: 'Month' };
const PERIOD_LABEL: Record<Period, string> = {
  today: 'today',
  week: 'this week',
  month: 'this month',
};
const PRIMARY_HSL = 'hsl(142, 71%, 35%)'; // emerald, brand-aligned

const HIDE_KEY = 'wealth_hide_amounts';

function getInitialHide(): boolean {
  try {
    return localStorage.getItem(HIDE_KEY) === '1';
  } catch {
    return false;
  }
}

function TrendBadge({ pct, compact = false }: { pct: number | null; compact?: boolean }) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
        <Minus className="h-2.5 w-2.5" /> {compact ? '—' : 'no prior'}
      </span>
    );
  }
  const up = pct > 0;
  const flat = pct === 0;
  const color = flat
    ? 'text-muted-foreground'
    : up
    ? 'text-emerald-600'
    : 'text-destructive';
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${color}`}>
      <Icon className="h-2.5 w-2.5" />
      {up && '+'}
      {pct}%
    </span>
  );
}

export default function IncomeSourcesCard() {
  const navigate = useNavigate();
  const { data, isLoading } = useIncomeSources();
  const [period, setPeriod] = useState<Period>('month');
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [activeAdd, setActiveAdd] = useState<string | null>(null);
  const [detailFor, setDetailFor] = useState<IncomeSource | null>(null);
  const [hideAmounts, setHideAmounts] = useState<boolean>(getInitialHide);

  const toggleHide = () => {
    setHideAmounts(v => {
      const nv = !v;
      try {
        localStorage.setItem(HIDE_KEY, nv ? '1' : '0');
      } catch {}
      return nv;
    });
  };

  const fmt = (n: number) => (hideAmounts ? '••••' : n.toLocaleString());

  const bucket = data?.[period];
  const sources = bucket?.sources ?? [];
  const visibleSources = filterCat ? sources.filter(s => s.category === filterCat) : sources;
  const topSource = sources[0];

  const monthLabel = format(new Date(), 'MMM');

  const quickAddCats = useMemo(() => {
    // Surface categories that have entries first, then the rest.
    const seen = new Set(sources.map(s => s.category));
    const used = INCOME_CATEGORIES.filter(c => seen.has(c.value));
    const unused = INCOME_CATEGORIES.filter(c => !seen.has(c.value));
    return [...used, ...unused];
  }, [sources]);

  if (isLoading || !data || !bucket) return null;

  // Empty state — no income at all in 90 days.
  if (!data.hasAnyIncome) {
    return (
      <Card className="mb-4 border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Income Sources
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Track where your money comes from. Pick a starting source:
          </p>
          <div className="space-y-2 mb-3">
            {[
              { v: 'salary', hint: 'Most common — monthly job income' },
              { v: 'freelance', hint: 'Gig work, side projects' },
              { v: 'gift', hint: 'Hadiah, cash gifts, refunds' },
            ].map(s => {
              const cat = getIncomeCategory(s.v);
              const Icon = cat.icon;
              return (
                <button
                  key={s.v}
                  onClick={() => setActiveAdd(s.v)}
                  className="w-full flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors px-3 py-2.5 text-left"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}1f` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{cat.label}</p>
                    <p className="text-[10px] text-muted-foreground">{s.hint}</p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
          {activeAdd && (
            <InlineIncomeQuickAdd
              category={activeAdd}
              onClose={() => setActiveAdd(null)}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  const monthForecast = data.forecastMonth;
  const trendingTotal = bucket.trendPct;

  // Highlight strip values vary by period.
  const highlightThird =
    period === 'month'
      ? {
          label: 'Forecast',
          icon: Sparkles,
          value: `~${fmt(monthForecast)}`,
          sub: `end of ${monthLabel}`,
        }
      : {
          label: 'Best day',
          icon: Trophy,
          value: bucket.bestDay ? fmt(bucket.bestDay.amount) : '—',
          sub: bucket.bestDay ? format(parseISO(bucket.bestDay.date), 'd MMM') : '',
        };

  return (
    <>
      <Card className="mb-4 border-border shadow-sm">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Income Sources
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleHide}
                aria-label={hideAmounts ? 'Show amounts' : 'Hide amounts'}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {hideAmounts ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <div className="flex bg-muted rounded-full p-0.5 text-[10px] font-medium">
                {(['today', 'week', 'month'] as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setFilterCat(null);
                    }}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      period === p
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {PERIOD_SHORT[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sparkline + Total + MoM */}
          <div className="flex items-end justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold text-primary tabular-nums">
                  {fmt(bucket.total)}
                </span>
                <span className="text-[11px] text-muted-foreground">{PERIOD_LABEL[period]}</span>
                <TrendBadge pct={trendingTotal} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {bucket.count > 0
                  ? `${bucket.count} ${bucket.count === 1 ? 'entry' : 'entries'} · ${bucket.sources.length} ${bucket.sources.length === 1 ? 'source' : 'sources'}`
                  : 'No entries yet for this period'}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <Sparkline data={data.sparkline7d} color={PRIMARY_HSL} width={108} height={28} />
              <span className="text-[9px] text-muted-foreground mt-0.5">last 7d</span>
            </div>
          </div>

          {/* Smart highlights */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {/* Top source — tappable filter */}
            {(() => {
              const isActive = filterCat && topSource && filterCat === topSource.category;
              const cat = topSource ? getIncomeCategory(topSource.category) : null;
              const Icon = cat?.icon;
              return (
                <button
                  type="button"
                  disabled={!topSource}
                  onClick={() =>
                    topSource && setFilterCat(isActive ? null : topSource.category)
                  }
                  className={`rounded-lg px-2 py-2 text-left transition-colors disabled:opacity-50 ${
                    isActive
                      ? 'bg-primary/10 ring-1 ring-primary/30'
                      : 'bg-muted/40 hover:bg-muted/70'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Trophy className="h-2.5 w-2.5" /> Top
                  </div>
                  {topSource && cat ? (
                    <div className="flex items-center gap-1">
                      {Icon && <Icon className="h-3 w-3" style={{ color: cat.color }} />}
                      <span className="text-xs font-semibold truncate">{cat.label}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold">—</span>
                  )}
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    {topSource ? `${topSource.pct}%` : ''}
                  </p>
                </button>
              );
            })()}

            <div className="rounded-lg bg-muted/40 px-2 py-2">
              <div className="flex items-center gap-1 mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                <CalendarRange className="h-2.5 w-2.5" /> Daily avg
              </div>
              <p className="text-xs font-semibold tabular-nums">{fmt(bucket.dailyAvg)}</p>
              <p className="text-[10px] text-muted-foreground">
                {bucket.activeDays} active {bucket.activeDays === 1 ? 'day' : 'days'}
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 px-2 py-2">
              <div className="flex items-center gap-1 mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                <highlightThird.icon className="h-2.5 w-2.5" /> {highlightThird.label}
              </div>
              <p className="text-xs font-semibold tabular-nums">{highlightThird.value}</p>
              <p className="text-[10px] text-muted-foreground truncate">{highlightThird.sub}</p>
            </div>
          </div>

          {/* Filter pill */}
          {filterCat && (
            <div className="mb-2">
              <button
                onClick={() => setFilterCat(null)}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 hover:bg-muted/80"
              >
                Filtered: {getIncomeCategory(filterCat).label}
                <XIcon className="h-2.5 w-2.5" />
              </button>
            </div>
          )}

          {/* Sources */}
          {visibleSources.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-center mb-3">
              <p className="text-xs text-muted-foreground">
                No income recorded {PERIOD_LABEL[period]}
              </p>
            </div>
          ) : (
            <div className="space-y-2 mb-3">
              {visibleSources.map(s => {
                const cat = getIncomeCategory(s.category);
                const Icon = cat.icon;
                return (
                  <button
                    key={s.category}
                    onClick={() => setDetailFor(s)}
                    className="w-full flex items-center gap-2.5 text-left rounded-lg p-1 -m-1 hover:bg-muted/40 transition-colors"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cat.color}1f` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-medium truncate">{cat.label}</span>
                        <span className="text-xs font-semibold tabular-nums whitespace-nowrap inline-flex items-center gap-1.5">
                          {fmt(s.amount)}
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {s.pct}%
                          </span>
                          <TrendBadge pct={s.trendPct} compact />
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          Last {formatLastEntry(s.lastEntryDate)} · {s.count} {s.count === 1 ? 'entry' : 'entries'}
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-muted overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(2, s.pct)}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Inline quick-add or chip rail */}
          {activeAdd ? (
            <InlineIncomeQuickAdd category={activeAdd} onClose={() => setActiveAdd(null)} />
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick add
                </p>
                <button
                  onClick={() =>
                    navigate('/wealth/budget', { state: { openAdd: true, type: 'income' } })
                  }
                  className="text-[10px] text-primary font-medium hover:underline"
                >
                  Advanced →
                </button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {quickAddCats.map(c => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setActiveAdd(c.value)}
                      className="flex items-center gap-1.5 rounded-full bg-muted hover:bg-muted/70 active:bg-muted/50 px-2.5 py-1.5 flex-shrink-0 transition-colors"
                      style={{ borderLeft: `3px solid ${c.color}` }}
                    >
                      <Icon className="h-3 w-3" style={{ color: c.color }} />
                      <span className="text-[11px] font-medium whitespace-nowrap">
                        + {c.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail sheet */}
      <IncomeSourceDetailSheet
        open={!!detailFor}
        onOpenChange={open => !open && setDetailFor(null)}
        source={detailFor}
        history={detailFor ? data.last6MonthsBySource[detailFor.category] ?? [] : []}
        recent={detailFor ? data.recentByCategory[detailFor.category] ?? [] : []}
        onQuickAdd={cat => setActiveAdd(cat)}
        formatAmount={fmt}
      />
    </>
  );
}

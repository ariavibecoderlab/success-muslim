import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { api } from '@/lib/api-client';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subDays,
  subMonths,
  addDays,
  parseISO,
  differenceInCalendarDays,
  getDate,
  getDaysInMonth,
} from 'date-fns';

export interface IncomeTransaction {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category?: string | null;
  description?: string | null;
  created_at?: string;
}

export interface IncomeSource {
  category: string;
  amount: number;
  count: number;
  pct: number;
  /** Trend % vs same-length prior period. null if no prior baseline. */
  trendPct: number | null;
  /** ISO date of last entry for this category (any window). */
  lastEntryDate: string | null;
}

export interface IncomeBucket {
  total: number;
  count: number;
  /** Distinct active days (days with any income) in the period. */
  activeDays: number;
  /** Highest single-day income within the period. */
  bestDay: { date: string; amount: number } | null;
  /** Average per active day. 0 when no activity. */
  dailyAvg: number;
  sources: IncomeSource[];
  /** Total of the same-length prior comparison window. null if no data. */
  prevTotal: number | null;
  /** % change vs prevTotal. null when prevTotal is null/0. */
  trendPct: number | null;
}

export interface IncomeSourcesData {
  today: IncomeBucket;
  week: IncomeBucket;
  month: IncomeBucket;
  /** Last 7 daily totals, ending today (oldest first). */
  sparkline7d: number[];
  /** Linear projection of month-end total based on current pace. */
  forecastMonth: number;
  /** Per-category last 6 months totals (oldest first). */
  last6MonthsBySource: Record<string, { month: string; total: number }[]>;
  /** Recent income transactions (last 90d) keyed by category, newest first. */
  recentByCategory: Record<string, IncomeTransaction[]>;
  hasAnyIncome: boolean;
}

function emptyBucket(): IncomeBucket {
  return {
    total: 0,
    count: 0,
    activeDays: 0,
    bestDay: null,
    dailyAvg: 0,
    sources: [],
    prevTotal: null,
    trendPct: null,
  };
}

const emptyData: IncomeSourcesData = {
  today: emptyBucket(),
  week: emptyBucket(),
  month: emptyBucket(),
  sparkline7d: [0, 0, 0, 0, 0, 0, 0],
  forecastMonth: 0,
  last6MonthsBySource: {},
  recentByCategory: {},
  hasAnyIncome: false,
};

type Agg = Map<string, { amount: number; count: number }>;

function aggToSources(
  agg: Agg,
  total: number,
  prevAgg: Agg,
  lastEntryByCat: Record<string, string>,
): IncomeSource[] {
  return Array.from(agg.entries())
    .map(([category, v]) => {
      const prev = prevAgg.get(category)?.amount ?? 0;
      let trendPct: number | null = null;
      if (prev > 0) trendPct = Math.round(((v.amount - prev) / prev) * 100);
      else if (v.amount > 0) trendPct = 100; // new source vs nothing
      return {
        category,
        amount: v.amount,
        count: v.count,
        pct: total > 0 ? Math.round((v.amount / total) * 100) : 0,
        trendPct,
        lastEntryDate: lastEntryByCat[category] ?? null,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function useIncomeSources() {
  const { user } = useAuth();

  return useQuery<IncomeSourcesData>({
    queryKey: ['income-sources', user?.id],
    enabled: !!user,
    staleTime: 60_000,
    initialData: emptyData,
    queryFn: async () => {
      const today = new Date();
      const todayKey = format(today, 'yyyy-MM-dd');

      // Pull last ~120 days so we can compute Month + previous-month + 6mo per source.
      const windowStart = format(subMonths(startOfMonth(today), 5), 'yyyy-MM-dd');
      const windowEnd = format(endOfMonth(today), 'yyyy-MM-dd');

      const txs = await api<IncomeTransaction[]>('api-wealth', {
        params: { resource: 'transactions', start: windowStart, end: windowEnd },
      });
      const incomes = (Array.isArray(txs) ? txs : []).filter(t => t.type === 'income');

      // Boundary keys.
      const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');
      const prevMonthStart = format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
      const prevMonthEnd = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const prevWeekStart = format(subDays(parseISO(weekStart), 7), 'yyyy-MM-dd');
      const prevWeekEnd = format(subDays(parseISO(weekEnd), 7), 'yyyy-MM-dd');
      const yesterdayKey = format(subDays(today, 1), 'yyyy-MM-dd');

      const monthAgg: Agg = new Map();
      const weekAgg: Agg = new Map();
      const todayAgg: Agg = new Map();
      const prevMonthAgg: Agg = new Map();
      const prevWeekAgg: Agg = new Map();
      const yesterdayAgg: Agg = new Map();

      let monthTotal = 0,
        weekTotal = 0,
        todayTotal = 0,
        prevMonthTotal = 0,
        prevWeekTotal = 0,
        yesterdayTotal = 0;
      let monthCount = 0,
        weekCount = 0,
        todayCount = 0;

      const monthDayTotals: Record<string, number> = {};
      const weekDayTotals: Record<string, number> = {};
      const lastEntryByCat: Record<string, string> = {};
      const recentByCat: Record<string, IncomeTransaction[]> = {};

      // sparkline7d — last 7 days ending today.
      const sparkKeys: string[] = [];
      for (let i = 6; i >= 0; i--) sparkKeys.push(format(subDays(today, i), 'yyyy-MM-dd'));
      const sparkMap: Record<string, number> = Object.fromEntries(sparkKeys.map(k => [k, 0]));

      // last6MonthsBySource — last 6 month buckets, key "yyyy-MM"
      const sixMoKeys: string[] = [];
      for (let i = 5; i >= 0; i--) sixMoKeys.push(format(subMonths(today, i), 'yyyy-MM'));
      const sixMoBySource: Record<string, Record<string, number>> = {};

      const bump = (m: Agg, key: string, amt: number) => {
        const cur = m.get(key) ?? { amount: 0, count: 0 };
        cur.amount += amt;
        cur.count += 1;
        m.set(key, cur);
      };

      for (const t of incomes) {
        const amt = Number(t.amount || 0);
        const cat = (t.category || 'other').toString();
        const d = t.date;

        // last-entry tracking
        if (!lastEntryByCat[cat] || d > lastEntryByCat[cat]) lastEntryByCat[cat] = d;

        // recents (newest first; cap at 5 per category for the detail sheet)
        if (!recentByCat[cat]) recentByCat[cat] = [];
        recentByCat[cat].push(t);

        // Month
        if (d >= monthStart && d <= monthEnd) {
          monthTotal += amt;
          monthCount += 1;
          bump(monthAgg, cat, amt);
          monthDayTotals[d] = (monthDayTotals[d] || 0) + amt;
        }
        // Prev month
        if (d >= prevMonthStart && d <= prevMonthEnd) {
          prevMonthTotal += amt;
          bump(prevMonthAgg, cat, amt);
        }
        // Week
        if (d >= weekStart && d <= weekEnd) {
          weekTotal += amt;
          weekCount += 1;
          bump(weekAgg, cat, amt);
          weekDayTotals[d] = (weekDayTotals[d] || 0) + amt;
        }
        // Prev week
        if (d >= prevWeekStart && d <= prevWeekEnd) {
          prevWeekTotal += amt;
          bump(prevWeekAgg, cat, amt);
        }
        // Today / yesterday
        if (d === todayKey) {
          todayTotal += amt;
          todayCount += 1;
          bump(todayAgg, cat, amt);
        }
        if (d === yesterdayKey) {
          yesterdayTotal += amt;
          bump(yesterdayAgg, cat, amt);
        }
        // Sparkline (last 7d)
        if (d in sparkMap) sparkMap[d] += amt;

        // Last 6 months bucket
        const monthKey = d.slice(0, 7);
        if (sixMoKeys.includes(monthKey)) {
          if (!sixMoBySource[cat]) sixMoBySource[cat] = {};
          sixMoBySource[cat][monthKey] = (sixMoBySource[cat][monthKey] || 0) + amt;
        }
      }

      // Sort each category's recents newest-first and cap to 5.
      for (const k of Object.keys(recentByCat)) {
        recentByCat[k] = recentByCat[k]
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
          .slice(0, 5);
      }

      const sparkline7d = sparkKeys.map(k => sparkMap[k]);

      const last6MonthsBySource: Record<string, { month: string; total: number }[]> = {};
      for (const cat of Object.keys(sixMoBySource)) {
        last6MonthsBySource[cat] = sixMoKeys.map(m => ({
          month: m,
          total: sixMoBySource[cat][m] || 0,
        }));
      }

      // Bucket helpers (active days, daily avg, best day, trend).
      const bestDay = (dayTotals: Record<string, number>) => {
        const entries = Object.entries(dayTotals);
        if (!entries.length) return null;
        entries.sort((a, b) => b[1] - a[1]);
        return { date: entries[0][0], amount: entries[0][1] };
      };

      const trend = (curr: number, prev: number): number | null => {
        if (prev > 0) return Math.round(((curr - prev) / prev) * 100);
        if (curr > 0) return 100;
        return null;
      };

      const monthBucket: IncomeBucket = {
        total: monthTotal,
        count: monthCount,
        activeDays: Object.keys(monthDayTotals).length,
        bestDay: bestDay(monthDayTotals),
        dailyAvg: Object.keys(monthDayTotals).length
          ? Math.round(monthTotal / Object.keys(monthDayTotals).length)
          : 0,
        sources: aggToSources(monthAgg, monthTotal, prevMonthAgg, lastEntryByCat),
        prevTotal: prevMonthTotal || null,
        trendPct: trend(monthTotal, prevMonthTotal),
      };

      const weekBucket: IncomeBucket = {
        total: weekTotal,
        count: weekCount,
        activeDays: Object.keys(weekDayTotals).length,
        bestDay: bestDay(weekDayTotals),
        dailyAvg: Object.keys(weekDayTotals).length
          ? Math.round(weekTotal / Object.keys(weekDayTotals).length)
          : 0,
        sources: aggToSources(weekAgg, weekTotal, prevWeekAgg, lastEntryByCat),
        prevTotal: prevWeekTotal || null,
        trendPct: trend(weekTotal, prevWeekTotal),
      };

      const todayBucket: IncomeBucket = {
        total: todayTotal,
        count: todayCount,
        activeDays: todayCount > 0 ? 1 : 0,
        bestDay: todayCount > 0 ? { date: todayKey, amount: todayTotal } : null,
        dailyAvg: todayTotal,
        sources: aggToSources(todayAgg, todayTotal, yesterdayAgg, lastEntryByCat),
        prevTotal: yesterdayTotal || null,
        trendPct: trend(todayTotal, yesterdayTotal),
      };

      // Forecast = pace × days-in-month.
      const dayOfMonth = getDate(today);
      const daysInMonth = getDaysInMonth(today);
      const forecastMonth =
        dayOfMonth > 0 ? Math.round((monthTotal / dayOfMonth) * daysInMonth) : monthTotal;

      return {
        today: todayBucket,
        week: weekBucket,
        month: monthBucket,
        sparkline7d,
        forecastMonth,
        last6MonthsBySource,
        recentByCategory: recentByCat,
        hasAnyIncome: incomes.length > 0,
      };
    },
  });
}

/** "3d ago" / "today" / "2w ago" / absolute date — compact. */
export function formatLastEntry(iso: string | null): string {
  if (!iso) return '—';
  const d = parseISO(iso);
  const days = differenceInCalendarDays(new Date(), d);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return format(d, 'd MMM');
}

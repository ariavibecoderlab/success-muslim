import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { api } from '@/lib/api-client';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
} from 'date-fns';

export interface IncomeTransaction {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category?: string | null;
}

export interface IncomeSource {
  category: string;
  amount: number;
  count: number;
  pct: number;
}

export interface IncomeBucket {
  total: number;
  count: number;
  sources: IncomeSource[];
}

export interface IncomeSourcesData {
  today: IncomeBucket;
  week: IncomeBucket;
  month: IncomeBucket;
  hasAnyIncome: boolean;
}

function emptyBucket(): IncomeBucket {
  return { total: 0, count: 0, sources: [] };
}

const emptyData: IncomeSourcesData = {
  today: emptyBucket(),
  week: emptyBucket(),
  month: emptyBucket(),
  hasAnyIncome: false,
};

export function useIncomeSources() {
  const { user } = useAuth();

  return useQuery<IncomeSourcesData>({
    queryKey: ['income-sources', user?.id],
    enabled: !!user,
    staleTime: 60_000,
    initialData: emptyData,
    queryFn: async () => {
      const today = new Date();
      const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const todayKey = format(today, 'yyyy-MM-dd');

      const txs = await api<IncomeTransaction[]>('api-wealth', {
        params: { resource: 'transactions', start: monthStart, end: monthEnd },
      });
      const incomes = (Array.isArray(txs) ? txs : []).filter(t => t.type === 'income');

      type Agg = Map<string, { amount: number; count: number }>;
      const monthAgg: Agg = new Map();
      const weekAgg: Agg = new Map();
      const todayAgg: Agg = new Map();
      let monthTotal = 0, weekTotal = 0, todayTotal = 0;
      let monthCount = 0, weekCount = 0, todayCount = 0;

      const bump = (m: Agg, key: string, amt: number) => {
        const cur = m.get(key) ?? { amount: 0, count: 0 };
        cur.amount += amt;
        cur.count += 1;
        m.set(key, cur);
      };

      for (const t of incomes) {
        const amt = Number(t.amount || 0);
        const cat = (t.category || 'other').toString();
        monthTotal += amt; monthCount += 1;
        bump(monthAgg, cat, amt);
        if (t.date >= weekStart && t.date <= weekEnd) {
          weekTotal += amt; weekCount += 1;
          bump(weekAgg, cat, amt);
        }
        if (t.date === todayKey) {
          todayTotal += amt; todayCount += 1;
          bump(todayAgg, cat, amt);
        }
      }

      const toBucket = (agg: Agg, total: number, count: number): IncomeBucket => {
        const sources: IncomeSource[] = Array.from(agg.entries())
          .map(([category, v]) => ({
            category,
            amount: v.amount,
            count: v.count,
            pct: total > 0 ? Math.round((v.amount / total) * 100) : 0,
          }))
          .sort((a, b) => b.amount - a.amount);
        return { total, count, sources };
      };

      return {
        today: toBucket(todayAgg, todayTotal, todayCount),
        week: toBucket(weekAgg, weekTotal, weekCount),
        month: toBucket(monthAgg, monthTotal, monthCount),
        hasAnyIncome: incomes.length > 0,
      };
    },
  });
}

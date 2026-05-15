import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { api } from '@/lib/api-client';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  parseISO,
  isAfter,
} from 'date-fns';

export interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category?: string | null;
  description?: string | null;
  created_at?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number;
}

export interface BudgetPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  income_target: number;
  expense_limit: number;
}

export interface WealthSummary {
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  weekExpense: number;
  todayExpense: number;
  totalSaved: number;
  totalTarget: number;
  goalsCount: number;
  activeBudget: BudgetPeriod | null;
  lastUpdatedAt: string | null;
  hasData: boolean;
}

const emptySummary: WealthSummary = {
  monthIncome: 0,
  monthExpense: 0,
  monthNet: 0,
  weekExpense: 0,
  todayExpense: 0,
  totalSaved: 0,
  totalTarget: 0,
  goalsCount: 0,
  activeBudget: null,
  lastUpdatedAt: null,
  hasData: false,
};

export function useWealthSummary() {
  const { user } = useAuth();

  return useQuery<WealthSummary>({
    queryKey: ['wealth-summary', user?.id],
    enabled: !!user,
    staleTime: 60_000,
    initialData: emptySummary,
    queryFn: async () => {
      const today = new Date();
      const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');
      const todayKey = format(today, 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');

      const [txs, goals, periods] = await Promise.all([
        api<Transaction[]>('api-wealth', {
          params: { resource: 'transactions', start: monthStart, end: monthEnd },
        }),
        api<SavingsGoal[]>('api-wealth', { params: { resource: 'savings-goals' } }),
        api<BudgetPeriod[]>('api-wealth', { params: { resource: 'budget-periods' } }),
      ]);

      const txList = Array.isArray(txs) ? txs : [];
      const goalList = Array.isArray(goals) ? goals : [];
      const periodList = Array.isArray(periods) ? periods : [];

      let monthIncome = 0;
      let monthExpense = 0;
      let weekExpense = 0;
      let todayExpense = 0;
      let lastUpdatedAt: string | null = null;

      for (const t of txList) {
        const amt = Number(t.amount || 0);
        if (t.type === 'income') {
          monthIncome += amt;
        } else if (t.type === 'expense') {
          monthExpense += amt;
          if (t.date >= weekStart && t.date <= weekEnd) weekExpense += amt;
          if (t.date === todayKey) todayExpense += amt;
        }
        const stamp = t.created_at || t.date;
        if (stamp && (!lastUpdatedAt || isAfter(parseISO(stamp), parseISO(lastUpdatedAt)))) {
          lastUpdatedAt = stamp;
        }
      }

      const totalSaved = goalList.reduce((s, g) => s + Number(g.current_amount || 0), 0);
      const totalTarget = goalList.reduce((s, g) => s + Number(g.target_amount || 0), 0);

      const activeBudget =
        periodList.find(p => p.start_date <= todayKey && p.end_date >= todayKey) ?? null;

      const hasData = txList.length > 0 || goalList.length > 0;

      return {
        monthIncome,
        monthExpense,
        monthNet: monthIncome - monthExpense,
        weekExpense,
        todayExpense,
        totalSaved,
        totalTarget,
        goalsCount: goalList.length,
        activeBudget,
        lastUpdatedAt,
        hasData,
      };
    },
  });
}

/** Compact relative time: "just now", "5m ago", "2h ago", "3d ago", or absolute date. */
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'No activity yet';
  const then = parseISO(iso).getTime();
  const diffMs = Date.now() - then;
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return format(parseISO(iso), 'd MMM');
}

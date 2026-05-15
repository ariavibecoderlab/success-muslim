import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  ChevronRight,
  Plus,
  Receipt,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWealthSummary, formatRelativeTime } from '@/hooks/useWealthSummary';
import { format } from 'date-fns';

function formatAmount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 10_000) return (n / 1_000).toFixed(0) + 'k';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return Math.round(n).toLocaleString();
}

export default function WealthSummaryStrip() {
  const { data: summary, isLoading } = useWealthSummary();

  if (isLoading || !summary) return null;

  // First-time empty state — small inviting CTA
  if (!summary.hasData) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Wealth
          </h2>
        </div>
        <Link to="/wealth/budget">
          <Card className="border border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Plus className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">Track your first transaction</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Income, expenses, and savings — all in one place.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>
    );
  }

  const monthLabel = format(new Date(), 'MMM');
  const budget = summary.activeBudget;
  const budgetLimit = budget ? Number(budget.expense_limit || 0) : 0;
  const budgetPct =
    budgetLimit > 0 ? Math.min(100, Math.round((summary.monthExpense / budgetLimit) * 100)) : 0;
  const overBudget = budgetLimit > 0 && summary.monthExpense > budgetLimit;
  const savingsPct =
    summary.totalTarget > 0
      ? Math.min(100, Math.round((summary.totalSaved / summary.totalTarget) * 100))
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Wealth
        </h2>
        <span className="text-[10px] text-muted-foreground">
          Updated {formatRelativeTime(summary.lastUpdatedAt)}
        </span>
      </div>

      <Card className="border border-border bg-card rounded-2xl overflow-hidden">
        <CardContent className="p-4 space-y-3">
          {/* 3-stat row: Income / Expense / Saved */}
          <div className="grid grid-cols-3 gap-2">
            <Link
              to="/wealth/budget"
              className="rounded-xl p-2.5 bg-muted/40 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3 text-emerald-700" />
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  {monthLabel} In
                </span>
              </div>
              <p className="text-sm font-bold text-foreground tabular-nums">
                {formatAmount(summary.monthIncome)}
              </p>
            </Link>

            <Link
              to="/wealth/budget"
              className="rounded-xl p-2.5 bg-muted/40 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <TrendingDown className="h-3 w-3 text-rose-600" />
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  {monthLabel} Out
                </span>
              </div>
              <p
                className={`text-sm font-bold tabular-nums ${
                  overBudget ? 'text-rose-600' : 'text-foreground'
                }`}
              >
                {formatAmount(summary.monthExpense)}
              </p>
            </Link>

            <Link
              to="/wealth/savings"
              className="rounded-xl p-2.5 bg-muted/40 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <PiggyBank className="h-3 w-3 text-emerald-700" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Saved</span>
              </div>
              <p className="text-sm font-bold text-foreground tabular-nums">
                {formatAmount(summary.totalSaved)}
              </p>
            </Link>
          </div>

          {/* Budget progress (if active period exists) */}
          {budgetLimit > 0 && (
            <Link to="/wealth/budget" className="block group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Wallet className="h-3 w-3" />
                  <span className="font-medium">Budget</span>
                  <span className="tabular-nums">
                    {formatAmount(summary.monthExpense)} / {formatAmount(budgetLimit)}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-semibold tabular-nums ${
                    overBudget ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {budgetPct}%
                </span>
              </div>
              <Progress
                value={budgetPct}
                className={`h-1.5 ${overBudget ? '[&>div]:bg-rose-500' : '[&>div]:bg-emerald-600'}`}
              />
            </Link>
          )}

          {/* Today + Week snapshot */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/60">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>
                Today{' '}
                <span className="font-semibold text-foreground tabular-nums">
                  {formatAmount(summary.todayExpense)}
                </span>
              </span>
              <span className="text-border">·</span>
              <span>
                Week{' '}
                <span className="font-semibold text-foreground tabular-nums">
                  {formatAmount(summary.weekExpense)}
                </span>
              </span>
            </div>
            <Link
              to="/wealth/budget"
              className="flex items-center gap-0.5 text-emerald-700 font-semibold hover:underline"
            >
              <Plus className="h-3 w-3" />
              Add
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer links to dive deeper */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Link
          to="/wealth/budget"
          className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Receipt className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span className="text-xs font-medium truncate">Budget</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </Link>
        <Link
          to="/wealth/savings"
          className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <PiggyBank className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span className="text-xs font-medium truncate">
              Savings{summary.goalsCount > 0 ? ` (${savingsPct}%)` : ''}
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </Link>
      </div>
    </motion.div>
  );
}

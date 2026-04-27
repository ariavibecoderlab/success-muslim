import { useState, useEffect } from 'react';
import { PiggyBank, Receipt, Calculator, HandCoins, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const features = [
  { icon: Receipt, title: 'Budget Tracker', desc: 'Income, expenses & balance overview', path: '/wealth/budget', ready: true },
  { icon: PiggyBank, title: 'Savings Goals', desc: 'Hajj, Umrah, Qurban & more', path: '/wealth/savings', ready: true },
  { icon: Calculator, title: 'Zakat Calculator', desc: 'Nisab, gold, silver & savings', path: '/iman/zakat', ready: true },
  { icon: HandCoins, title: 'Sadaqah Goals', desc: 'Monthly & yearly donation targets', path: '', ready: false },
];

const Wealth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ income: 0, expense: 0, totalSaved: 0, goalsCount: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
      const [txs, goals] = await Promise.all([
        api<{ type: string; amount: number }[]>('api-wealth', { params: { resource: 'transactions', start, end } }),
        api<{ current_amount: number }[]>('api-wealth', { params: { resource: 'savings-goals' } }),
      ]);
      const txList = Array.isArray(txs) ? txs : [];
      const goalList = Array.isArray(goals) ? goals : [];
      const inc = txList.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
      const exp = txList.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
      setStats({
        income: inc,
        expense: exp,
        totalSaved: goalList.reduce((s, g) => s + Number(g.current_amount || 0), 0),
        goalsCount: goalList.length,
      });
    };
    fetchStats();
  }, [user]);

  const balance = stats.income - stats.expense;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Wealth & Finance" />

      <main className="max-w-md mx-auto px-4 py-4">
        {/* Quick stats */}
        {(stats.income > 0 || stats.goalsCount > 0) && (
          <div className="flex gap-2 mb-4">
            {[
              { label: `${format(new Date(), 'MMM')} Income`, value: stats.income.toLocaleString(), icon: TrendingUp, color: 'text-primary' },
              { label: `${format(new Date(), 'MMM')} Expense`, value: stats.expense.toLocaleString(), icon: TrendingDown, color: 'text-destructive' },
              { label: 'Total Saved', value: stats.totalSaved.toLocaleString(), icon: PiggyBank, color: 'text-primary' },
            ].map(s => (
              <div key={s.label} className="flex-1 bg-card rounded-lg border border-border py-2.5 text-center">
                <s.icon className={`h-3.5 w-3.5 mx-auto mb-0.5 ${s.color}`} />
                <p className={`text-sm font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Feature list */}
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {features.map((f) => (
            <button
              key={f.title}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${f.ready ? 'hover:bg-muted/50 active:bg-muted' : 'opacity-40 cursor-default'}`}
              onClick={() => f.ready && navigate(f.path)}
              disabled={!f.ready}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${f.ready ? 'bg-primary/10' : 'bg-muted'}`}>
                <f.icon className={`h-4 w-4 ${f.ready ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-[11px] text-muted-foreground">{f.desc}</p>
              </div>
              {f.ready ? <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <span className="text-[10px] text-muted-foreground flex-shrink-0">Soon</span>}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Wealth;

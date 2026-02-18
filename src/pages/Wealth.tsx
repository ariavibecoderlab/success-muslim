import { useState, useEffect } from 'react';
import { Wallet, PiggyBank, Receipt, Calculator, HandCoins, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import AppHeader from '@/components/AppHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const features = [
  { icon: Receipt, title: 'Budget Tracker', desc: 'Income, expenses & balance overview', path: '/wealth/budget', ready: true },
  { icon: PiggyBank, title: 'Savings Goals', desc: 'Hajj, Umrah, Qurban & more', path: '/wealth/savings', ready: true },
  { icon: Calculator, title: 'Zakat Calculator', desc: 'Nisab, gold, silver & savings', path: '/deen/zakat', ready: true },
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
      const [txRes, goalsRes] = await Promise.all([
        supabase.from('transactions').select('type, amount').eq('user_id', user.id).gte('date', start).lte('date', end),
        supabase.from('savings_goals').select('current_amount').eq('user_id', user.id),
      ]);
      const txs = (txRes.data || []) as { type: string; amount: number }[];
      const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      const goals = (goalsRes.data || []) as { current_amount: number }[];
      setStats({
        income: inc,
        expense: exp,
        totalSaved: goals.reduce((s, g) => s + Number(g.current_amount), 0),
        goalsCount: goals.length,
      });
    };
    fetchStats();
  }, [user]);

  const balance = stats.income - stats.expense;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Wealth & Finance" icon={Wallet} />

      <main className="max-w-4xl mx-auto px-5 py-6">
        {/* Quick stats */}
        {(stats.income > 0 || stats.goalsCount > 0) && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">{format(new Date(), 'MMM')} Income</p>
                <p className="text-sm font-bold text-primary">{stats.income.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-3 text-center">
                <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">{format(new Date(), 'MMM')} Expenses</p>
                <p className="text-sm font-bold text-destructive">{stats.expense.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-3 text-center">
                <PiggyBank className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Total Saved</p>
                <p className="text-sm font-bold text-primary">{stats.totalSaved.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature cards */}
        <div className="space-y-2">
          {features.map((f) => (
            <Card
              key={f.title}
              className={`transition-all ${f.ready ? 'cursor-pointer hover:shadow-md hover:border-primary/20 active:scale-[0.99]' : 'border-dashed opacity-50'}`}
              onClick={() => f.ready && navigate(f.path)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.ready ? 'bg-primary/10' : 'bg-muted'}`}>
                  <f.icon className={`h-5 w-5 ${f.ready ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
                {f.ready && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                {!f.ready && <span className="text-[10px] text-muted-foreground flex-shrink-0">Soon</span>}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Wealth;

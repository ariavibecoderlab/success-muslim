import { Wallet, PiggyBank, TrendingDown, Calculator, HandCoins, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  { icon: Wallet, title: 'Budget Tracker', desc: 'Income, expenses & balance overview' },
  { icon: Calculator, title: 'Zakat Calculator', desc: 'Nisab, gold, silver & savings' },
  { icon: HandCoins, title: 'Sadaqah Goals', desc: 'Monthly & yearly donation targets' },
  { icon: TrendingDown, title: 'Debt-Free Planner', desc: 'Track debts & payoff projection' },
  { icon: PiggyBank, title: 'Savings Funds', desc: 'Hajj, Umrah & emergency funds' },
  { icon: BarChart3, title: 'Wealth Growth', desc: 'Shariah-compliant investment tracking' },
];

const Wealth = () => (
  <div className="min-h-screen bg-background">
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
        <span className="text-lg font-bold text-primary flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wealth & Finance
        </span>
      </div>
    </nav>

    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Wallet className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Coming Soon</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          Manage your wealth with barakah. Halal earnings, smart spending, generous giving.
        </p>
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Planned Features</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {features.map(f => (
          <Card key={f.title} className="border-dashed opacity-70">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <f.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

export default Wealth;

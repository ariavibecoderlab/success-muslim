import { Wallet, PiggyBank, Receipt, Calculator, HandCoins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import AppHeader from '@/components/AppHeader';

const features = [
  { icon: Receipt, title: 'Budget Tracker', desc: 'Income, expenses & balance overview', path: '/wealth/budget', ready: true },
  { icon: PiggyBank, title: 'Savings Goals', desc: 'Hajj, Umrah, Qurban & more', path: '/wealth/savings', ready: true },
  { icon: Calculator, title: 'Zakat Calculator', desc: 'Nisab, gold, silver & savings', path: '/deen/zakat', ready: true },
  { icon: HandCoins, title: 'Sadaqah Goals', desc: 'Monthly & yearly donation targets', path: '', ready: false },
];

const Wealth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Wealth & Finance" icon={Wallet} />

      <main className="max-w-4xl mx-auto px-5 py-6">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-1">Wealth & Finance</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            Manage your wealth with barakah. Halal earnings, smart spending, generous giving.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className={`transition-all ${f.ready ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : 'border-dashed opacity-60'}`}
              onClick={() => f.ready && navigate(f.path)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${f.ready ? 'bg-primary/10' : 'bg-muted'}`}>
                  <f.icon className={`h-5 w-5 ${f.ready ? 'text-primary' : 'text-muted-foreground'}`} />
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
};

export default Wealth;

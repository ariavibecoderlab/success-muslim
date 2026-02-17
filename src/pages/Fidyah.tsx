import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { saveFidyahEntry, getFidyahHistory } from '@/lib/storage';
import { FidyahEntry } from '@/lib/types';
import { motion } from 'framer-motion';

const CURRENCIES = ['MYR', 'USD', 'GBP', 'EUR', 'SAR', 'IDR', 'SGD'];

const FidyahPage = () => {
  const [days, setDays] = useState<number>(1);
  const [costPerMeal, setCostPerMeal] = useState<number>(7);
  const [currency, setCurrency] = useState('MYR');
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState(getFidyahHistory());

  const calculate = () => {
    const total = days * costPerMeal;
    setResult(total);
    const entry: FidyahEntry = {
      id: Date.now().toString(),
      days,
      costPerMeal,
      currency,
      total,
      date: new Date().toISOString(),
    };
    saveFidyahEntry(entry);
    setHistory(getFidyahHistory());
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="font-semibold">Fidyah Calculator</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Calculate Fidyah</h2>
          <p className="text-sm text-muted-foreground">For those unable to fast due to chronic illness or old age.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Days Unable to Fast</label>
            <Input type="number" value={days} onChange={e => setDays(Number(e.target.value))} min={1} max={365} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Currency</label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${currency === c ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Cost Per Meal ({currency})</label>
            <Input type="number" value={costPerMeal} onChange={e => setCostPerMeal(Number(e.target.value))} min={0.01} step={0.01} />
          </div>

          {(days <= 0 || costPerMeal <= 0) && (
            <p className="text-xs text-destructive">Days and cost per meal must be greater than 0.</p>
          )}
          <Button onClick={calculate} className="w-full" size="lg" disabled={days <= 0 || costPerMeal <= 0}>
            <Calculator className="h-4 w-4 mr-2" /> Calculate
          </Button>
        </div>

        {result !== null && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Fidyah</p>
                <p className="text-3xl font-bold text-primary">{currency} {result.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-2">{days} days × {currency} {costPerMeal.toFixed(2)}/meal</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Educational */}
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">What is Fidyah?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fidyah is a compensation paid when a Muslim is unable to fast during Ramadhan due to chronic illness, 
                  old age, or other valid permanent reasons. It involves feeding one person for each day of fasting missed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">History</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex justify-between items-center py-2 border-b border-border last:border-0 text-sm">
                  <span className="text-muted-foreground">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="font-medium">{entry.currency} {entry.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FidyahPage;

import { useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { saveFidyahEntry, getFidyahHistory } from '@/lib/storage';
import { FidyahEntry } from '@/lib/types';
import { motion } from 'framer-motion';
import SubPageLayout from '@/components/SubPageLayout';
import EditableText from '@/components/cms/EditableText';

const CURRENCIES = ['MYR', 'USD', 'GBP', 'EUR', 'SAR', 'IDR', 'SGD'];

const IMAN_TRACKERS = [
  { path: '/qada-solat/track', label: 'Qada Solat' },
  { path: '/ramadhan-qada/track', label: 'Ramadhan' },
  { path: '/fidyah', label: 'Fidyah' },
];

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
      days, costPerMeal, currency, total,
      date: new Date().toISOString(),
    };
    saveFidyahEntry(entry);
    setHistory(getFidyahHistory());
  };

  return (
    <SubPageLayout title="Fidyah Calculator" backTo="/iman" siblingRoutes={IMAN_TRACKERS} currentPath="/fidyah">
      <div className="space-y-6">
        <div>
          <EditableText elementKey="fidyah.title" defaultText="Calculate Fidyah" tag="h2" className="text-xl font-bold mb-1" />
          <EditableText elementKey="fidyah.desc" defaultText="For those unable to fast due to chronic illness or old age." tag="p" className="text-sm text-muted-foreground" />
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
                <EditableText elementKey="fidyah.result.label" defaultText="Total Fidyah" tag="p" className="text-sm text-muted-foreground mb-1" />
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
                <EditableText elementKey="fidyah.info.title" defaultText="What is Fidyah?" tag="h4" className="font-medium text-sm mb-1" />
                <EditableText elementKey="fidyah.info.desc" defaultText="Fidyah is a compensation paid when a Muslim is unable to fast during Ramadhan due to chronic illness, old age, or other valid permanent reasons. It involves feeding one person for each day of fasting missed." tag="p" className="text-xs text-muted-foreground leading-relaxed" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <div>
            <EditableText elementKey="fidyah.history" defaultText="History" tag="h3" className="font-semibold mb-3" />
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
      </div>
    </SubPageLayout>
  );
};

export default FidyahPage;

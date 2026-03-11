import { useState } from 'react';
import { Calculator, Info, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { saveFidyahEntry, getFidyahHistory } from '@/lib/storage';
import { FidyahEntry } from '@/lib/types';
import { motion } from 'framer-motion';
import SubPageLayout from '@/components/SubPageLayout';
import { staggerContainer, staggerItem } from '@/components/dashboard/constants';

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
      <motion.div className="space-y-5" variants={staggerContainer} initial="hidden" animate="visible">
        {/* Hero card */}
        <motion.div variants={staggerItem}>
          <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200/30 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Calculate Fidyah</p>
                  <p className="text-[10px] text-muted-foreground">For those unable to fast due to chronic illness or old age.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calculator */}
        <motion.div variants={staggerItem}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3.5">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Days Unable to Fast</label>
                <Input type="number" value={days} onChange={e => setDays(Number(e.target.value))} min={1} max={365} className="h-9 text-sm" />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Currency</label>
                <div className="flex flex-wrap gap-1.5">
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => setCurrency(c)}
                      className={`px-2.5 py-1 rounded-md border text-[10px] font-medium transition-all ${currency === c ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Cost Per Meal ({currency})</label>
                <Input type="number" value={costPerMeal} onChange={e => setCostPerMeal(Number(e.target.value))} min={0.01} step={0.01} className="h-9 text-sm" />
              </div>

              {(days <= 0 || costPerMeal <= 0) && (
                <p className="text-[10px] text-destructive">Days and cost per meal must be greater than 0.</p>
              )}
              <Button onClick={calculate} className="w-full h-9 text-sm" disabled={days <= 0 || costPerMeal <= 0}>
                <Calculator className="h-3.5 w-3.5 mr-1.5" /> Calculate
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result */}
        {result !== null && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200/30 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Total Fidyah</p>
                <p className="text-2xl font-bold text-emerald-600">{currency} {result.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{days} days × {currency} {costPerMeal.toFixed(2)}/meal</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Educational */}
        <motion.div variants={staggerItem}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Info className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-[13px] mb-0.5">What is Fidyah?</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Fidyah is a compensation paid when a Muslim is unable to fast during Ramadhan due to chronic illness, old age, or other valid permanent reasons. It involves feeding one person for each day of fasting missed.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* History */}
        {history.length > 0 && (
          <motion.div variants={staggerItem}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">History</h3>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-1.5">
                <div className="divide-y divide-border">
                  {history.slice(0, 5).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                          <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <span className="text-[13px] text-muted-foreground">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <span className="text-[13px] font-medium">{entry.currency} {entry.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </SubPageLayout>
  );
};

export default FidyahPage;

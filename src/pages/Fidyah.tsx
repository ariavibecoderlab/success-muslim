import { useState } from 'react';
import { Calculator, Info, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { saveFidyahEntry } from '@/lib/storage';
import { useFidyahHistory } from '@/hooks/useFidyahQuery';
import { FidyahEntry } from '@/lib/types';
import { motion } from 'framer-motion';
import SubPageLayout from '@/components/SubPageLayout';
import { fadeUp } from '@/components/dashboard/constants';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const CURRENCIES = ['MYR', 'USD', 'GBP', 'EUR', 'SAR', 'IDR', 'SGD'];

const IMAN_TRACKERS = [
  { path: '/qada-solat/track', label: 'Qada Solat' },
  { path: '/ramadhan-qada/track', label: 'Ramadhan' },
  { path: '/fidyah', label: 'Fidyah' },
];

const FidyahPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: history = [] } = useFidyahHistory();
  const [days, setDays] = useState<number>(1);
  const [costPerMeal, setCostPerMeal] = useState<number>(7);
  const [currency, setCurrency] = useState('MYR');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const total = days * costPerMeal;
    setResult(total);
    const entry: FidyahEntry = {
      id: Date.now().toString(),
      days, costPerMeal, currency, total,
      date: new Date().toISOString(),
    };
    saveFidyahEntry(entry);
    queryClient.invalidateQueries({ queryKey: ['fidyah', user?.id ?? 'anon'] });
  };

  return (
    <SubPageLayout title="Fidyah Calculator" backTo="/iman" siblingRoutes={IMAN_TRACKERS} currentPath="/fidyah">
      <div className="space-y-5">
        {/* Hero card */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-600 to-teal-600 text-white relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Fidyah Calculator</p>
                  <p className="text-[11px] text-white/70 leading-relaxed">For those unable to fast due to chronic illness or old age.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calculator */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">Calculate</h3>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3.5">
              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Days Unable to Fast</label>
                <Input type="number" value={days} onChange={e => setDays(Number(e.target.value))} min={1} max={365} className="h-9 text-sm" />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Currency</label>
                <div className="flex flex-wrap gap-1.5">
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => setCurrency(c)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${currency === c ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Cost Per Meal ({currency})</label>
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
              <CardContent className="p-5 text-center">
                <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium mb-0.5">Total Fidyah</p>
                <p className="text-2xl font-bold">{currency} {result.toFixed(2)}</p>
                <p className="text-[11px] text-white/60 mt-1">{days} day{days !== 1 ? 's' : ''} × {currency} {costPerMeal.toFixed(2)}/meal</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Educational */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardContent className="p-4">
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 flex items-center justify-center flex-shrink-0">
                  <Info className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
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
          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">History</h3>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-1.5">
                <div className="divide-y divide-border/50">
                  {history.slice(0, 5).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                          <Receipt className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-[11px] text-muted-foreground">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <span className="text-[13px] font-medium">{entry.currency} {entry.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </SubPageLayout>
  );
};

export default FidyahPage;

import { useState, useEffect } from 'react';
import { Calculator, History, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { calculateZakat, CURRENCIES, type ZakatInput, type ZakatResult } from '@/lib/zakat';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import SubPageLayout from '@/components/SubPageLayout';

const IMAN_SIBLINGS = [
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/sadaqah', label: 'Sadaqah' },
  { path: '/iman/zakat', label: 'Zakat' },
];

interface ZakatRecord {
  id: string;
  input: any;
  total_wealth: number;
  net_zakatable: number;
  zakat_amount: number;
  nisab_gold: number;
  nisab_silver: number;
  meets_nisab: boolean;
  is_paid: boolean;
  paid_date: string | null;
  date: string;
}

const ZakatCalculator = () => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('MYR');
  const [cash, setCash] = useState('');
  const [goldGrams, setGoldGrams] = useState('');
  const [silverGrams, setSilverGrams] = useState('');
  const [investments, setInvestments] = useState('');
  const [otherAssets, setOtherAssets] = useState('');
  const [debts, setDebts] = useState('');
  const [result, setResult] = useState<ZakatResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ZakatRecord[]>([]);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('zakat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(20);
    if (data) setHistory(data as ZakatRecord[]);
  };

  const handleCalculate = async () => {
    const input: ZakatInput = {
      cash: parseFloat(cash) || 0,
      goldGrams: parseFloat(goldGrams) || 0,
      silverGrams: parseFloat(silverGrams) || 0,
      investments: parseFloat(investments) || 0,
      otherAssets: parseFloat(otherAssets) || 0,
      debts: parseFloat(debts) || 0,
      currency,
    };
    const res = calculateZakat(input);
    setResult(res);

    // Save to DB
    if (user) {
      await supabase.from('zakat_history').insert({
        user_id: user.id,
        input: input as any,
        total_wealth: res.totalWealth,
        net_zakatable: res.netZakatable,
        zakat_amount: res.zakatAmount,
        nisab_gold: res.nisabGold,
        nisab_silver: res.nisabSilver,
        meets_nisab: res.meetsNisab,
        date: res.date,
      });
      loadHistory();
    }
  };

  const markPaid = async (id: string) => {
    await supabase.from('zakat_history').update({
      is_paid: true,
      paid_date: new Date().toISOString().split('T')[0],
    }).eq('id', id);
    toast.success('Marked as paid');
    loadHistory();
  };

  const deleteRecord = async (id: string) => {
    await supabase.from('zakat_history').delete().eq('id', id);
    toast.success('Deleted');
    loadHistory();
  };

  const fields = [
    { label: 'Cash & Savings', value: cash, setter: setCash, placeholder: '0.00' },
    { label: 'Gold (grams)', value: goldGrams, setter: setGoldGrams, placeholder: '0' },
    { label: 'Silver (grams)', value: silverGrams, setter: setSilverGrams, placeholder: '0' },
    { label: 'Investments & Stocks', value: investments, setter: setInvestments, placeholder: '0.00' },
    { label: 'Other Assets', value: otherAssets, setter: setOtherAssets, placeholder: '0.00' },
    { label: 'Outstanding Debts', value: debts, setter: setDebts, placeholder: '0.00' },
  ];

  return (
    <SubPageLayout title="Zakat Calculator" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/zakat">
      <div className="space-y-5">
        {/* Currency Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CURRENCIES.map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                currency === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Nisab Info */}
        <Card className="border-0 rounded-xl shadow-sm bg-primary/5">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Nisab threshold:</strong> You must pay zakat if your net wealth exceeds the nisab value (equivalent to 85g gold or 595g silver). The lower threshold applies.
            </p>
          </CardContent>
        </Card>

        {/* Input Fields */}
        <Card>
          <CardContent className="p-5 space-y-4">
            {fields.map(f => (
              <div key={f.label} className="space-y-1.5">
                <Label className="text-xs">{f.label}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder={f.placeholder}
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                />
              </div>
            ))}
            <Button onClick={handleCalculate} className="w-full gap-2">
              <Calculator className="h-4 w-4" /> Calculate Zakat
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={result.meetsNisab ? 'border-primary/30 bg-primary/5' : 'border-border'}>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-sm">
                  {result.meetsNisab ? '✓ Zakat is Due' : 'Below Nisab Threshold'}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Wealth</p>
                    <p className="font-semibold">{currency} {result.totalWealth.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net Zakatable</p>
                    <p className="font-semibold">{currency} {result.netZakatable.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nisab (Gold 85g)</p>
                    <p className="font-medium">{currency} {result.nisabGold.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nisab (Silver 595g)</p>
                    <p className="font-medium">{currency} {result.nisabSilver.toLocaleString()}</p>
                  </div>
                </div>
                {result.meetsNisab && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">Zakat Amount (2.5%)</p>
                    <p className="text-2xl font-bold text-primary">{currency} {result.zakatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-xs text-muted-foreground mb-2"
            >
              <History className="h-3 w-3" />
              Past Calculations ({history.length})
              {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showHistory && (
              <div className="space-y-2">
                {history.slice(0, 10).map(h => (
                  <Card key={h.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">{h.date}</span>
                          <p className="font-medium">
                            {(h.input as any)?.currency || 'MYR'} {h.zakat_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {h.is_paid ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
                              <Check className="h-3 w-3" /> Paid {h.paid_date}
                            </span>
                          ) : h.meets_nisab ? (
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => markPaid(h.id)}>
                              Mark Paid
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Below nisab</span>
                          )}
                          <button onClick={() => deleteRecord(h.id)} className="text-muted-foreground hover:text-destructive p-1">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </SubPageLayout>
  );
};

export default ZakatCalculator;

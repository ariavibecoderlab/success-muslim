import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, History, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { calculateZakat, getZakatHistory, saveZakatResult, CURRENCIES, type ZakatInput, type ZakatResult } from '@/lib/zakat';

const ZakatCalculator = () => {
  const [currency, setCurrency] = useState('MYR');
  const [cash, setCash] = useState('');
  const [goldGrams, setGoldGrams] = useState('');
  const [silverGrams, setSilverGrams] = useState('');
  const [investments, setInvestments] = useState('');
  const [otherAssets, setOtherAssets] = useState('');
  const [debts, setDebts] = useState('');
  const [result, setResult] = useState<ZakatResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const history = getZakatHistory();

  const handleCalculate = () => {
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
    saveZakatResult(res);
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
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link to="/deen" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-lg font-bold">Zakat Calculator</span>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-5 py-6 space-y-5">
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
                    <p className="text-xs text-muted-foreground">Nisab (Gold)</p>
                    <p className="font-medium">{currency} {result.nisabGold.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nisab (Silver)</p>
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
                {history.slice(0, 5).map(h => (
                  <Card key={h.id}>
                    <CardContent className="p-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{h.date}</span>
                      <span className="font-medium">
                        {h.input.currency} {h.zakatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ZakatCalculator;

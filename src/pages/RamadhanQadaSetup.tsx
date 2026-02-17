import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { saveRamadhanSetup } from '@/lib/storage';
import { FastingReason, FastingStrategy, RamadhanQadaSetup } from '@/lib/types';
import { motion } from 'framer-motion';

const RamadhanQadaSetupPage = () => {
  const navigate = useNavigate();
  const [totalDays, setTotalDays] = useState<number>(10);
  const [reason, setReason] = useState<FastingReason>('menstruation');
  const [strategy, setStrategy] = useState<FastingStrategy>('mon-thu');

  const estimateWeeks = () => {
    if (strategy === 'mon-thu') return Math.ceil(totalDays / 2);
    if (strategy === 'white-days') return Math.ceil(totalDays / 3) * 4;
    return totalDays;
  };

  const handleSave = () => {
    const setup: RamadhanQadaSetup = {
      totalDays,
      reason,
      strategy,
      setupDate: new Date().toISOString(),
    };
    saveRamadhanSetup(setup);
    navigate('/ramadhan-qada/track');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <span className="font-semibold">Ramadhan Qada Setup</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Track Your Missed Fasts</h2>
          <p className="text-sm text-muted-foreground">Set up your Ramadhan qada plan.</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Days Owed</label>
          <Input type="number" value={totalDays} onChange={e => setTotalDays(Number(e.target.value))} min={1} max={365} />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Reason</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: 'menstruation', label: 'Menstruation' },
              { key: 'illness', label: 'Illness' },
              { key: 'travel', label: 'Travel' },
              { key: 'other', label: 'Other' },
            ] as const).map(r => (
              <button key={r.key} onClick={() => setReason(r.key)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${reason === r.key ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Strategy</label>
          <div className="space-y-2">
            {([
              { key: 'mon-thu', label: 'Monday & Thursday', desc: 'Sunnah days — 2 fasts per week' },
              { key: 'white-days', label: '3 White Days / Month', desc: '13th, 14th, 15th of each Islamic month' },
              { key: 'custom', label: 'Custom', desc: 'Fast on your own schedule' },
            ] as const).map(s => (
              <button key={s.key} onClick={() => setStrategy(s.key)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${strategy === s.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                <p className="font-medium text-sm">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Estimated completion in</p>
            <p className="text-xl font-bold text-primary">~{estimateWeeks()} weeks</p>
          </CardContent>
        </Card>

        {totalDays <= 0 && (
          <p className="text-xs text-destructive">Please enter at least 1 day.</p>
        )}
        <Button onClick={handleSave} className="w-full" size="lg" disabled={totalDays <= 0}>
          <CheckCircle className="h-4 w-4 mr-2" /> Start Tracking
        </Button>
      </main>
    </div>
  );
};

export default RamadhanQadaSetupPage;

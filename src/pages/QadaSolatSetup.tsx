import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { calculateQadaPrayers, formatYearsMonths } from '@/lib/calculations';
import { saveQadaSetup } from '@/lib/storage';
import { Gender, ConsistencyLevel, PRAYER_NAMES, PrayerType, QadaSolatSetup } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import SubPageLayout from '@/components/SubPageLayout';

const STEPS = ['Personal Info', 'Consistency', 'Results', 'Create Plan'];

const QadaSolatSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [balighAge, setBalighAge] = useState<number>(12);
  const [gender, setGender] = useState<Gender>('male');
  const [consistency, setConsistency] = useState<ConsistencyLevel>('sometimes');
  const [dailyTarget, setDailyTarget] = useState<number>(5);

  const result = calculateQadaPrayers(currentAge, balighAge, gender, consistency);
  const daysToComplete = dailyTarget > 0 ? Math.ceil(result.totalPrayers / dailyTarget) : 0;

  const handleSave = () => {
    const setup: QadaSolatSetup = {
      currentAge, balighAge, gender, consistency, dailyTarget,
      totalByPrayer: result.totalByPrayer,
      totalPrayers: result.totalPrayers,
      setupDate: new Date().toISOString(),
    };
    saveQadaSetup(setup);
    navigate('/qada-solat/track');
  };

  const canNext = () => {
    if (step === 0) return currentAge > balighAge && balighAge >= 7;
    return true;
  };

  return (
    <SubPageLayout title="Qada Solat Setup" backTo="/iman">
      <div>
        {/* Progress */}
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-8">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Personal Information</h2>
                  <p className="text-sm text-muted-foreground">We need a few details to calculate your qada prayers.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Current Age</label>
                    <Input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} min={7} max={120} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Age When You Became Baligh</label>
                    <Input type="number" value={balighAge} onChange={e => setBalighAge(Number(e.target.value))} min={7} max={20} />
                    <p className="text-xs text-muted-foreground mt-1">Typically between 9-15 years old</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Gender</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['male', 'female'] as Gender[]).map(g => (
                        <button key={g} onClick={() => setGender(g)}
                          className={`p-4 rounded-xl border text-sm font-medium transition-all ${gender === g ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}>
                          {g === 'male' ? '♂ Male' : '♀ Female'}
                        </button>
                      ))}
                    </div>
                    {gender === 'female' && (
                      <p className="text-xs text-muted-foreground mt-2">Menstruation days (~6/month) will be automatically deducted.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Prayer Consistency</h2>
                  <p className="text-sm text-muted-foreground">How consistently did you pray during those years?</p>
                </div>
                <div className="space-y-4">
                  {([
                    { key: 'rarely', label: 'Rarely Prayed', desc: '~10% of the time', pct: 10 },
                    { key: 'sometimes', label: 'Sometimes', desc: '~35% of the time', pct: 35 },
                    { key: 'often', label: 'Often', desc: '~60% of the time', pct: 60 },
                    { key: 'mostly', label: 'Mostly Consistent', desc: '~85% of the time', pct: 85 },
                  ] as const).map(opt => (
                    <button key={opt.key} onClick={() => setConsistency(opt.key)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${consistency === opt.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                        <span className={`text-sm font-semibold ${consistency === opt.key ? 'text-primary' : 'text-muted-foreground'}`}>{opt.pct}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Your Qada Breakdown</h2>
                  <p className="text-sm text-muted-foreground">Based on your inputs, here's what we've calculated.</p>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <p className="text-4xl font-bold text-primary">{result.totalPrayers.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total missed prayers</p>
                    </div>
                    <div className="space-y-3">
                      {(Object.entries(result.totalByPrayer) as [PrayerType, number][]).map(([prayer, count]) => (
                        <div key={prayer} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <span className="text-sm font-medium">{PRAYER_NAMES[prayer]}</span>
                          <span className="text-sm text-muted-foreground">{count.toLocaleString()} prayers</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground text-center">
                  This is an estimate. Adjust your consistency level if needed.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Create Your Plan</h2>
                  <p className="text-sm text-muted-foreground">Set a daily target that works for you.</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">Daily Qada Target: <span className="text-primary">{dailyTarget} prayers</span></label>
                  <Slider value={[dailyTarget]} onValueChange={v => setDailyTarget(v[0])} min={1} max={25} step={1} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1/day</span>
                    <span>25/day</span>
                  </div>
                </div>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Estimated completion in</p>
                    <p className="text-2xl font-bold text-primary">{formatYearsMonths(daysToComplete)}</p>
                    <p className="text-xs text-muted-foreground mt-1">at {dailyTarget} qada per day</p>
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground text-center italic">
                  "Consistency is beloved to Allah" — Start small, stay consistent.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-10">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="flex-1">
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" /> Start Tracking
            </Button>
          )}
        </div>
      </div>
    </SubPageLayout>
  );
};

export default QadaSolatSetupPage;

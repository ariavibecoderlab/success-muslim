import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { Slider } from '@/components/ui/slider';
import {
  GOALS, EATING_HABITS, SLEEP_OPTIONS, ACTIVITY_LEVELS, FASTING_EXPERIENCE,
  calculateBMI, bmiCategory, calculateTDEE, recommendProtocol, estimateWeightLoss30Days, getBMIPosition,
} from '@/lib/if-onboarding-data';

const TOTAL_STEPS = 11;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function IFOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { completed, saveProfile } = useHealthProfile();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Data
  const [goal, setGoal] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(170);
  const [useImperial, setUseImperial] = useState(false);
  const [weightKg, setWeightKg] = useState(70);
  const [useLbs, setUseLbs] = useState(false);
  const [goalWeightKg, setGoalWeightKg] = useState(65);
  const [eatingHabits, setEatingHabits] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [fastingExp, setFastingExp] = useState('');

  // Age scroll ref
  const ageScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (completed) navigate('/health/if-timer', { replace: true });
  }, [completed, navigate]);

  // Scroll age picker to selected age on mount
  useEffect(() => {
    if (step === 3 && ageScrollRef.current) {
      const idx = age - 14;
      const el = ageScrollRef.current.children[idx] as HTMLElement;
      if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [step]);

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCat = bmiCategory(bmi);
  const tdee = calculateTDEE(weightKg, heightCm, age, gender || 'male', activityLevel || 'sedentary');
  const protocol = recommendProtocol(fastingExp, goal, activityLevel);
  const estLoss = estimateWeightLoss30Days(weightKg, tdee, protocol);
  const tolose = Math.max(0, +(weightKg - goalWeightKg).toFixed(1));

  const handleSkip = () => navigate('/health/if-timer', { replace: true });

  const handleFinish = async () => {
    await saveProfile({
      goal, gender, age, height_cm: heightCm, weight_kg: weightKg, goal_weight_kg: goalWeightKg,
      bmi, tdee, eating_habits: eatingHabits, sleep_hours: sleepHours,
      activity_level: activityLevel, fasting_experience: fastingExp,
      recommended_protocol: protocol, completed_at: new Date().toISOString(),
    });
    navigate('/health/if-timer', { replace: true });
  };

  const cmToFtIn = (cm: number) => {
    const inches = cm / 2.54;
    return `${Math.floor(inches / 12)}' ${Math.round(inches % 12)}"`;
  };
  const kgToLbs = (kg: number) => Math.round(kg * 2.205);

  const OptionCard = ({ selected, onSelect, icon: Icon, label, desc }: any) => (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-primary/10' : 'bg-secondary'}`}>
          <Icon className={`h-5 w-5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{label}</p>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      {step < 11 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-muted/50">
          <motion.div className="h-full bg-primary rounded-r-full" animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
      )}

      {/* Top nav */}
      {step > 1 && step < 11 && (
        <div className="fixed top-3 left-4 right-4 z-50 flex items-center justify-between">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button onClick={handleSkip} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <SkipForward className="h-3.5 w-3.5" /> Skip
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-16 overflow-hidden">
        <div className="w-full max-w-md overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={slideVariants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeInOut' }}>

              {/* Step 1: Goal */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-black tracking-tight">What's your main goal?</h1>
                    <p className="text-sm text-muted-foreground mt-1.5">This helps us recommend the best fasting plan</p>
                  </div>
                  <div className="space-y-2.5">
                    {GOALS.map(g => (
                      <OptionCard key={g.id} selected={goal === g.id} onSelect={() => { setGoal(g.id); setTimeout(goNext, 200); }}
                        icon={g.icon} label={g.label} desc={g.description} />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Gender */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">What's your gender?</h1>
                    <p className="text-sm text-muted-foreground mt-1">Used for accurate BMR calculation</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['male', 'female'].map(g => (
                      <button key={g} onClick={() => { setGender(g); setTimeout(goNext, 200); }}
                        className={`rounded-2xl border-2 p-6 text-center transition-all ${
                          gender === g ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                        }`}>
                        <p className="text-lg font-bold capitalize">{g}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Age */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">How old are you?</h1>
                  </div>
                  <div className="relative h-64 overflow-hidden rounded-xl">
                    <div ref={ageScrollRef} className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide px-4"
                      onScroll={(e) => {
                        const el = e.currentTarget;
                        const center = el.scrollTop + el.clientHeight / 2;
                        const items = Array.from(el.children) as HTMLElement[];
                        let closest = 14;
                        let minDist = Infinity;
                        items.forEach((item, i) => {
                          const itemCenter = item.offsetTop + item.clientHeight / 2;
                          const dist = Math.abs(center - itemCenter);
                          if (dist < minDist) { minDist = dist; closest = i + 14; }
                        });
                        setAge(closest);
                      }}>
                      {Array.from({ length: 66 }, (_, i) => i + 14).map(a => (
                        <div key={a} className={`snap-center h-12 flex items-center justify-center text-2xl font-bold transition-all ${
                          a === age ? 'text-primary scale-110' : 'text-muted-foreground/40 scale-90'
                        }`}>{a}</div>
                      ))}
                    </div>
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-12 border-y-2 border-primary/20 pointer-events-none rounded" />
                  </div>
                  <Button onClick={goNext} className="w-full" size="lg">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 4: Height */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">What's your height?</h1>
                  </div>
                  <div className="flex justify-center gap-2 mb-2">
                    <button onClick={() => setUseImperial(false)} className={`px-4 py-1.5 rounded-full text-xs font-medium ${!useImperial ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>cm</button>
                    <button onClick={() => setUseImperial(true)} className={`px-4 py-1.5 rounded-full text-xs font-medium ${useImperial ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>ft</button>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black">{useImperial ? cmToFtIn(heightCm) : `${heightCm} cm`}</p>
                  </div>
                  <Slider value={[heightCm]} min={120} max={220} step={1} onValueChange={([v]) => setHeightCm(v)} />
                  <Button onClick={goNext} className="w-full" size="lg">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 5: Weight */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">What's your current weight?</h1>
                  </div>
                  <div className="flex justify-center gap-2 mb-2">
                    <button onClick={() => setUseLbs(false)} className={`px-4 py-1.5 rounded-full text-xs font-medium ${!useLbs ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>kg</button>
                    <button onClick={() => setUseLbs(true)} className={`px-4 py-1.5 rounded-full text-xs font-medium ${useLbs ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>lb</button>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black">{useLbs ? `${kgToLbs(weightKg)} lb` : `${weightKg} kg`}</p>
                  </div>
                  <Slider value={[weightKg]} min={30} max={200} step={0.5} onValueChange={([v]) => setWeightKg(v)} />
                  {/* Live BMI */}
                  <div className="rounded-xl border border-border bg-card p-3 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">Current BMI</p>
                    <p className="text-2xl font-bold" style={{ color: bmiCat.color }}>{bmi}</p>
                    <p className="text-xs font-medium" style={{ color: bmiCat.color }}>{bmiCat.label}</p>
                    {/* BMI spectrum bar */}
                    <div className="relative h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 mt-2">
                      <div className="absolute top-0 w-3 h-3 -translate-x-1/2 -translate-y-0.5 rounded-full bg-foreground border-2 border-background"
                        style={{ left: `${getBMIPosition(bmi)}%` }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-muted-foreground">
                      <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                    </div>
                  </div>
                  <Button onClick={goNext} className="w-full" size="lg">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 6: Goal Weight */}
              {step === 6 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">What's your goal weight?</h1>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black">{useLbs ? `${kgToLbs(goalWeightKg)} lb` : `${goalWeightKg} kg`}</p>
                  </div>
                  <Slider value={[goalWeightKg]} min={30} max={200} step={0.5} onValueChange={([v]) => setGoalWeightKg(v)} />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{tolose > 0 ? `${tolose} kg to lose` : 'Maintain weight'}</span>
                    {tolose > 0 && estLoss > 0 && (
                      <span className="text-primary font-medium">~{estLoss} kg in 30 days</span>
                    )}
                  </div>
                  <Button onClick={goNext} className="w-full" size="lg">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 7: Eating Habits */}
              {step === 7 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">Your eating habits?</h1>
                  </div>
                  <div className="space-y-2.5">
                    {EATING_HABITS.map(e => (
                      <OptionCard key={e.id} selected={eatingHabits === e.id} onSelect={() => { setEatingHabits(e.id); setTimeout(goNext, 200); }}
                        icon={e.icon} label={e.label} />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 8: Sleep */}
              {step === 8 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">Hours of sleep per night?</h1>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {SLEEP_OPTIONS.map(s => (
                      <button key={s} onClick={() => { setSleepHours(s); setTimeout(goNext, 200); }}
                        className={`px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          sleepHours === s ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 9: Activity */}
              {step === 9 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">How active are you?</h1>
                  </div>
                  <div className="space-y-2.5">
                    {ACTIVITY_LEVELS.map(a => (
                      <OptionCard key={a.id} selected={activityLevel === a.id} onSelect={() => { setActivityLevel(a.id); setTimeout(goNext, 200); }}
                        icon={a.icon} label={a.label} desc={a.description} />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 10: Fasting Experience */}
              {step === 10 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">Fasting experience?</h1>
                  </div>
                  <div className="space-y-2.5">
                    {FASTING_EXPERIENCE.map(f => (
                      <OptionCard key={f.id} selected={fastingExp === f.id} onSelect={() => { setFastingExp(f.id); setTimeout(goNext, 200); }}
                        icon={f.icon} label={f.label} />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 11: Report */}
              {step === 11 && (
                <div className="space-y-5">
                  <motion.div className="text-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }}>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Check className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-black">Your Health Report</h1>
                    <p className="text-sm text-muted-foreground mt-1">Personalized based on your answers</p>
                  </motion.div>

                  <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-sm">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-xl bg-secondary/70 p-3.5">
                        <p className="text-[10px] text-muted-foreground font-medium">Gender</p>
                        <p className="text-sm font-bold capitalize mt-0.5">{gender || '—'}</p>
                      </div>
                      <div className="rounded-xl bg-secondary/70 p-3.5">
                        <p className="text-[10px] text-muted-foreground font-medium">Age</p>
                        <p className="text-sm font-bold mt-0.5">{age}</p>
                      </div>
                      <div className="rounded-xl bg-secondary/70 p-3.5">
                        <p className="text-[10px] text-muted-foreground font-medium">Height</p>
                        <p className="text-sm font-bold mt-0.5">{heightCm} cm</p>
                      </div>
                      <div className="rounded-xl bg-secondary/70 p-3.5">
                        <p className="text-[10px] text-muted-foreground font-medium">Weight</p>
                        <p className="text-sm font-bold mt-0.5">{weightKg} kg</p>
                      </div>
                    </div>

                    {/* BMI */}
                    <div className="text-center space-y-2 pt-2">
                      <p className="text-xs text-muted-foreground font-medium">Body Mass Index</p>
                      <p className="text-4xl font-black" style={{ color: bmiCat.color }}>{bmi}</p>
                      <p className="text-sm font-semibold" style={{ color: bmiCat.color }}>{bmiCat.label}</p>
                      <div className="relative h-3 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 mt-3">
                        <motion.div
                          className="absolute top-0 w-4 h-4 -translate-x-1/2 -translate-y-0.5 rounded-full bg-foreground border-2 border-background shadow-lg"
                          animate={{ left: `${getBMIPosition(bmi)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground px-1">
                        <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                      </div>
                    </div>

                    {/* TDEE */}
                    <div className="rounded-xl bg-primary/5 p-4 text-center">
                      <p className="text-[10px] text-muted-foreground font-medium">Daily Calorie Needs (TDEE)</p>
                      <p className="text-xl font-black text-primary mt-1">{tdee} kcal</p>
                    </div>

                    {/* Recommended protocol */}
                    <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-5 text-center space-y-1 border border-primary/10">
                      <p className="text-xs text-muted-foreground font-medium">Recommended Protocol</p>
                      <p className="text-3xl font-black text-primary">{protocol}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {protocol.includes(':') ? `${protocol.split(':')[0]}h fasting · ${protocol.split(':')[1]}h eating` : protocol}
                      </p>
                    </div>

                    {tolose > 0 && (
                      <p className="text-center text-xs text-muted-foreground">
                        Estimated loss: <span className="font-bold text-primary">~{estLoss} kg</span> in 30 days
                      </p>
                    )}
                  </div>

                  <Button onClick={handleFinish} className="w-full shadow-lg shadow-primary/20" size="lg">
                    Got it — Go to IF Timer <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

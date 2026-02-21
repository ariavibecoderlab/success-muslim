import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Scale, Droplets, BedDouble, Moon, Timer, TrendingUp, Footprints } from 'lucide-react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getBMI, getHydration, getSleepLog, bmiCategory, getActiveIF, stopIF } from '@/lib/health-storage';
import { getStepsToday, getStepsPrefs } from '@/lib/steps-storage';
import EditableText from '@/components/cms/EditableText';

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const features = [
  { icon: Scale, title: 'BMI Calculator', desc: 'Body metrics & calorie needs', path: '/health/bmi' },
  { icon: TrendingUp, title: 'Weight Tracker', desc: 'Log weight & view trends', path: '/health/weight' },
  { icon: Droplets, title: 'Hydration', desc: 'Daily water intake tracker', path: '/health/hydration' },
  { icon: BedDouble, title: 'Sleep Tracker', desc: 'Track sleep quality', path: '/health/sleep' },
  { icon: Footprints, title: 'Steps Tracker', desc: 'Daily step count & goals', path: '/health/steps' },
  { icon: Moon, title: 'Sunnah Fasting', desc: 'Mon, Thu & White Days', path: '/health/fasting' },
  { icon: Timer, title: 'IF Timer', desc: 'Intermittent fasting modes', path: '/health/if-timer' },
];

const MiniRing = ({ pct, size = 36, stroke = 3, color = 'text-primary' }: { pct: number; size?: number; stroke?: number; color?: string }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} className="mx-auto -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/20" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} className={color} />
    </svg>
  );
};

const Health = () => {
  const navigate = useNavigate();
  const bmi = getBMI();
  const hydration = getHydration();
  const sleepLog = getSleepLog();
  const lastSleep = sleepLog[sleepLog.length - 1];
  const cat = bmi ? bmiCategory(bmi.bmi) : null;
  const { total: stepsToday } = getStepsToday();
  const stepsPrefs = getStepsPrefs();
  const stepsPct = Math.min(Math.round((stepsToday / stepsPrefs.dailyTarget) * 100), 100);
  const waterPct = Math.min(Math.round((hydration.cups / hydration.goal) * 100), 100);

  const [activeIF, setActiveIF] = useState(getActiveIF);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeIF) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeIF]);

  const handleBreakFast = () => {
    stopIF(false);
    setActiveIF(null);
  };

  let ifRemaining = 0;
  let ifProgress = 0;
  if (activeIF) {
    const start = new Date(activeIF.startTime).getTime();
    const total = activeIF.fastingHours * 3600 * 1000;
    const elapsed = now - start;
    ifRemaining = Math.max(0, total - elapsed);
    ifProgress = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0;
  }

  const formatCountdown = (ms: number) => {
    const totalMin = Math.floor(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m remaining`;
  };

  const today = new Date();
  const isMonOrThu = today.getDay() === 1 || today.getDay() === 4;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Health & Wellness" icon={Heart} />
      <div className="max-w-md mx-auto w-full px-5 py-6 space-y-6">

        {/* Hero */}
        <motion.div className="text-center space-y-2" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <motion.div
            className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="h-7 w-7 text-primary" />
          </motion.div>
          <EditableText elementKey="health.title" defaultText="Health & Wellness" tag="h1" className="text-xl font-black tracking-tight" />
          <EditableText elementKey="health.desc" defaultText="Body is an amanah — take care of it." tag="p" className="text-sm text-muted-foreground" />
        </motion.div>

        {/* Quick stats */}
        <motion.div className="grid grid-cols-4 gap-2" initial="hidden" animate="visible" variants={staggerContainer}>
          {/* BMI */}
          <motion.div variants={staggerItem}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 text-center">
                <EditableText elementKey="health.stat.bmi" defaultText="BMI" tag="p" className="text-[10px] text-muted-foreground" />
                <p className={`text-lg font-bold ${cat ? cat.color : ''}`}>{bmi?.bmi ?? '—'}</p>
                {cat && <p className={`text-[10px] font-medium ${cat.color}`}>{cat.label}</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* Water */}
          <motion.div variants={staggerItem}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 text-center relative">
                <EditableText elementKey="health.stat.water" defaultText="Water" tag="p" className="text-[10px] text-muted-foreground" />
                <div className="relative w-9 h-9 mx-auto my-0.5">
                  <MiniRing pct={waterPct} size={36} stroke={3} color="text-blue-500" />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{hydration.cups}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">/ {hydration.goal}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sleep */}
          <motion.div variants={staggerItem}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 text-center">
                <EditableText elementKey="health.stat.sleep" defaultText="Sleep" tag="p" className="text-[10px] text-muted-foreground" />
                <p className="text-lg font-bold">{lastSleep?.duration ?? '—'}</p>
                <p className="text-[10px] text-muted-foreground">hours</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Steps */}
          <motion.div variants={staggerItem}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 text-center">
                <EditableText elementKey="health.stat.steps" defaultText="Steps" tag="p" className="text-[10px] text-muted-foreground" />
                <div className="relative w-9 h-9 mx-auto my-0.5">
                  <MiniRing pct={stepsPct} size={36} stroke={3} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{stepsPct}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{stepsToday.toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Active IF Widget */}
        {activeIF && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Timer className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        <p className="text-xs font-semibold text-primary">IF Fasting Active</p>
                      </div>
                      <p className="text-sm font-bold">{formatCountdown(ifRemaining)}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleBreakFast} className="text-xs">
                    Break Fast
                  </Button>
                </div>
                <Progress value={ifProgress} className="h-1.5" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Feature cards */}
        <div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <EditableText elementKey="health.tools.title" defaultText="Wellness Tools" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
          </motion.div>
          <motion.div className="grid grid-cols-2 gap-2" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {features.map((f, i) => (
              <motion.div key={f.path} variants={staggerItem}>
                <Card
                  className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                  onClick={() => navigate(f.path)}
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <EditableText elementKey={`health.feature.${i}.title`} defaultText={f.title} tag="p" className="text-sm font-medium" />
                      <EditableText elementKey={`health.feature.${i}.desc`} defaultText={f.desc} tag="p" className="text-[10px] text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Sunnah reminder */}
        {isMonOrThu && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Card className="bg-secondary/50 border-primary/20">
              <CardContent className="p-4 text-center">
                <Moon className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground italic">
                  Today is {today.getDay() === 1 ? 'Monday' : 'Thursday'} — a recommended Sunnah fasting day.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Health;

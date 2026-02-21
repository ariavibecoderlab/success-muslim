import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Scale, Droplets, BedDouble, Moon, Timer, TrendingUp, Footprints, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getBMI, getHydration, getSleepLog, bmiCategory, getActiveIF, getIFSessions, stopIF } from '@/lib/health-storage';
import { getStepsToday, getStepsPrefs } from '@/lib/steps-storage';
import EditableText from '@/components/cms/EditableText';

// ── Animation variants ────────────────────────────

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

// ── Colorful Stats Ring ───────────────────────────

const StatsRing = ({ pct, size = 56, stroke = 4, color, children }: {
  pct: number; size?: number; stroke?: number; color: string; children: React.ReactNode;
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="text-muted/20" stroke="currentColor" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          stroke={color}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// ── Feature card config ───────────────────────────

const features = [
  { icon: Scale, title: 'BMI Calculator', desc: 'Body metrics & calorie needs', path: '/health/bmi', gradient: 'from-emerald-500 to-emerald-600' },
  { icon: TrendingUp, title: 'Weight Tracker', desc: 'Log weight & view trends', path: '/health/weight', gradient: 'from-amber-500 to-amber-600' },
  { icon: Droplets, title: 'Hydration', desc: 'Daily water intake tracker', path: '/health/hydration', gradient: 'from-blue-500 to-blue-600' },
  { icon: BedDouble, title: 'Sleep Tracker', desc: 'Track sleep quality', path: '/health/sleep', gradient: 'from-indigo-500 to-indigo-600' },
  { icon: Footprints, title: 'Steps Tracker', desc: 'Daily step count & goals', path: '/health/steps', gradient: 'from-orange-500 to-orange-600' },
  { icon: Moon, title: 'Sunnah Fasting', desc: 'Mon, Thu & White Days', path: '/health/fasting', gradient: 'from-purple-500 to-purple-600' },
];

// ── Main component ────────────────────────────────

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
  const sleepPct = lastSleep ? Math.min(Math.round((lastSleep.duration / 8) * 100), 100) : 0;
  const bmiPct = bmi ? Math.min(Math.round((Math.max(0, 25 - Math.abs(bmi.bmi - 22)) / 25) * 100), 100) : 0;

  const [activeIF, setActiveIF] = useState(getActiveIF);
  const [now, setNow] = useState(Date.now());
  const lastSession = getIFSessions()[0];

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
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const today = new Date();
  const isMonOrThu = today.getDay() === 1 || today.getDay() === 4;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Health & Wellness" icon={Heart} />
      <div className="max-w-md mx-auto w-full px-5 py-6 space-y-5">

        {/* ── IF Timer Hero ──────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          {activeIF ? (
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                      <Timer className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        <p className="text-xs font-semibold text-white/80">Fasting Active</p>
                      </div>
                      <p className="text-2xl font-black tracking-tight">{formatCountdown(ifRemaining)}</p>
                    </div>
                  </div>
                  <StatsRing pct={ifProgress} size={52} stroke={4} color="white">
                    <span className="text-xs font-bold">{Math.round(ifProgress)}%</span>
                  </StatsRing>
                </div>
                <Progress value={ifProgress} className="h-1.5 bg-white/20 [&>div]:bg-white" />
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => navigate('/health/if-timer')} className="flex-1 bg-white/20 text-white border-0 hover:bg-white/30 text-xs font-semibold">
                    View Fast
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleBreakFast} className="bg-white/10 text-white/80 border-0 hover:bg-white/20 text-xs">
                    Break Fast
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm shrink-0"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Timer className="h-7 w-7" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-black tracking-tight">Intermittent Fasting</h2>
                    <p className="text-xs text-white/70 mt-0.5">
                      {lastSession
                        ? `Last: ${lastSession.mode} — ${lastSession.completed ? 'Completed ✓' : 'Ended early'}`
                        : 'Start your wellness fasting journey'}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => navigate('/health/if-timer')} className="bg-white text-emerald-700 hover:bg-white/90 font-semibold text-xs shrink-0">
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* ── Colorful Stats Rings ────────────────── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <EditableText elementKey="health.stats.title" defaultText="Today's Progress" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
        </motion.div>
        <motion.div className="grid grid-cols-4 gap-3" initial="hidden" animate="visible" variants={staggerContainer}>
          {/* Water */}
          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={waterPct} color="hsl(217, 91%, 60%)">
              <span className="text-sm font-bold">{hydration.cups}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-blue-600">Water</p>
              <p className="text-[9px] text-muted-foreground">{hydration.cups}/{hydration.goal}</p>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={stepsPct} color="hsl(25, 95%, 53%)">
              <span className="text-[10px] font-bold">{stepsPct}%</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-orange-600">Steps</p>
              <p className="text-[9px] text-muted-foreground">{stepsToday.toLocaleString()}</p>
            </div>
          </motion.div>

          {/* Sleep */}
          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={sleepPct} color="hsl(239, 84%, 67%)">
              <span className="text-sm font-bold">{lastSleep?.duration ?? '—'}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-indigo-600">Sleep</p>
              <p className="text-[9px] text-muted-foreground">hours</p>
            </div>
          </motion.div>

          {/* BMI */}
          <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
            <StatsRing pct={bmiPct} color="hsl(160, 84%, 39%)">
              <span className="text-sm font-bold">{bmi?.bmi ?? '—'}</span>
            </StatsRing>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-emerald-600">BMI</p>
              {cat && <p className={`text-[9px] font-medium ${cat.color}`}>{cat.label}</p>}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Gradient Feature Cards ──────────────── */}
        <div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <EditableText elementKey="health.tools.title" defaultText="Wellness Tools" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
          </motion.div>
          <motion.div className="grid grid-cols-2 gap-2.5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {features.map((f, i) => (
              <motion.div key={f.path} variants={staggerItem}>
                <Card
                  className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                  onClick={() => navigate(f.path)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shrink-0`}>
                      <f.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <EditableText elementKey={`health.feature.${i}.title`} defaultText={f.title} tag="p" className="text-sm font-semibold truncate" />
                      <EditableText elementKey={`health.feature.${i}.desc`} defaultText={f.desc} tag="p" className="text-[10px] text-muted-foreground" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Sunnah Reminder ────────────────────── */}
        {isMonOrThu && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Card className="border-0 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 shadow-sm">
              <CardContent className="p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto">
                  <Moon className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  It's {today.getDay() === 1 ? 'Monday' : 'Thursday'} — a Sunnah fasting day!
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/60 italic">
                  The Prophet ﷺ would fast on Mondays and Thursdays
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

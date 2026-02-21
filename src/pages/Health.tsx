import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Scale, Droplets, BedDouble, Moon, Timer, TrendingUp, Footprints } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBMI, getHydration, getSleepLog, bmiCategory, getActiveIF, stopIF } from '@/lib/health-storage';
import { getStepsToday, getStepsPrefs } from '@/lib/steps-storage';
import EditableText from '@/components/cms/EditableText';

const features = [
  { icon: Scale, title: 'BMI Calculator', desc: 'Body metrics & calorie needs', path: '/health/bmi' },
  { icon: TrendingUp, title: 'Weight Tracker', desc: 'Log weight & view trends', path: '/health/weight' },
  { icon: Droplets, title: 'Hydration', desc: 'Daily water intake tracker', path: '/health/hydration' },
  { icon: BedDouble, title: 'Sleep Tracker', desc: 'Track sleep quality', path: '/health/sleep' },
  { icon: Footprints, title: 'Steps Tracker', desc: 'Daily step count & goals', path: '/health/steps' },
  { icon: Moon, title: 'Sunnah Fasting', desc: 'Mon, Thu & White Days', path: '/health/fasting' },
  { icon: Timer, title: 'IF Timer', desc: 'Intermittent fasting modes', path: '/health/if-timer' },
];

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
  if (activeIF) {
    const start = new Date(activeIF.startTime).getTime();
    const total = activeIF.fastingHours * 3600 * 1000;
    ifRemaining = Math.max(0, total - (now - start));
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
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Heart className="h-7 w-7 text-primary" />
        </div>
        <EditableText elementKey="health.title" defaultText="Health & Wellness" tag="h1" className="text-xl font-bold" />
        <EditableText elementKey="health.desc" defaultText="Body is an amanah — take care of it." tag="p" className="text-sm text-muted-foreground" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card><CardContent className="p-3 text-center">
          <EditableText elementKey="health.stat.bmi" defaultText="BMI" tag="p" className="text-[10px] text-muted-foreground" />
          <p className="text-lg font-bold">{bmi?.bmi ?? '—'}</p>
          {cat && <p className={`text-[10px] font-medium ${cat.color}`}>{cat.label}</p>}
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <EditableText elementKey="health.stat.water" defaultText="Water" tag="p" className="text-[10px] text-muted-foreground" />
          <p className="text-lg font-bold">{hydration.cups}/{hydration.goal}</p>
          <p className="text-[10px] text-muted-foreground">glasses</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <EditableText elementKey="health.stat.sleep" defaultText="Sleep" tag="p" className="text-[10px] text-muted-foreground" />
          <p className="text-lg font-bold">{lastSleep?.duration ?? '—'}</p>
          <p className="text-[10px] text-muted-foreground">hours</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <EditableText elementKey="health.stat.steps" defaultText="Steps" tag="p" className="text-[10px] text-muted-foreground" />
          <p className="text-lg font-bold">{stepsToday.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">{stepsPct}%</p>
        </CardContent></Card>
      </div>

      {/* Active IF Widget */}
      {activeIF && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Timer className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary">IF Fasting Active</p>
                  <p className="text-sm font-bold">{formatCountdown(ifRemaining)}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleBreakFast} className="text-xs">
                Break Fast
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature cards */}
      <div>
        <EditableText elementKey="health.tools.title" defaultText="Wellness Tools" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
        <div className="grid grid-cols-2 gap-2">
          {features.map((f, i) => (
            <Card
              key={f.path}
              className="cursor-pointer hover:bg-secondary/50 transition-colors active:scale-[0.98]"
              onClick={() => navigate(f.path)}
            >
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <EditableText elementKey={`health.feature.${i}.title`} defaultText={f.title} tag="p" className="text-sm font-medium" />
                  <EditableText elementKey={`health.feature.${i}.desc`} defaultText={f.desc} tag="p" className="text-[10px] text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sunnah reminder */}
      {isMonOrThu && (
        <Card className="bg-secondary/50">
          <CardContent className="p-4 text-center">
            <Moon className="h-5 w-5 mx-auto text-primary mb-2" />
            <p className="text-xs text-muted-foreground italic">
              Today is {today.getDay() === 1 ? 'Monday' : 'Thursday'} — a recommended Sunnah fasting day.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
    </div>
  );
};

export default Health;

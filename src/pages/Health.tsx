import { useNavigate } from 'react-router-dom';
import { Heart, Scale, Droplets, BedDouble, Moon, Timer, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getBMI, getHydration, getSleepLog, bmiCategory } from '@/lib/health-storage';
import EditableText from '@/components/cms/EditableText';

const features = [
  { icon: Scale, title: 'BMI Calculator', desc: 'Body metrics & calorie needs', path: '/health/bmi' },
  { icon: TrendingUp, title: 'Weight Tracker', desc: 'Log weight & view trends', path: '/health/weight' },
  { icon: Droplets, title: 'Hydration', desc: 'Daily water intake tracker', path: '/health/hydration' },
  { icon: BedDouble, title: 'Sleep Tracker', desc: 'Track sleep quality', path: '/health/sleep' },
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

  const today = new Date();
  const isMonOrThu = today.getDay() === 1 || today.getDay() === 4;

  return (
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
      <div className="grid grid-cols-3 gap-2">
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
      </div>

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
  );
};

export default Health;

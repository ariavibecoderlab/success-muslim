import { useState } from 'react';
import { BedDouble, Moon, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import SubPageLayout from '@/components/SubPageLayout';
import { getSleepLog, addSleepEntry, calculateSleepDuration, sleepQuality, todayKey } from '@/lib/health-storage';
import { format, parseISO } from 'date-fns';
import EditableText from '@/components/cms/EditableText';

const SLEEP_TARGETS_KEY = 'health_sleep_targets';

interface SleepTargets {
  bedtime: string;
  wakeTime: string;
}

function getSleepTargets(): SleepTargets {
  try {
    const raw = localStorage.getItem(SLEEP_TARGETS_KEY);
    return raw ? JSON.parse(raw) : { bedtime: '22:30', wakeTime: '05:30' };
  } catch { return { bedtime: '22:30', wakeTime: '05:30' }; }
}

function saveSleepTargets(t: SleepTargets) {
  localStorage.setItem(SLEEP_TARGETS_KEY, JSON.stringify(t));
}

function timeDiffMinutes(actual: string, target: string): number {
  const [ah, am] = actual.split(':').map(Number);
  const [th, tm] = target.split(':').map(Number);
  let diff = (ah * 60 + am) - (th * 60 + tm);
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  return diff;
}
const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/steps', label: 'Steps' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
];

const HealthSleep = () => {
  const [log, setLog] = useState(getSleepLog);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [targets, setTargets] = useState(getSleepTargets);
  const [editTargets, setEditTargets] = useState(false);
  const [targetBed, setTargetBed] = useState(targets.bedtime);
  const [targetWake, setTargetWake] = useState(targets.wakeTime);

  const handleAdd = () => {
    const duration = calculateSleepDuration(bedtime, wakeTime);
    addSleepEntry({ date: todayKey(), bedtime, wakeTime, duration });
    setLog(getSleepLog());
  };

  const lastEntry = log[log.length - 1];
  const quality = lastEntry ? sleepQuality(lastEntry.duration) : null;

  const last7 = log.slice(-7).map(e => ({
    date: format(parseISO(e.date), 'EEE'),
    hours: e.duration,
  }));

  const avg = last7.length ? +(last7.reduce((s, e) => s + e.hours, 0) / last7.length).toFixed(1) : 0;

  return (
    <SubPageLayout title="Sleep Tracker" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/sleep">
      <div className="space-y-5">
        {/* Input */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs flex items-center gap-1"><Moon className="h-3 w-3" /> Bedtime</Label>
                <Input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1"><BedDouble className="h-3 w-3" /> Wake Time</Label>
                <Input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleAdd} className="w-full">Log Sleep</Button>
          </CardContent>
        </Card>

        {/* Last night + target comparison */}
        {lastEntry && quality && (
          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <EditableText elementKey="sleep.lastnight" defaultText="Last Night" tag="p" className="text-xs text-muted-foreground" />
              <p className="text-4xl font-bold">{lastEntry.duration}h</p>
              <p className={`text-sm font-medium ${quality.color}`}>{quality.label}</p>
              <p className="text-xs text-muted-foreground">{lastEntry.bedtime} → {lastEntry.wakeTime}</p>
              {/* Target comparison */}
              <div className="flex justify-center gap-4 pt-1">
                {(() => {
                  const bedDiff = timeDiffMinutes(lastEntry.bedtime, targets.bedtime);
                  const wakeDiff = timeDiffMinutes(lastEntry.wakeTime, targets.wakeTime);
                  return (
                    <>
                      <span className={`text-[11px] ${Math.abs(bedDiff) <= 15 ? 'text-primary' : 'text-amber-500'}`}>
                        Bed: {bedDiff === 0 ? 'On target' : bedDiff > 0 ? `${bedDiff}m late` : `${-bedDiff}m early`}
                      </span>
                      <span className={`text-[11px] ${Math.abs(wakeDiff) <= 15 ? 'text-primary' : 'text-amber-500'}`}>
                        Wake: {wakeDiff === 0 ? 'On target' : wakeDiff > 0 ? `${wakeDiff}m late` : `${-wakeDiff}m early`}
                      </span>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <Card><CardContent className="p-3 text-center">
            <EditableText elementKey="sleep.avg" defaultText="7-Day Avg" tag="p" className="text-xs text-muted-foreground" />
            <p className="text-lg font-bold">{avg}h</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <EditableText elementKey="sleep.entries" defaultText="Entries" tag="p" className="text-xs text-muted-foreground" />
            <p className="text-lg font-bold">{log.length}</p>
          </CardContent></Card>
        </div>

        {/* Chart */}
        {last7.length > 1 && (
          <Card>
            <CardContent className="p-4">
              <EditableText elementKey="sleep.chart.title" defaultText="Last 7 Days" tag="p" className="text-xs font-semibold text-muted-foreground mb-3" />
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={last7}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Sleep & Wake Targets */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <EditableText elementKey="sleep.targets.title" defaultText="Sleep & Wake Targets" tag="p" className="text-sm font-semibold" />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditTargets(!editTargets)}>
                {editTargets ? 'Done' : 'Edit'}
              </Button>
            </div>
            {editTargets ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Target Bedtime</Label>
                  <Input type="time" value={targetBed} onChange={e => {
                    setTargetBed(e.target.value);
                    const t = { bedtime: e.target.value, wakeTime: targetWake };
                    saveSleepTargets(t);
                    setTargets(t);
                  }} />
                </div>
                <div>
                  <Label className="text-xs">Target Wake</Label>
                  <Input type="time" value={targetWake} onChange={e => {
                    setTargetWake(e.target.value);
                    const t = { bedtime: targetBed, wakeTime: e.target.value };
                    saveSleepTargets(t);
                    setTargets(t);
                  }} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Bedtime</p>
                  <p className="text-sm font-bold">{targets.bedtime}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Wake Up</p>
                  <p className="text-sm font-bold">{targets.wakeTime}</p>
                </div>
                <p className="col-span-2 text-[10px] text-muted-foreground">
                  Target: {calculateSleepDuration(targets.bedtime, targets.wakeTime)}h of sleep
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default HealthSleep;

import { useState } from 'react';
import { BedDouble, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import SubPageLayout from '@/components/SubPageLayout';
import { getSleepLog, addSleepEntry, calculateSleepDuration, sleepQuality, todayKey } from '@/lib/health-storage';
import { format, parseISO } from 'date-fns';
import EditableText from '@/components/cms/EditableText';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
];

const HealthSleep = () => {
  const [log, setLog] = useState(getSleepLog);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:00');

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

        {/* Last night */}
        {lastEntry && quality && (
          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <EditableText elementKey="sleep.lastnight" defaultText="Last Night" tag="p" className="text-xs text-muted-foreground" />
              <p className="text-4xl font-bold">{lastEntry.duration}h</p>
              <p className={`text-sm font-medium ${quality.color}`}>{quality.label}</p>
              <p className="text-xs text-muted-foreground">{lastEntry.bedtime} → {lastEntry.wakeTime}</p>
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
      </div>
    </SubPageLayout>
  );
};

export default HealthSleep;

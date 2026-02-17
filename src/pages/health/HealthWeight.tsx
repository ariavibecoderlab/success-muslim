import { useState } from 'react';
import { TrendingDown, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import SubPageLayout from '@/components/SubPageLayout';
import { getWeightLog, addWeightEntry, getWeightGoal, setWeightGoal, todayKey } from '@/lib/health-storage';
import { format, parseISO } from 'date-fns';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
];

const HealthWeight = () => {
  const [log, setLog] = useState(getWeightLog);
  const [newWeight, setNewWeight] = useState('');
  const [goal, setGoal] = useState(getWeightGoal()?.toString() || '');

  const handleAdd = () => {
    const w = parseFloat(newWeight);
    if (!w) return;
    addWeightEntry({ date: todayKey(), weight: w });
    setLog(getWeightLog());
    setNewWeight('');
  };

  const handleGoal = () => {
    const g = parseFloat(goal);
    if (g) setWeightGoal(g);
  };

  const goalVal = getWeightGoal();
  const latest = log[log.length - 1];
  const first = log[0];
  const weights = log.map(e => e.weight);
  const highest = weights.length ? Math.max(...weights) : 0;
  const lowest = weights.length ? Math.min(...weights) : 0;
  const change = latest && first ? +(latest.weight - first.weight).toFixed(1) : 0;

  const chartData = log.slice(-30).map(e => ({ date: format(parseISO(e.date), 'dd/MM'), weight: e.weight }));

  return (
    <SubPageLayout title="Weight Tracker" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/weight">
      <div className="space-y-5">
        {/* Add entry */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Label className="text-xs">Log today's weight (kg)</Label>
            <div className="flex gap-2">
              <Input type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="70.5" />
              <Button onClick={handleAdd} size="sm">Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {log.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <Card><CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-lg font-bold">{latest?.weight}</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Highest</p>
              <p className="text-lg font-bold">{highest}</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Change</p>
              <p className={`text-lg font-bold flex items-center justify-center gap-1 ${change < 0 ? 'text-primary' : change > 0 ? 'text-destructive' : ''}`}>
                {change > 0 ? <TrendingUp className="h-3 w-3" /> : change < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                {change > 0 ? '+' : ''}{change}
              </p>
            </CardContent></Card>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 1 && (
          <Card>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  {goalVal && <ReferenceLine y={goalVal} stroke="hsl(var(--accent))" strokeDasharray="5 5" label={{ value: 'Goal', fontSize: 10 }} />}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Goal */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Label className="text-xs flex items-center gap-1"><Target className="h-3 w-3" /> Goal Weight (kg)</Label>
            <div className="flex gap-2">
              <Input type="number" value={goal} onChange={e => setGoal(e.target.value)} placeholder="65" />
              <Button onClick={handleGoal} size="sm" variant="secondary">Set</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default HealthWeight;

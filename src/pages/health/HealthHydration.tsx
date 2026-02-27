import { useState } from 'react';
import { Droplets, Plus, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import SubPageLayout from '@/components/SubPageLayout';
import { useHydration, useHydrationMutation, useHydrationHistory } from '@/hooks/useHealthQuery';
import EditableText from '@/components/cms/EditableText';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/steps', label: 'Steps' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
];

const HealthHydration = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [highlightPicker, setHighlightPicker] = useState(false);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  const { data: today } = useHydration(dateKey);
  const { addCup: addCupMutation, removeCup: removeCupMutation } = useHydrationMutation();
  const progress = Math.min((today.cups / today.goal) * 100, 100);
  const { data: history } = useHydrationHistory(7);

  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <SubPageLayout title="Hydration Tracker" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/hydration">
      <BackdatePrompt moduleKey="hydration" onLogPastData={() => { const y = new Date(); y.setDate(y.getDate() - 1); setSelectedDate(y); setHighlightPicker(true); }} />
      <div className="space-y-5">
        {/* Date Picker */}
        <div className="flex justify-center">
          <BackdateDatePicker selectedDate={selectedDate} onDateChange={(d) => { setSelectedDate(d); }} compact highlight={highlightPicker} />
        </div>

        {/* Progress ring */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
              <circle
                cx="80" cy="80" r="70" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets className="h-6 w-6 text-primary mb-1" />
              <p className="text-3xl font-bold">{today.cups}</p>
              <p className="text-xs text-muted-foreground">/ {today.goal} glasses</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="icon" onClick={() => { removeCupMutation.mutate(dateKey); }}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button size="lg" onClick={() => { addCupMutation.mutate(dateKey); }} className="gap-2 px-8">
            <Plus className="h-4 w-4" /> Add Glass
          </Button>
        </div>

        {/* Weekly history */}
        <Card>
          <CardContent className="p-4">
            <EditableText elementKey="hydration.history.title" defaultText="Last 7 Days" tag="p" className="text-xs font-semibold text-muted-foreground mb-3" />
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={history}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Bar dataKey="cups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default HealthHydration;
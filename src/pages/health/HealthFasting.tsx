import { useState } from 'react';
import { Check, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubPageLayout from '@/components/SubPageLayout';
import { getFastingLog, toggleFasting } from '@/lib/health-storage';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import EditableText from '@/components/cms/EditableText';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/steps', label: 'Steps' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HealthFasting = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [fastingLog, setFastingLog] = useState(() => getFastingLog());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const isRecommended = (date: Date) => {
    const day = getDay(date);
    const dayOfMonth = date.getDate();
    return day === 1 || day === 4 || (dayOfMonth >= 13 && dayOfMonth <= 15);
  };

  const handleToggle = (dateKey: string) => {
    toggleFasting(dateKey);
    setFastingLog(getFastingLog());
  };

  const totalFasted = days.filter(d => fastingLog[format(d, 'yyyy-MM-dd')]).length;
  const recommendedHit = days.filter(d => isRecommended(d) && fastingLog[format(d, 'yyyy-MM-dd')]).length;
  const totalRecommended = days.filter(d => isRecommended(d)).length;

  return (
    <SubPageLayout title="Sunnah Fasting" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/fasting">
      <div className="space-y-5">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>← Prev</Button>
          <h2 className="text-sm font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>Next →</Button>
        </div>

        {/* Calendar */}
        <Card>
          <CardContent className="p-3">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-[10px] text-muted-foreground font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map(day => {
                const key = format(day, 'yyyy-MM-dd');
                const fasted = !!fastingLog[key];
                const recommended = isRecommended(day);
                const isWhiteDay = day.getDate() >= 13 && day.getDate() <= 15;
                return (
                  <button
                    key={key}
                    onClick={() => handleToggle(key)}
                    className={`aspect-square rounded-md text-xs flex flex-col items-center justify-center transition-colors relative
                      ${fasted ? 'bg-primary text-primary-foreground' : recommended ? (isWhiteDay ? 'bg-accent/30' : 'bg-secondary') : 'hover:bg-secondary'}
                    `}
                  >
                    <span>{day.getDate()}</span>
                    {fasted && <Check className="h-2.5 w-2.5 absolute bottom-0.5" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-secondary" /> Mon/Thu</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent/30" /> White Days</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary" /> Fasted</span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-2">
          <Card><CardContent className="p-3 text-center">
            <EditableText elementKey="fasting.daysfasted" defaultText="Days Fasted" tag="p" className="text-xs text-muted-foreground" />
            <p className="text-lg font-bold">{totalFasted}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <EditableText elementKey="fasting.sunnahhit" defaultText="Sunnah Days Hit" tag="p" className="text-xs text-muted-foreground" />
            <p className="text-lg font-bold">{recommendedHit}/{totalRecommended}</p>
          </CardContent></Card>
        </div>

        {/* Hadith */}
        <Card className="bg-secondary/50">
          <CardContent className="p-4 text-center">
            <Moon className="h-5 w-5 mx-auto text-primary mb-2" />
            <EditableText elementKey="fasting.hadith" defaultText="&quot;The Prophet ﷺ used to fast on Mondays and Thursdays.&quot;" tag="p" className="text-xs text-muted-foreground italic" />
            <EditableText elementKey="fasting.hadith.source" defaultText="— Tirmidhi" tag="p" className="text-[10px] text-muted-foreground mt-1" />
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default HealthFasting;

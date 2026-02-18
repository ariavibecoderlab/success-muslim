import { useState, useEffect } from 'react';
import { Timer, Play, Square, Trash2, ChevronUp, ChevronDown, Settings2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubPageLayout from '@/components/SubPageLayout';
import { getActiveIF, getIFSessions, startIF, stopIF, deleteIF } from '@/lib/health-storage';
import { format, addDays, subDays } from 'date-fns';
import EditableText from '@/components/cms/EditableText';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
];

const MODES = [
  { label: '16:8', hours: 16 },
  { label: '18:6', hours: 18 },
  { label: '20:4', hours: 20 },
  { label: '24h', hours: 24 },
  { label: '36h', hours: 36 },
];

const generateDates = () => {
  const dates: { label: string; value: Date }[] = [];
  for (let i = -3; i <= 7; i++) {
    const d = i === 0 ? new Date() : i > 0 ? addDays(new Date(), i) : subDays(new Date(), Math.abs(i));
    dates.push({ label: i === 0 ? 'Today' : format(d, 'EEE dd MMM'), value: d });
  }
  return dates;
};

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

interface ScrollPickerProps {
  items: { label: string; value: any }[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

const ScrollPicker = ({ items, selectedIndex, onSelect, className = '' }: ScrollPickerProps) => {
  const visibleCount = 5;
  const half = Math.floor(visibleCount / 2);

  return (
    <div className={`relative h-[180px] overflow-hidden ${className}`}>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-9 bg-primary/10 rounded-lg z-0 pointer-events-none" />
      <div className="flex flex-col items-center justify-center h-full">
        {Array.from({ length: visibleCount }, (_, vi) => {
          const idx = selectedIndex - half + vi;
          if (idx < 0 || idx >= items.length) {
            return <div key={vi} className="h-9 flex items-center justify-center" />;
          }
          const isSelected = vi === half;
          const distance = Math.abs(vi - half);
          return (
            <button
              key={vi}
              onClick={() => onSelect(idx)}
              className={`h-9 flex items-center justify-center w-full transition-all ${
                isSelected
                  ? 'text-foreground font-bold text-base'
                  : distance === 1
                  ? 'text-muted-foreground text-sm'
                  : 'text-muted-foreground/40 text-xs'
              }`}
            >
              {items[idx].label}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onSelect(Math.max(0, selectedIndex - 1))}
        className="absolute top-0 inset-x-0 h-8 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        onClick={() => onSelect(Math.min(items.length - 1, selectedIndex + 1))}
        className="absolute bottom-0 inset-x-0 h-8 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
};

const HealthIFTimer = () => {
  const [active, setActive] = useState(getActiveIF);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [now, setNow] = useState(Date.now());
  const [sessions, setSessions] = useState(getIFSessions);
  const [showCustom, setShowCustom] = useState(false);

  // Custom start date/time picker state
  const dateOptions = generateDates();
  const [startDateIdx, setStartDateIdx] = useState(3); // Today
  const [startHour, setStartHour] = useState(new Date().getHours() % 12 || 12);
  const [startMinute, setStartMinute] = useState(new Date().getMinutes());
  const [startAmPm, setStartAmPm] = useState<'AM' | 'PM'>(new Date().getHours() >= 12 ? 'PM' : 'AM');

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [active]);

  const getCustomStartDate = () => {
    const d = new Date(dateOptions[startDateIdx].value);
    let h = startHour % 12;
    if (startAmPm === 'PM') h += 12;
    d.setHours(h, startMinute, 0, 0);
    return d;
  };

  const isCustomFast = active?.fastingHours === 0;

  const handleStart = () => {
    startIF(selectedMode.label, selectedMode.hours);
    setActive(getActiveIF());
  };

  const handleCustomStart = () => {
    const startTime = getCustomStartDate().toISOString();
    // Store with fastingHours=0 to indicate open-ended custom fast
    localStorage.setItem('health_if_active', JSON.stringify({
      mode: 'Custom',
      startTime,
      fastingHours: 0,
    }));
    setActive({ mode: 'Custom', startTime, fastingHours: 0 });
    setShowCustom(false);
  };

  const handleEndFast = () => {
    stopIF(true);
    setActive(null);
    setSessions(getIFSessions());
  };

  const handleDeleteFast = () => {
    deleteIF();
    setActive(null);
  };

  const handleStop = (completed: boolean) => {
    stopIF(completed);
    setActive(null);
    setSessions(getIFSessions());
  };

  const handleSelectPreset = (m: typeof MODES[0]) => {
    setSelectedMode(m);
    setShowCustom(false);
  };

  let elapsed = 0;
  let total = 0;
  let remaining = 0;
  let progress = 0;

  if (active) {
    const start = new Date(active.startTime).getTime();
    elapsed = Math.max(0, now - start);
    if (isCustomFast) {
      // Open-ended: no total, no remaining
      progress = 0;
    } else {
      total = active.fastingHours * 3600 * 1000;
      remaining = Math.max(0, total - elapsed);
      progress = Math.min((elapsed / total) * 100, 100);
    }
  }

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (progress / 100) * circumference;

  const hourItems = HOURS_12.map(h => ({ label: String(h), value: h }));
  const minuteItems = MINUTES.map(m => ({ label: String(m).padStart(2, '0'), value: m }));
  const ampmItems = [{ label: 'AM', value: 'AM' }, { label: 'PM', value: 'PM' }];

  return (
    <SubPageLayout title="IF Timer" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/if-timer">
      <div className="space-y-5">
        {/* Preset modes */}
        {!active && !showCustom && (
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {MODES.map(m => (
                <button
                  key={m.label}
                  onClick={() => handleSelectPreset(m)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedMode.label === m.label ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {m.label}
                </button>
              ))}
              <button
                onClick={() => setShowCustom(true)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 bg-secondary text-secondary-foreground"
              >
                <Settings2 className="h-3.5 w-3.5" /> Custom
              </button>
            </div>
          </div>
        )}

        {/* Custom Fasting - Start time only */}
        {!active && showCustom && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Custom Fast</span>
                </div>

                {/* Start time display */}
                <div className="flex items-center justify-between w-full py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">Start Time</span>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {dateOptions[startDateIdx].label}, {startHour}:{String(startMinute).padStart(2, '0')} {startAmPm}
                  </span>
                </div>

                {/* Scroll pickers for start only */}
                <div className="grid grid-cols-4 gap-1">
                  <ScrollPicker
                    items={dateOptions.map(d => ({ label: d.label, value: d.value }))}
                    selectedIndex={startDateIdx}
                    onSelect={setStartDateIdx}
                  />
                  <ScrollPicker
                    items={hourItems}
                    selectedIndex={HOURS_12.indexOf(startHour)}
                    onSelect={idx => setStartHour(HOURS_12[idx])}
                  />
                  <ScrollPicker
                    items={minuteItems}
                    selectedIndex={startMinute}
                    onSelect={setStartMinute}
                  />
                  <ScrollPicker
                    items={ampmItems}
                    selectedIndex={startAmPm === 'AM' ? 0 : 1}
                    onSelect={idx => setStartAmPm(idx === 0 ? 'AM' : 'PM')}
                  />
                </div>

                <p className="text-[10px] text-muted-foreground">
                  * Select when your fast starts. Tap "Start Fast" to begin.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setShowCustom(false)} className="gap-2">
                Cancel
              </Button>
              <Button onClick={handleCustomStart} className="gap-2">
                <Play className="h-4 w-4" /> Start Fast
              </Button>
            </div>
          </div>
        )}

        {/* Timer display */}
        {!showCustom && (
          <div className="flex flex-col items-center">
            <div className="relative w-52 h-52">
              <svg className="w-52 h-52 -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                {active && !isCustomFast && (
                  <circle
                    cx="80" cy="80" r="70" fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-1000"
                  />
                )}
                {active && isCustomFast && (
                  <circle
                    cx="80" cy="80" r="70" fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="12 8"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {active ? (
                  isCustomFast ? (
                    <>
                      <EditableText elementKey="iftimer.elapsed" defaultText="Elapsed" tag="p" className="text-xs text-muted-foreground" />
                      <p className="text-2xl font-bold font-mono">{formatTime(elapsed)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Custom fast</p>
                    </>
                  ) : (
                    <>
                      <EditableText elementKey="iftimer.remaining" defaultText="Remaining" tag="p" className="text-xs text-muted-foreground" />
                      <p className="text-2xl font-bold font-mono">{formatTime(remaining)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{active.mode} fast</p>
                    </>
                  )
                ) : (
                  <>
                    <Timer className="h-8 w-8 text-primary mb-2" />
                    <p className="text-lg font-bold">{selectedMode.label}</p>
                    <p className="text-xs text-muted-foreground">{selectedMode.hours}h fast</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!showCustom && (
          <div className="flex justify-center gap-3">
            {!active ? (
              <Button onClick={handleStart} className="gap-2 px-8">
                <Play className="h-4 w-4" /> Start Fast
              </Button>
            ) : isCustomFast ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleDeleteFast}
                  className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
                <Button
                  onClick={handleEndFast}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Square className="h-4 w-4" /> End Fast
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleStop(false)} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Cancel
                </Button>
                {remaining === 0 && (
                  <Button onClick={() => handleStop(true)} className="gap-2">
                    <Square className="h-4 w-4" /> Complete
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {active && !showCustom && (
          <Card>
            <CardContent className="p-4 text-center space-y-1">
              {isCustomFast ? (
                <>
                  <p className="text-xs text-muted-foreground">Fasting since</p>
                  <p className="text-lg font-bold">{format(new Date(active.startTime), 'HH:mm, dd MMM')}</p>
                </>
              ) : (
                <>
                  <EditableText elementKey="iftimer.elapsed" defaultText="Elapsed" tag="p" className="text-xs text-muted-foreground" />
                  <p className="text-lg font-bold font-mono">{formatTime(elapsed)}</p>
                  <p className="text-xs text-muted-foreground">
                    Started {format(new Date(active.startTime), 'HH:mm, dd MMM')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {sessions.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <EditableText elementKey="iftimer.history" defaultText="Recent Fasts" tag="p" className="text-xs font-semibold text-muted-foreground mb-3" />
              <div className="space-y-2">
                {sessions.slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{s.startTime ? format(new Date(s.startTime), 'dd MMM HH:mm') : '—'}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.mode}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.completed ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        {s.completed ? 'Done' : 'Cancelled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SubPageLayout>
  );
};

export default HealthIFTimer;

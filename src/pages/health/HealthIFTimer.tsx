import { useState, useEffect } from 'react';
import { Timer, Play, Square, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubPageLayout from '@/components/SubPageLayout';
import { getActiveIF, getIFSessions, startIF, stopIF } from '@/lib/health-storage';
import { format } from 'date-fns';

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

const HealthIFTimer = () => {
  const [active, setActive] = useState(getActiveIF);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [now, setNow] = useState(Date.now());
  const [sessions, setSessions] = useState(getIFSessions);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [active]);

  const handleStart = () => {
    startIF(selectedMode.label, selectedMode.hours);
    setActive(getActiveIF());
  };

  const handleStop = (completed: boolean) => {
    stopIF(completed);
    setActive(null);
    setSessions(getIFSessions());
  };

  // Timer calculations
  let elapsed = 0;
  let total = 0;
  let remaining = 0;
  let progress = 0;

  if (active) {
    const start = new Date(active.startTime).getTime();
    total = active.fastingHours * 3600 * 1000;
    elapsed = now - start;
    remaining = Math.max(0, total - elapsed);
    progress = Math.min((elapsed / total) * 100, 100);
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

  return (
    <SubPageLayout title="IF Timer" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/if-timer">
      <div className="space-y-5">
        {/* Mode selector (only when not active) */}
        {!active && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {MODES.map(m => (
              <button
                key={m.label}
                onClick={() => setSelectedMode(m)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedMode.label === m.label ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Timer ring */}
        <div className="flex flex-col items-center">
          <div className="relative w-52 h-52">
            <svg className="w-52 h-52 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              {active && (
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
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {active ? (
                <>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold font-mono">{formatTime(remaining)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{active.mode} fast</p>
                </>
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

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!active ? (
            <Button onClick={handleStart} className="gap-2 px-8">
              <Play className="h-4 w-4" /> Start Fast
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleStop(false)} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Cancel
              </Button>
              {remaining === 0 && (
                <Button onClick={() => handleStop(true)} className="gap-2">
                  <Square className="h-4 w-4" /> Complete
                </Button>
              )}
            </>
          )}
        </div>

        {/* Elapsed info */}
        {active && (
          <Card>
            <CardContent className="p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Elapsed</p>
              <p className="text-lg font-bold font-mono">{formatTime(elapsed)}</p>
              <p className="text-xs text-muted-foreground">
                Started {format(new Date(active.startTime), 'HH:mm, dd MMM')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* History */}
        {sessions.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Recent Fasts</p>
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

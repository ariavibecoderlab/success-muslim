import { useState, useEffect } from 'react';
import { Timer, Play, Square, RotateCcw, Settings2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SubPageLayout from '@/components/SubPageLayout';
import { getActiveIF, getIFSessions, startIF, stopIF } from '@/lib/health-storage';
import { format } from 'date-fns';
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

const CUSTOM_KEY = 'health_if_custom';

const HealthIFTimer = () => {
  const [active, setActive] = useState(getActiveIF);
  const savedCustom = (() => { try { const r = localStorage.getItem(CUSTOM_KEY); return r ? JSON.parse(r) : null; } catch { return null; } })();
  const [selectedMode, setSelectedMode] = useState(savedCustom ? { label: 'Custom', hours: savedCustom.hours + savedCustom.minutes / 60 } : MODES[0]);
  const [now, setNow] = useState(Date.now());
  const [sessions, setSessions] = useState(getIFSessions);
  const [showCustom, setShowCustom] = useState(!!savedCustom && !MODES.some(m => m.label === (savedCustom ? 'Custom' : '')));
  const [customHours, setCustomHours] = useState(savedCustom?.hours ?? 13);
  const [customMinutes, setCustomMinutes] = useState(savedCustom?.minutes ?? 30);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [active]);

  const handleStart = () => {
    startIF(selectedMode.label === 'Custom' ? 'My Custom Fast' : selectedMode.label, selectedMode.hours);
    setActive(getActiveIF());
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

  const handleCustomConfirm = () => {
    const totalHours = customHours + customMinutes / 60;
    if (totalHours <= 0) return;
    localStorage.setItem(CUSTOM_KEY, JSON.stringify({ hours: customHours, minutes: customMinutes }));
    setSelectedMode({ label: 'Custom', hours: totalHours });
  };

  const handleShowCustom = () => {
    setShowCustom(true);
    const totalHours = customHours + customMinutes / 60;
    setSelectedMode({ label: 'Custom', hours: totalHours });
  };

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
        {!active && (
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
                onClick={handleShowCustom}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  selectedMode.label === 'Custom' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <Settings2 className="h-3.5 w-3.5" /> Custom
              </button>
            </div>

            {showCustom && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">My Custom Fast</p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Hours</Label>
                      <Input
                        type="number"
                        min={0}
                        max={72}
                        value={customHours}
                        onChange={e => { setCustomHours(Math.max(0, parseInt(e.target.value) || 0)); }}
                        className="h-9"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Minutes</Label>
                      <Input
                        type="number"
                        min={0}
                        max={59}
                        value={customMinutes}
                        onChange={e => { setCustomMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0))); }}
                        className="h-9"
                      />
                    </div>
                    <Button size="sm" onClick={handleCustomConfirm}>Save</Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Duration: {customHours}h {customMinutes}m — saved as your default</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

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
                  <EditableText elementKey="iftimer.remaining" defaultText="Remaining" tag="p" className="text-xs text-muted-foreground" />
                  <p className="text-2xl font-bold font-mono">{formatTime(remaining)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{active.mode} fast</p>
                </>
              ) : (
                <>
                  <Timer className="h-8 w-8 text-primary mb-2" />
                  <p className="text-lg font-bold">{selectedMode.label === 'Custom' ? 'My Custom Fast' : selectedMode.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedMode.label === 'Custom'
                      ? `${customHours}h ${customMinutes}m fast`
                      : `${selectedMode.hours}h fast`}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

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

        {active && (
          <Card>
            <CardContent className="p-4 text-center space-y-1">
              <EditableText elementKey="iftimer.elapsed" defaultText="Elapsed" tag="p" className="text-xs text-muted-foreground" />
              <p className="text-lg font-bold font-mono">{formatTime(elapsed)}</p>
              <p className="text-xs text-muted-foreground">
                Started {format(new Date(active.startTime), 'HH:mm, dd MMM')}
              </p>
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

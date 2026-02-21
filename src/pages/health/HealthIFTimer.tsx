import { useState, useEffect } from 'react';
import { Timer, Play, Square, Trash2, Settings2, Clock, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SubPageLayout from '@/components/SubPageLayout';
import { getActiveIF, getIFSessions, startIF, stopIF, deleteIF } from '@/lib/health-storage';
import { format } from 'date-fns';
import EditableText from '@/components/cms/EditableText';
import FastingStageCard, { StagesTimeline } from '@/components/health/FastingStageCard';
import { getCurrentStage } from '@/lib/fasting-stages';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/steps', label: 'Steps' },
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

const CUSTOM_DURATIONS = [12, 14, 16, 18, 20, 24];

const HealthIFTimer = () => {
  const [active, setActive] = useState(getActiveIF);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [now, setNow] = useState(Date.now());
  const [sessions, setSessions] = useState(getIFSessions);
  const [showCustom, setShowCustom] = useState(false);
  const [customTab, setCustomTab] = useState<'duration' | 'endtime'>('duration');
  const [customDurationHours, setCustomDurationHours] = useState(16);
  const [customEndTime, setCustomEndTime] = useState('19:00');

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [active]);

  const handleStart = () => {
    startIF(selectedMode.label, selectedMode.hours);
    setActive(getActiveIF());
  };

  const handleCustomDurationStart = () => {
    startIF(`Custom ${customDurationHours}h`, customDurationHours);
    setActive(getActiveIF());
    setShowCustom(false);
  };

  const handleCustomEndTimeStart = () => {
    const [h, m] = customEndTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(h, m, 0, 0);
    if (endDate.getTime() <= Date.now()) {
      endDate.setDate(endDate.getDate() + 1);
    }
    const durationHours = (endDate.getTime() - Date.now()) / 3600000;
    startIF(`Until ${customEndTime}`, Math.round(durationHours * 10) / 10);
    setActive(getActiveIF());
    setShowCustom(false);
  };

  const handleStop = (completed: boolean) => {
    stopIF(completed);
    setActive(null);
    setSessions(getIFSessions());
  };

  const handleDeleteFast = () => {
    deleteIF();
    setActive(null);
  };

  let elapsed = 0;
  let total = 0;
  let remaining = 0;
  let progress = 0;
  let elapsedHours = 0;

  if (active) {
    const start = new Date(active.startTime).getTime();
    elapsed = Math.max(0, now - start);
    elapsedHours = elapsed / 3600000;
    total = active.fastingHours * 3600 * 1000;
    remaining = Math.max(0, total - elapsed);
    progress = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0;
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

  const currentStage = active ? getCurrentStage(elapsedHours) : null;

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
                  onClick={() => { setSelectedMode(m); setShowCustom(false); }}
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

        {/* Custom Fasting — Duration or End Time */}
        {!active && showCustom && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Custom Fast</span>
                </div>

                {/* Tab toggle */}
                <div className="flex rounded-lg bg-secondary p-0.5">
                  <button
                    onClick={() => setCustomTab('duration')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-colors ${
                      customTab === 'duration' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    <Target className="h-3.5 w-3.5" /> Set Duration
                  </button>
                  <button
                    onClick={() => setCustomTab('endtime')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-colors ${
                      customTab === 'endtime' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" /> Set End Time
                  </button>
                </div>

                {customTab === 'duration' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">How long do you want to fast?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {CUSTOM_DURATIONS.map(h => (
                        <button
                          key={h}
                          onClick={() => setCustomDurationHours(h)}
                          className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            customDurationHours === h
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Or enter:</span>
                      <Input
                        type="number"
                        min={1}
                        max={168}
                        value={customDurationHours}
                        onChange={e => setCustomDurationHours(Number(e.target.value))}
                        className="w-20 h-8 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">hours</span>
                    </div>
                  </div>
                )}

                {customTab === 'endtime' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">When do you plan to break your fast?</p>
                    <Input
                      type="time"
                      value={customEndTime}
                      onChange={e => setCustomEndTime(e.target.value)}
                      className="h-10 text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      If the time is earlier than now, it will be set for tomorrow.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setShowCustom(false)}>
                Cancel
              </Button>
              <Button
                onClick={customTab === 'duration' ? handleCustomDurationStart : handleCustomEndTimeStart}
                className="gap-2"
              >
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
                    {currentStage && (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-1">
                        Lv.{currentStage.level}
                      </span>
                    )}
                    <EditableText elementKey="iftimer.remaining" defaultText="Remaining" tag="p" className="text-xs text-muted-foreground" />
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
        )}

        {/* Action buttons */}
        {!showCustom && (
          <div className="flex justify-center gap-3">
            {!active ? (
              <Button onClick={handleStart} className="gap-2 px-8">
                <Play className="h-4 w-4" /> Start Fast
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleDeleteFast}
                  className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" /> Cancel
                </Button>
                {remaining === 0 ? (
                  <Button onClick={() => handleStop(true)} className="gap-2">
                    <Square className="h-4 w-4" /> Complete
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleStop(true)}
                    className="gap-2"
                  >
                    <Square className="h-4 w-4" /> End Fast
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Fasting Stage Card */}
        {active && !showCustom && (
          <FastingStageCard elapsedHours={elapsedHours} />
        )}

        {/* Stages Timeline */}
        {active && !showCustom && (
          <StagesTimeline elapsedHours={elapsedHours} />
        )}

        {/* Elapsed info card */}
        {active && !showCustom && (
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

        {/* History */}
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

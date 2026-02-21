import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Play, Square, Trash2, Settings2, Clock, Target, Share2, Droplets, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SubPageLayout from '@/components/SubPageLayout';
import { getActiveIF, getIFSessions, startIF, stopIF, deleteIF, addCup } from '@/lib/health-storage';
import { format } from 'date-fns';
import FastingStageCard, { StagesTimeline } from '@/components/health/FastingStageCard';
import FastingCalendarHeatmap from '@/components/health/FastingCalendarHeatmap';
import FastingTimerRing from '@/components/health/FastingTimerRing';
import FastingEducationCards from '@/components/health/FastingEducationCards';
import FastingTipsCard from '@/components/health/FastingTipsCard';
import FastingFAQCard from '@/components/health/FastingFAQCard';
import FastingChallenges from '@/components/health/FastingChallenges';
import FastingStreakCelebration, { shouldShowCelebration } from '@/components/health/FastingStreakCelebration';
import { getCurrentStage } from '@/lib/fasting-stages';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  { label: '14:10', hours: 14 },
  { label: '16:8', hours: 16 },
  { label: '18:6', hours: 18 },
  { label: '20:4', hours: 20 },
  { label: '24h', hours: 24 },
  { label: '36h', hours: 36 },
];

const CUSTOM_DURATIONS = [12, 14, 16, 18, 20, 24];

function calculateStreak(sessions: ReturnType<typeof getIFSessions>): number {
  const completedDates = new Set(
    sessions.filter(s => s.completed && s.startTime).map(s => s.startTime.slice(0, 10))
  );
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (completedDates.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (streak === 0) {
      d.setDate(d.getDate() - 1);
      if (!completedDates.has(d.toISOString().slice(0, 10))) break;
    } else break;
  }
  return streak;
}

const HealthIFTimer = () => {
  const navigate = useNavigate();
  const { loading: profileLoading, completed: profileCompleted } = useHealthProfile();
  const [active, setActive] = useState(getActiveIF);
  const [selectedMode, setSelectedMode] = useState(MODES[1]); // default 16:8
  const [now, setNow] = useState(Date.now());
  const [sessions, setSessions] = useState(getIFSessions);
  const [showCustom, setShowCustom] = useState(false);
  const [customTab, setCustomTab] = useState<'duration' | 'endtime'>('duration');
  const [customDurationHours, setCustomDurationHours] = useState(16);
  const [customEndTime, setCustomEndTime] = useState('19:00');
  const prevLevelRef = useRef<number | undefined>(undefined);
  const [showCelebration, setShowCelebration] = useState(false);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!profileLoading && !profileCompleted) {
      navigate('/health/if-onboarding', { replace: true });
    }
  }, [profileLoading, profileCompleted, navigate]);

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
    if (endDate.getTime() <= Date.now()) endDate.setDate(endDate.getDate() + 1);
    const durationHours = (endDate.getTime() - Date.now()) / 3600000;
    startIF(`Until ${customEndTime}`, Math.round(durationHours * 10) / 10);
    setActive(getActiveIF());
    setShowCustom(false);
  };

  const handleStop = (completed: boolean) => {
    stopIF(completed);
    setActive(null);
    const newSessions = getIFSessions();
    setSessions(newSessions);
    if (completed) {
      const streak = calculateStreak(newSessions);
      if (shouldShowCelebration(streak)) {
        setShowCelebration(true);
      }
    }
  };

  const handleDeleteFast = () => { deleteIF(); setActive(null); };

  const handleQuickWater = () => { addCup(); toast('Water logged!'); };

  let elapsed = 0, total = 0, remaining = 0, progress = 0, elapsedHours = 0;
  if (active) {
    const start = new Date(active.startTime).getTime();
    elapsed = Math.max(0, now - start);
    elapsedHours = elapsed / 3600000;
    total = active.fastingHours * 3600000;
    remaining = Math.max(0, total - elapsed);
    progress = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0;
  }

  const currentStage = active ? getCurrentStage(elapsedHours) : null;

  // Level-up detection
  useEffect(() => {
    if (!currentStage) return;
    const prevLevel = prevLevelRef.current;
    if (prevLevel !== undefined && currentStage.level > prevLevel) {
      toast(`Level Up! Lv.${currentStage.level} — ${currentStage.name}`);
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Fasting Level ${currentStage.level} reached`, { body: currentStage.name, icon: '/favicon.png' });
      }
    }
    prevLevelRef.current = currentStage.level;
  }, [currentStage]);

  const endTime = active ? new Date(new Date(active.startTime).getTime() + active.fastingHours * 3600000) : null;

  if (profileLoading) return null;

  return (
    <SubPageLayout title="IF Timer" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/if-timer">
      {/* Streak Celebration */}
      {showCelebration && (
        <FastingStreakCelebration
          streak={calculateStreak(sessions)}
          sessions={sessions}
          onDismiss={() => setShowCelebration(false)}
        />
      )}

      <div className="space-y-5">
        {/* ===== ACTIVE FASTING VIEW ===== */}
        {active && !showCustom && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">You're fasting!</h2>
              <div className="flex items-center gap-2">
                <button onClick={handleQuickWater} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Educational Cards */}
            {currentStage && <FastingEducationCards level={currentStage.level} />}

            {/* Timer Ring */}
            <FastingTimerRing
              elapsed={elapsed}
              remaining={remaining}
              progress={progress}
              level={currentStage?.level || 1}
              mode={active.mode}
            />

            {/* Start/End Timeline */}
            <div className="flex items-center gap-4 px-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Start</p>
                  <p className="text-xs font-semibold">{format(new Date(active.startTime), 'HH:mm, dd MMM')}</p>
                </div>
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div>
                  <p className="text-[10px] text-muted-foreground text-right">End (expected)</p>
                  <p className="text-xs font-semibold text-right">{endTime ? format(endTime, 'HH:mm, dd MMM') : '—'}</p>
                </div>
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
              </div>
            </div>

            {/* Stage Card + Timeline */}
            <FastingStageCard elapsedHours={elapsedHours} />
            <StagesTimeline elapsedHours={elapsedHours} />

            {/* Tips */}
            <FastingTipsCard />

            {/* FAQ */}
            <FastingFAQCard />

            {/* Challenges */}
            <FastingChallenges sessions={sessions} />

            {/* End Fasting */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleDeleteFast}
                className="gap-2 border-destructive text-destructive hover:bg-destructive/10 flex-1">
                <Trash2 className="h-4 w-4" /> Cancel
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="gap-2 flex-1">
                    <Square className="h-4 w-4" /> {remaining <= 0 ? 'Complete Fast' : 'End Fast'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>End your fast?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {remaining > 0
                        ? 'You still have time remaining. Are you sure you want to end early?'
                        : 'Congratulations! Your fasting goal is complete.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Going</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleStop(true)}>End Fast</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}

        {/* ===== INACTIVE VIEW ===== */}
        {!active && !showCustom && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {MODES.map(m => (
                <button key={m.label} onClick={() => { setSelectedMode(m); setShowCustom(false); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedMode.label === m.label ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}>{m.label}</button>
              ))}
              <button onClick={() => setShowCustom(true)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 bg-secondary text-secondary-foreground">
                <Settings2 className="h-3.5 w-3.5" /> Custom
              </button>
            </div>

            {/* Timer ring (inactive) */}
            <div className="flex flex-col items-center">
              <div className="relative w-52 h-52">
                <svg className="w-52 h-52 -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Timer className="h-8 w-8 text-primary mb-2" />
                  <p className="text-lg font-bold">{selectedMode.label}</p>
                  <p className="text-xs text-muted-foreground">{selectedMode.hours}h fast</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleStart} className="gap-2 px-8" size="lg">
                <Play className="h-4 w-4" /> Start Fast
              </Button>
            </div>
          </>
        )}

        {/* ===== CUSTOM VIEW ===== */}
        {!active && showCustom && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Custom Fast</span>
                </div>
                <div className="flex rounded-lg bg-secondary p-0.5">
                  <button onClick={() => setCustomTab('duration')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-colors ${
                      customTab === 'duration' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}><Target className="h-3.5 w-3.5" /> Set Duration</button>
                  <button onClick={() => setCustomTab('endtime')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-colors ${
                      customTab === 'endtime' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}><Clock className="h-3.5 w-3.5" /> Set End Time</button>
                </div>
                {customTab === 'duration' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">How long do you want to fast?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {CUSTOM_DURATIONS.map(h => (
                        <button key={h} onClick={() => setCustomDurationHours(h)}
                          className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            customDurationHours === h ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                          }`}>{h}h</button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Or enter:</span>
                      <Input type="number" min={1} max={168} value={customDurationHours}
                        onChange={e => setCustomDurationHours(Number(e.target.value))} className="w-20 h-8 text-sm" />
                      <span className="text-xs text-muted-foreground">hours</span>
                    </div>
                  </div>
                )}
                {customTab === 'endtime' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">When do you plan to break your fast?</p>
                    <Input type="time" value={customEndTime} onChange={e => setCustomEndTime(e.target.value)} className="h-10 text-sm" />
                    <p className="text-[10px] text-muted-foreground">If the time is earlier than now, it will be set for tomorrow.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setShowCustom(false)}>Cancel</Button>
              <Button onClick={customTab === 'duration' ? handleCustomDurationStart : handleCustomEndTimeStart} className="gap-2">
                <Play className="h-4 w-4" /> Start Fast
              </Button>
            </div>
          </div>
        )}

        {/* Calendar Heatmap (always visible) */}
        <FastingCalendarHeatmap sessions={sessions} />

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

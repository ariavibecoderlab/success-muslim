import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Play, Square, Trash2, Settings2, Clock, Target, Droplets, CheckCircle2, Scale, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SubPageLayout from '@/components/SubPageLayout';
import { getActiveIF, getIFSessions, startIF, stopIF, deleteIF, addCup } from '@/lib/health-storage';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
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
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
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
  const [showEndReview, setShowEndReview] = useState(false);
  const [endReviewWeight, setEndReviewWeight] = useState('');
  const [endReviewNotes, setEndReviewNotes] = useState('');
  const [endReviewSnapshot, setEndReviewSnapshot] = useState<{ elapsed: number; elapsedHours: number; mode: string; startTime: string; goalTime: string; level: number; stageName: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleOpenEndReview = () => {
    if (!active) return;
    const start = new Date(active.startTime).getTime();
    const elH = (Date.now() - start) / 3600000;
    const stage = getCurrentStage(elH);
    const end = new Date(start + active.fastingHours * 3600000);
    setEndReviewSnapshot({
      elapsed: Date.now() - start,
      elapsedHours: elH,
      mode: active.mode,
      startTime: format(new Date(active.startTime), 'HH:mm'),
      goalTime: format(end, 'HH:mm'),
      level: stage.level,
      stageName: stage.name,
    });
    setEndReviewWeight('');
    setEndReviewNotes('');
    setShowEndReview(true);
  };

  const handleSaveFast = () => {
    stopIF(true);
    setActive(null);
    const newSessions = getIFSessions();
    setSessions(newSessions);
    setShowEndReview(false);
    toast.success('Fast saved!');
    const streak = calculateStreak(newSessions);
    if (shouldShowCelebration(streak)) {
      setShowCelebration(true);
    }
  };

  const handleDiscardFast = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDiscard = () => {
    deleteIF();
    setActive(null);
    setShowEndReview(false);
    setShowDeleteConfirm(false);
    setSessions(getIFSessions());
    toast('Fast discarded');
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
        {active && !showCustom && !showEndReview && (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-black tracking-tight">You're fasting!</h2>
                <p className="text-xs text-muted-foreground">Stay strong — your body is healing</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleQuickWater} className="w-9 h-9 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>

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
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/40">
              <div className="flex items-center gap-2.5 flex-1">
                <div className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/30" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Started</p>
                  <p className="text-xs font-bold">{format(new Date(active.startTime), 'HH:mm')}</p>
                </div>
              </div>
              <div className="flex-1 flex items-center">
                <div className="w-full h-[2px] bg-gradient-to-r from-primary/40 via-primary/20 to-border rounded-full" />
              </div>
              <div className="flex items-center gap-2.5 flex-1 justify-end">
                <div>
                  <p className="text-[10px] text-muted-foreground text-right font-medium">Goal</p>
                  <p className="text-xs font-bold text-right">{endTime ? format(endTime, 'HH:mm') : '—'}</p>
                </div>
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/40" />
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
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleDeleteFast}
                className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 flex-1">
                <Trash2 className="h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleOpenEndReview} className="gap-2 flex-1 shadow-md shadow-primary/20">
                <Square className="h-4 w-4" /> {remaining <= 0 ? 'Complete Fast' : 'End Fast'}
              </Button>
            </div>
          </>
        )}

        {/* ===== INACTIVE VIEW ===== */}
        {!active && !showCustom && (
          <>
            {/* Mode selector pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {MODES.map(m => (
                <button key={m.label} onClick={() => { setSelectedMode(m); setShowCustom(false); }}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    selectedMode.label === m.label
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}>{m.label}</button>
              ))}
              <button onClick={() => setShowCustom(true)}
                className="flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <Settings2 className="h-3.5 w-3.5" /> Custom
              </button>
            </div>

            {/* Timer ring (inactive) */}
            <div className="flex flex-col items-center py-4">
              <div className="relative w-56 h-56">
                <svg className="w-56 h-56 -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(var(--secondary))" strokeWidth="5" opacity="0.5" />
                  <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(var(--primary))" strokeWidth="5" strokeDasharray="4 8" opacity="0.15" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Timer className="h-9 w-9 text-primary mb-2" />
                  </motion.div>
                  <p className="text-2xl font-black tracking-tight">{selectedMode.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedMode.hours}h fasting · {24 - selectedMode.hours}h eating</p>
                </div>
              </div>
            </div>

            {/* Start button */}
            <div className="flex justify-center">
              <Button onClick={handleStart} className="gap-2 px-10 shadow-lg shadow-primary/20" size="lg">
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

        {/* ===== END FAST REVIEW ===== */}
        {showEndReview && endReviewSnapshot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="text-center space-y-1 pt-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-black">Fasting Summary</h2>
              <p className="text-xs text-muted-foreground">Review your fast before saving</p>
            </div>

            {/* Summary Card */}
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                {/* Total Time */}
                <div className="text-center py-3 border-b border-border/50">
                  <p className="text-3xl font-black tracking-tight">
                    {Math.floor(endReviewSnapshot.elapsedHours)}h {Math.round((endReviewSnapshot.elapsedHours % 1) * 60)}m
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Fasting Time</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold">{endReviewSnapshot.mode}</p>
                    <p className="text-[10px] text-muted-foreground">Protocol</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold">Lv.{endReviewSnapshot.level}</p>
                    <p className="text-[10px] text-muted-foreground">{endReviewSnapshot.stageName}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold">{endReviewSnapshot.startTime}</p>
                    <p className="text-[10px] text-muted-foreground">Started</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold">{format(new Date(), 'HH:mm')}</p>
                    <p className="text-[10px] text-muted-foreground">Ended</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Today */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Weight Today</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">Optional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    placeholder="e.g. 72.5"
                    value={endReviewWeight}
                    onChange={e => setEndReviewWeight(e.target.value)}
                    className="h-10"
                  />
                  <span className="text-sm text-muted-foreground font-medium">kg</span>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Notes</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">Optional</span>
                </div>
                <Textarea
                  placeholder="How did you feel? Any observations..."
                  value={endReviewNotes}
                  onChange={e => setEndReviewNotes(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={handleDiscardFast}
                className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 flex-1"
              >
                <Trash2 className="h-4 w-4" /> Discard
              </Button>
              <Button onClick={handleSaveFast} className="gap-2 flex-1 shadow-md shadow-primary/20">
                <CheckCircle2 className="h-4 w-4" /> Save Fast
              </Button>
            </div>

            {/* Back link */}
            <button
              onClick={() => setShowEndReview(false)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              ← Keep fasting
            </button>
          </motion.div>
        )}

        {/* Discard Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard this fast?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this fasting session. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDiscard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Calendar Heatmap (hidden during review) */}
        {!showEndReview && <FastingCalendarHeatmap sessions={sessions} />}

        {/* History */}
        {!showEndReview && sessions.length > 0 && (
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Recent Fasts</p>
              <div className="space-y-2.5">
                {sessions.slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground text-xs">{s.startTime ? format(new Date(s.startTime), 'dd MMM · HH:mm') : '—'}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs">{s.mode}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${s.completed ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        {s.completed ? 'Completed' : 'Cancelled'}
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

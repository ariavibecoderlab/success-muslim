import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Play, Square, Trash2, Clock, Droplets, CheckCircle2, Scale, StickyNote, CalendarDays, Bell, Pencil, UtensilsCrossed, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SubPageLayout from '@/components/SubPageLayout';
import { getActiveIF, getIFSessions, startIF, stopIF, deleteIF, addCup, logPastIF, editIFSession } from '@/lib/health-storage';
import { format, subDays, startOfDay, isAfter, isBefore } from 'date-fns';
import { motion } from 'framer-motion';
import FastingStageCard, { StagesTimeline } from '@/components/health/FastingStageCard';
import FastingCalendarHeatmap from '@/components/health/FastingCalendarHeatmap';
import FastingTimerRing from '@/components/health/FastingTimerRing';
import PlanSelectorSheet, { type Plan } from '@/components/health/PlanSelectorSheet';
import StartFastingSheet from '@/components/health/StartFastingSheet';
import FastingEducationCards from '@/components/health/FastingEducationCards';
import FastingTipsCard from '@/components/health/FastingTipsCard';
import FastingFAQCard from '@/components/health/FastingFAQCard';
import FastingChallenges from '@/components/health/FastingChallenges';
import FastingStreakCelebration, { shouldShowCelebration } from '@/components/health/FastingStreakCelebration';
import { getCurrentStage } from '@/lib/fasting-stages';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/steps', label: 'Steps' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
];

const MODES: Plan[] = [
  { label: '14:10', hours: 14, eating: 10 },
  { label: '16:8', hours: 16, eating: 8 },
  { label: '18:6', hours: 18, eating: 6 },
  { label: '20:4', hours: 20, eating: 4 },
  { label: '24h', hours: 24, eating: 0 },
  { label: '36h', hours: 36, eating: 0 },
];

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
  const { profile, loading: profileLoading, completed: profileCompleted, saveProfile } = useHealthProfile();
  const [active, setActive] = useState(getActiveIF);
  const [selectedMode, setSelectedMode] = useState<Plan>(MODES[1]);
  const [now, setNow] = useState(Date.now());
  const [sessions, setSessions] = useState(getIFSessions);
  const [showPlanSheet, setShowPlanSheet] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [scheduledStart, setScheduledStart] = useState<Date | null>(null);
  const [editingScheduledStart, setEditingScheduledStart] = useState(false);
  const prevLevelRef = useRef<number | undefined>(undefined);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showEndReview, setShowEndReview] = useState(false);
  const [endReviewWeight, setEndReviewWeight] = useState('');
  const [endReviewNotes, setEndReviewNotes] = useState('');
  const [endReviewSnapshot, setEndReviewSnapshot] = useState<{ elapsed: number; elapsedHours: number; mode: string; startTime: string; goalTime: string; level: number; stageName: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [endReviewDate, setEndReviewDate] = useState<Date>(new Date());
  const [endReviewTime, setEndReviewTime] = useState(format(new Date(), 'HH:mm'));
  const [endReviewError, setEndReviewError] = useState('');

  // Edit past fast state
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editError, setEditError] = useState('');

  // Log Past Fast state
  const [showLogPast, setShowLogPast] = useState(false);
  const [pastDate, setPastDate] = useState<Date>(subDays(new Date(), 1));
  const [pastMode, setPastMode] = useState('16:8');
  const [pastHours, setPastHours] = useState('16');
  const [pastCalOpen, setPastCalOpen] = useState(false);

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

  const handleStart = (customStartTime?: Date) => {
    const startTimeStr = customStartTime ? customStartTime.toISOString() : undefined;
    startIF(selectedMode.label, selectedMode.hours, startTimeStr);
    setActive(getActiveIF());
    setScheduledStart(null);
  };

  const handleStartPickerConfirm = (startTime: Date) => {
    const now = new Date();
    if (startTime.getTime() > now.getTime() + 60000) {
      // Future start — schedule it
      setScheduledStart(startTime);
    } else {
      // Past or now — start immediately with that time
      handleStart(startTime);
    }
  };

  const handleCancelScheduled = () => {
    setScheduledStart(null);
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedMode(plan);
    saveProfile({ recommended_protocol: plan.label });
  };

  // Initialize selected mode from profile
  useEffect(() => {
    if (profile?.recommended_protocol) {
      const found = MODES.find(m => m.label === profile.recommended_protocol);
      if (found) setSelectedMode(found);
      else if (profile.recommended_protocol.startsWith('Custom')) {
        const h = parseInt(profile.recommended_protocol.replace(/\D/g, '')) || 16;
        setSelectedMode({ label: profile.recommended_protocol, hours: h, eating: Math.max(0, 24 - h) });
      }
    }
  }, [profile?.recommended_protocol]);

  // Time since last fast
  const timeSinceLastFast = useMemo(() => {
    const completed = sessions.filter(s => s.completed && s.endTime);
    if (completed.length === 0) return 0;
    const lastEnd = new Date(completed[0].endTime!).getTime();
    return Math.max(0, now - lastEnd);
  }, [sessions, now]);

  // Tick for inactive/scheduled view too
  useEffect(() => {
    if (active && !scheduledStart) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [active, scheduledStart]);

  // Auto-start scheduled fast when time arrives
  useEffect(() => {
    if (!scheduledStart || active) return;
    if (now >= scheduledStart.getTime()) {
      handleStart(scheduledStart);
    }
  }, [now, scheduledStart, active]);

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
    const now = new Date();
    setEndReviewDate(now);
    setEndReviewTime(format(now, 'HH:mm'));
    setEndReviewError('');
    setEndReviewWeight('');
    setEndReviewNotes('');
    setShowEndReview(true);
  };

  // Compute end review duration based on editable date/time
  const getEndReviewEndTime = (): Date | null => {
    if (!active) return null;
    const [h, m] = endReviewTime.split(':').map(Number);
    const d = new Date(endReviewDate);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const endReviewDuration = (() => {
    if (!active) return null;
    const endDt = getEndReviewEndTime();
    if (!endDt) return null;
    const startMs = new Date(active.startTime).getTime();
    const endMs = endDt.getTime();
    const diffSec = (endMs - startMs) / 1000;
    if (diffSec <= 0) return null;
    const hours = Math.floor(diffSec / 3600);
    const mins = Math.round((diffSec % 3600) / 60);
    return { hours, mins, totalSec: diffSec };
  })();

  const validateEndReview = (): string => {
    if (!active) return 'No active fast';
    const endDt = getEndReviewEndTime();
    if (!endDt) return 'Invalid end time';
    const startMs = new Date(active.startTime).getTime();
    const endMs = endDt.getTime();
    if (endMs <= startMs) return 'End time cannot be before start time';
    if (endMs > Date.now() + 60000) return 'End time cannot be in the future';
    if ((endMs - startMs) < 60000) return 'Fast must be at least 1 minute';
    return '';
  };

  const handleSaveFast = () => {
    const error = validateEndReview();
    if (error) { setEndReviewError(error); return; }
    const endDt = getEndReviewEndTime();
    stopIF(true, endDt?.toISOString());
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

  const handleLogPastFast = () => {
    const hours = parseFloat(pastHours);
    if (!hours || hours <= 0) return;
    const dateStr = format(pastDate, 'yyyy-MM-dd');
    logPastIF(dateStr, pastMode, hours);
    setSessions(getIFSessions());
    setShowLogPast(false);
    toast.success(`Past fast logged for ${format(pastDate, 'd MMM yyyy')}`);
  };

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

  const today = startOfDay(new Date());
  const minPastDate = subDays(today, 90);

  if (profileLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

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
        {active && !showEndReview && (
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
              planLabel={active.mode}
              isActive={true}
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
        {!active && (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-xl font-black tracking-tight">
                {scheduledStart ? 'Fast scheduled!' : 'Get ready to fast!'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {scheduledStart ? 'Your fast will begin automatically' : 'Choose your plan and start when you\'re ready'}
              </p>
            </motion.div>

            {/* Content cards - horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              <button
                onClick={() => navigate('/health/hydration')}
                className="flex-shrink-0 w-40 rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-2">
                  <UtensilsCrossed className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-xs font-bold leading-tight">Did you eat something?</p>
                <div className="mt-2 w-7 h-7 rounded-full bg-foreground/80 flex items-center justify-center">
                  <span className="text-background text-sm font-bold">+</span>
                </div>
              </button>

              <div className="flex-shrink-0 w-40 rounded-2xl p-3.5 text-left bg-secondary/40 border border-border/30">
                <p className="text-xs font-bold leading-tight mb-1">Sunnah tips to manage hunger</p>
                <p className="text-[10px] text-muted-foreground leading-tight">The Prophet ﷺ advised eating dates and drinking water</p>
              </div>

              <div className="flex-shrink-0 w-40 rounded-2xl p-3.5 text-left bg-secondary/40 border border-border/30">
                <p className="text-xs font-bold leading-tight mb-1">Why Muslims fast</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Beyond weight loss — spiritual purification & taqwa</p>
              </div>

              <div className="flex-shrink-0 w-40 rounded-2xl p-3.5 text-left bg-secondary/40 border border-border/30">
                <p className="text-xs font-bold leading-tight mb-1">Dua when breaking fast</p>
                <p className="text-[10px] text-muted-foreground leading-tight">ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ</p>
              </div>
            </div>

            {/* Timer Ring */}
            <div className="flex flex-col items-center py-2">
              <div className="relative w-60 h-60">
                {/* Glow */}
                <motion.div
                  className="absolute inset-2 rounded-full"
                  animate={{
                    boxShadow: scheduledStart
                      ? [
                          '0 0 20px 4px hsla(210, 70%, 55%, 0.15)',
                          '0 0 35px 8px hsla(210, 70%, 55%, 0.2)',
                          '0 0 20px 4px hsla(210, 70%, 55%, 0.15)',
                        ]
                      : [
                          '0 0 20px 4px hsla(45, 90%, 65%, 0.15)',
                          '0 0 35px 8px hsla(45, 90%, 65%, 0.2)',
                          '0 0 20px 4px hsla(45, 90%, 65%, 0.15)',
                        ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <svg className="w-60 h-60 -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(var(--secondary))" strokeWidth="5" opacity="0.5" />
                  {scheduledStart ? (
                    <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(210 70% 55%)" strokeWidth="5" strokeDasharray="6 10" opacity="0.5" />
                  ) : (
                    <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(45 90% 65%)" strokeWidth="5" strokeDasharray="6 10" opacity="0.4" />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Plan label with pencil */}
                  <button
                    onClick={() => setShowPlanSheet(true)}
                    className="flex items-center gap-1.5 mb-1 px-3 py-1 rounded-full hover:bg-secondary transition-colors"
                  >
                    <span className="text-sm font-bold">{selectedMode.label}</span>
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                  </button>

                  {scheduledStart ? (
                    <>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                        Remaining
                      </p>
                      <p className="text-[28px] font-bold font-mono tracking-tight leading-tight">
                        {(() => {
                          const diff = Math.max(0, scheduledStart.getTime() - now);
                          const sec = Math.floor(diff / 1000);
                          const h = Math.floor(sec / 3600);
                          const m = Math.floor((sec % 3600) / 60);
                          const s = sec % 60;
                          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                        })()}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">Your fasting starts at</p>
                      <p className="text-sm font-bold">{format(scheduledStart, 'HH:mm')}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                        Time since last fast
                      </p>
                      <p className="text-[28px] font-bold font-mono tracking-tight leading-tight">
                        {(() => {
                          const sec = Math.floor(timeSinceLastFast / 1000);
                          const h = Math.floor(sec / 3600);
                          const m = Math.floor((sec % 3600) / 60);
                          const s = sec % 60;
                          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                        })()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {scheduledStart ? (
              <>
                {/* Start info row */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-muted-foreground">Start</span>
                  </div>
                  <button
                    onClick={() => { setEditingScheduledStart(true); setShowStartPicker(true); }}
                    className="flex items-center gap-1.5 text-sm font-bold text-primary"
                  >
                    {format(scheduledStart, "'Today' HH:mm")}
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>

                {/* End Plan button */}
                <Button
                  onClick={handleCancelScheduled}
                  className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-14 text-base font-bold shadow-lg"
                  size="lg"
                >
                  End Plan
                </Button>
              </>
            ) : (
              <>
                {/* Action buttons */}
                <div className="flex flex-col items-center gap-3">
                  <Button
                    onClick={() => setShowStartPicker(true)}
                    className="gap-2 px-10 shadow-lg shadow-primary/20 bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="lg"
                  >
                    <Play className="h-4 w-4" /> Start Fasting
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400"
                    onClick={() => toast('Reminder feature coming soon!')}
                  >
                    <Bell className="h-3.5 w-3.5" /> Remind me later
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5" onClick={() => setShowLogPast(true)}>
                    <CalendarDays className="h-3.5 w-3.5" /> Log a past fast
                  </Button>
                </div>
              </>
            )}

            {/* Plan Selector Sheet */}
            <PlanSelectorSheet
              open={showPlanSheet}
              onOpenChange={setShowPlanSheet}
              onSelect={handlePlanSelect}
              currentLabel={selectedMode.label}
            />

            {/* Start Fasting Picker */}
            <StartFastingSheet
              open={showStartPicker}
              onOpenChange={setShowStartPicker}
              onConfirm={handleStartPickerConfirm}
              initialDate={editingScheduledStart ? scheduledStart ?? undefined : undefined}
            />
          </>
        )}

        {/* ===== LOG PAST FAST DIALOG ===== */}
        <Dialog open={showLogPast} onOpenChange={setShowLogPast}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Log Past Fast
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              {/* Date */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Date</label>
                <Popover open={pastCalOpen} onOpenChange={setPastCalOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left text-sm font-normal gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {format(pastDate, 'EEE, d MMM yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={pastDate}
                      onSelect={(d) => { if (d) { setPastDate(d); setPastCalOpen(false); } }}
                      disabled={(date) =>
                        isAfter(startOfDay(date), subDays(today, 1)) || isBefore(startOfDay(date), minPastDate)
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Protocol */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Protocol</label>
                <Select value={pastMode} onValueChange={setPastMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODES.map(m => (
                      <SelectItem key={m.label} value={m.label}>{m.label} ({m.hours}h fast)</SelectItem>
                    ))}
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Duration (hours)</label>
                <Input
                  type="number"
                  min={1}
                  max={72}
                  value={pastHours}
                  onChange={e => setPastHours(e.target.value)}
                  className="text-sm"
                />
              </div>

              <Button onClick={handleLogPastFast} className="w-full" disabled={!pastHours || parseFloat(pastHours) <= 0}>
                Save Past Fast
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
                <div className="text-center py-3 border-b border-border/50">
                  <p className="text-3xl font-black tracking-tight">
                    {endReviewDuration ? `${endReviewDuration.hours}h ${endReviewDuration.mins}m` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Fasting Time</p>
                </div>

                {/* Editable End Date/Time */}
                <div className="space-y-3 pt-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date & Time</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Date</label>
                      <Input
                        type="date"
                        value={format(endReviewDate, 'yyyy-MM-dd')}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        onChange={e => {
                          const d = new Date(e.target.value + 'T12:00:00');
                          if (!isNaN(d.getTime())) { setEndReviewDate(d); setEndReviewError(''); }
                        }}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Time</label>
                      <Input
                        type="time"
                        value={endReviewTime}
                        onChange={e => { setEndReviewTime(e.target.value); setEndReviewError(''); }}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  {endReviewError && (
                    <p className="text-xs text-destructive font-medium">{endReviewError}</p>
                  )}
                </div>

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
                    <p className="text-sm font-bold">{endReviewTime}</p>
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
                {sessions.slice(0, 5).map((s, i) => {
                  const dur = s.startTime && s.endTime
                    ? (() => {
                        const sec = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000;
                        return `${Math.floor(sec / 3600)}h ${Math.round((sec % 3600) / 60)}m`;
                      })()
                    : null;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (!s.endTime) return;
                        setEditIndex(i);
                        setEditStartDate(format(new Date(s.startTime), 'yyyy-MM-dd'));
                        setEditStartTime(format(new Date(s.startTime), 'HH:mm'));
                        setEditEndDate(format(new Date(s.endTime), 'yyyy-MM-dd'));
                        setEditEndTime(format(new Date(s.endTime), 'HH:mm'));
                        setEditError('');
                      }}
                      className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0 w-full text-left hover:bg-secondary/30 rounded px-1 -mx-1 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">{s.startTime ? format(new Date(s.startTime), 'dd MMM · HH:mm') : '—'}</span>
                        {dur && <span className="text-[10px] text-muted-foreground">{dur}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">{s.mode}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${s.completed ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                          {s.completed ? 'Completed' : 'Cancelled'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Past Fast Dialog */}
        <Dialog open={editIndex !== null} onOpenChange={(open) => { if (!open) setEditIndex(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Edit Fast
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              {editIndex !== null && sessions[editIndex] && (
                <>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold">{sessions[editIndex].mode}</p>
                    <p className="text-[10px] text-muted-foreground">Protocol</p>
                  </div>

                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Start</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="date" value={editStartDate}
                        onChange={e => { setEditStartDate(e.target.value); setEditError(''); }}
                        className="h-9 text-sm" />
                      <Input type="time" value={editStartTime}
                        onChange={e => { setEditStartTime(e.target.value); setEditError(''); }}
                        className="h-9 text-sm" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">End</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="date" value={editEndDate}
                        onChange={e => { setEditEndDate(e.target.value); setEditError(''); }}
                        className="h-9 text-sm" />
                      <Input type="time" value={editEndTime}
                        onChange={e => { setEditEndTime(e.target.value); setEditError(''); }}
                        className="h-9 text-sm" />
                    </div>
                  </div>

                  {/* Duration display + real-time validation */}
                  {(() => {
                    const s = new Date(`${editStartDate}T${editStartTime}:00`).getTime();
                    const e = new Date(`${editEndDate}T${editEndTime}:00`).getTime();
                    const nowMs = Date.now();
                    const sec = (e - s) / 1000;

                    // Compute validation error
                    let validationError = '';
                    if (e <= s) validationError = 'End time must be after start time';
                    else if (e > nowMs + 60000) validationError = 'End time cannot be in the future';
                    else if (sec < 60) validationError = 'Fast must be at least 1 minute';

                    return (
                      <>
                        {!validationError && sec > 0 && (
                          <div className="text-center py-2 bg-secondary/40 rounded-lg">
                            <p className="text-lg font-black">{Math.floor(sec / 3600)}h {Math.round((sec % 3600) / 60)}m</p>
                            <p className="text-[10px] text-muted-foreground">Duration</p>
                          </div>
                        )}
                        {(validationError || editError) && (
                          <p className="text-xs text-destructive font-medium">{validationError || editError}</p>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditIndex(null)}>Cancel</Button>
              <Button
                disabled={(() => {
                  const s = new Date(`${editStartDate}T${editStartTime}:00`).getTime();
                  const e = new Date(`${editEndDate}T${editEndTime}:00`).getTime();
                  return e <= s || e > Date.now() + 60000 || (e - s) < 60000;
                })()}
                onClick={() => {
                  if (editIndex === null) return;
                  const newStart = new Date(`${editStartDate}T${editStartTime}:00`).toISOString();
                  const newEnd = new Date(`${editEndDate}T${editEndTime}:00`).toISOString();
                  const err = editIFSession(editIndex, { startTime: newStart, endTime: newEnd });
                  if (err) { setEditError(err); return; }
                  setSessions(getIFSessions());
                  setEditIndex(null);
                  toast.success('Fast updated!');
                }}
              >Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SubPageLayout>
  );
};

export default HealthIFTimer;

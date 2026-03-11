import { useState, useCallback, useRef, useEffect } from 'react';
import { RotateCcw, Check, Plus, Flame, Trash2, History, Pencil, Volume2, VolumeX, Smartphone, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { getPresets, saveDhikrCount, savePresets, type DhikrPreset } from '@/lib/dhikr-storage';
import { useDhikrDaily, useDhikrMutation, useDhikrStats } from '@/hooks/useDhikrQuery';
import SubPageLayout from '@/components/SubPageLayout';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';

const IMAN_SIBLINGS = [
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/fasting', label: 'Fasting' },
  { path: '/iman/zakat', label: 'Zakat' },
];

// Web Audio tick sound
function playTick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch {}
}

const DhikrCounter = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');

  const [presets, setPresetsState] = useState(getPresets);
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(presets[0]);
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [ripples, setRipples] = useState<number[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [newTarget, setNewTarget] = useState('33');
  const [editingTarget, setEditingTarget] = useState(false);
  const [editTargetValue, setEditTargetValue] = useState('');
  const [highlightPicker, setHighlightPicker] = useState(false);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const rippleId = useRef(0);

  // Native feature toggles
  const [hapticEnabled, setHapticEnabled] = useState(() => localStorage.getItem('dhikr_haptic') !== 'false');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('dhikr_sound') === 'true');
  const [wakeLockEnabled, setWakeLockEnabled] = useState(() => localStorage.getItem('dhikr_wakelock') !== 'false');
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const { streak, history } = useDhikrStats();
  const { data: dailyData } = useDhikrDaily(dateKey);
  const dhikrMutation = useDhikrMutation();

  // Sync local count from React Query data
  useEffect(() => {
    const session = dailyData.sessions.find(s => s.presetId === selectedPreset.id);
    setCount(session?.count || 0);
  }, [dailyData, selectedPreset.id]);

  // Wake Lock
  useEffect(() => {
    if (wakeLockEnabled && 'wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').then((lock: WakeLockSentinel) => {
        wakeLockRef.current = lock;
      }).catch(() => {});
    }
    return () => {
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [wakeLockEnabled]);

  // Keyboard shortcut: Space to tap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [count, selectedPreset, dateKey]);

  const handleDateChange = (date: Date) => setSelectedDate(date);

  const selectPreset = useCallback((preset: DhikrPreset) => setSelectedPreset(preset), []);

  const handleTap = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    setPulse(true);
    setTimeout(() => setPulse(false), 200);

    if (hapticEnabled && navigator.vibrate) navigator.vibrate(15);
    if (soundEnabled) playTick();

    saveDhikrCount(selectedPreset.id, newCount, selectedPreset.target, dateKey);
    dhikrMutation.mutate({ presetId: selectedPreset.id, count: newCount, target: selectedPreset.target, date: dateKey });

    // Celebration on target hit
    if (newCount === selectedPreset.target) {
      setCelebrateKey(k => k + 1);
      if (hapticEnabled && navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 60]);
    }

    const id = ++rippleId.current;
    setRipples(prev => [...prev, id]);
    setTimeout(() => setRipples(prev => prev.filter(r => r !== id)), 600);
  }, [count, selectedPreset, dateKey, hapticEnabled, soundEnabled]);

  const handleReset = useCallback(() => {
    setCount(0);
    saveDhikrCount(selectedPreset.id, 0, selectedPreset.target, dateKey);
    dhikrMutation.mutate({ presetId: selectedPreset.id, count: 0, target: selectedPreset.target, date: dateKey });
  }, [selectedPreset, dateKey, dhikrMutation]);

  const handleAddPreset = () => {
    if (!newName.trim()) return;
    const id = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newPreset: DhikrPreset = { id, name: newName.trim(), arabic: newArabic.trim() || newName.trim(), target: parseInt(newTarget) || 33, isCustom: true };
    const updated = [...presets, newPreset];
    savePresets(updated);
    setPresetsState(updated);
    setNewName(''); setNewArabic(''); setNewTarget('33');
    setShowAddDialog(false);
    selectPreset(newPreset);
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    savePresets(updated);
    setPresetsState(updated);
    if (selectedPreset.id === id) selectPreset(updated[0]);
  };

  const handleUpdateTarget = (newTargetVal: number) => {
    if (newTargetVal < 1) return;
    const updatedPreset = { ...selectedPreset, target: newTargetVal };
    const updated = presets.map(p => p.id === selectedPreset.id ? updatedPreset : p);
    savePresets(updated);
    setPresetsState(updated);
    setSelectedPreset(updatedPreset);
    setEditingTarget(false);
    saveDhikrCount(selectedPreset.id, count, newTargetVal, dateKey);
  };

  const toggleHaptic = (v: boolean) => { setHapticEnabled(v); localStorage.setItem('dhikr_haptic', String(v)); };
  const toggleSound = (v: boolean) => { setSoundEnabled(v); localStorage.setItem('dhikr_sound', String(v)); };
  const toggleWakeLock = (v: boolean) => { setWakeLockEnabled(v); localStorage.setItem('dhikr_wakelock', String(v)); };

  const progress = Math.min((count / selectedPreset.target) * 100, 100);
  const completed = count >= selectedPreset.target;
  const completedSessions = dailyData.sessions.filter(s => s.count >= s.target).length;

  return (
    <SubPageLayout title="Dhikr Counter" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/dhikr">
      <BackdatePrompt moduleKey="dhikr" onLogPastData={() => { const y = new Date(); y.setDate(y.getDate() - 1); handleDateChange(y); setHighlightPicker(true); }} />
      <div className="space-y-5">

        {/* Orange Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 p-4 text-white shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-1">
                <Flame className="h-3.5 w-3.5" />
                <span className="text-sm font-bold">{streak}</span>
                <span className="text-[10px] text-white/70">day streak</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BackdateDatePicker selectedDate={selectedDate} onDateChange={handleDateChange} compact highlight={highlightPicker} />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setShowHistoryDialog(true)}>
                <History className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/60 text-xs">Total {isToday ? 'today' : format(selectedDate, 'd MMM')}</p>
              <p className="text-3xl font-bold tabular-nums">{dailyData.totalCount}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Completed</p>
              <p className="text-lg font-bold">{completedSessions}<span className="text-white/50 font-normal">/{presets.length}</span></p>
            </div>
          </div>
        </motion.div>

        {/* Preset Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {presets.map(p => {
            const session = dailyData.sessions.find(s => s.presetId === p.id);
            const isDone = session && session.count >= session.target;
            return (
              <button
                key={p.id}
                onClick={() => selectPreset(p)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  selectedPreset.id === p.id
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {p.name}
                {isDone && <Check className="h-3 w-3" />}
              </button>
            );
          })}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <button className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors border border-dashed border-border">
                <Plus className="h-3 w-3 inline mr-1" />Custom
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Add Custom Dhikr</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Name (e.g. Salawat)" value={newName} onChange={e => setNewName(e.target.value)} />
                <Input placeholder="Arabic text (optional)" value={newArabic} onChange={e => setNewArabic(e.target.value)} dir="rtl" className="font-arabic text-lg" />
                <Input type="number" placeholder="Target count" value={newTarget} onChange={e => setNewTarget(e.target.value)} />
                <Button onClick={handleAddPreset} className="w-full" disabled={!newName.trim()}>Add Dhikr</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Arabic + Counter Zone */}
        <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
          <CardContent className="p-5 flex flex-col items-center">
            {/* Arabic Display */}
            <div className="text-center mb-4">
              <p className="text-3xl font-arabic leading-relaxed" dir="rtl">{selectedPreset.arabic}</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{selectedPreset.name}</p>
                {selectedPreset.isCustom && (
                  <button onClick={() => handleDeletePreset(selectedPreset.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Giant Tap Counter Circle */}
            <div className="relative">
              <AnimatePresence>
                {celebrateKey > 0 && (
                  <motion.div
                    key={celebrateKey}
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 rounded-full bg-orange-400/20 z-0"
                  />
                )}
              </AnimatePresence>
              <motion.button
                onClick={handleTap}
                animate={pulse ? { scale: [1, 1.03, 1] } : {}}
                transition={{ duration: 0.15 }}
                className="relative w-52 h-52 rounded-full flex flex-col items-center justify-center select-none touch-manipulation z-10"
                style={{
                  background: `conic-gradient(rgb(234,88,12) ${progress * 3.6}deg, rgba(234,88,12,0.12) ${progress * 3.6}deg)`,
                }}
              >
                {ripples.map(id => (
                  <motion.div
                    key={id}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-full border-2 border-orange-400/30"
                  />
                ))}
                <div className={`absolute inset-2 rounded-full flex flex-col items-center justify-center transition-colors duration-300 ${
                  completed ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-background'
                }`}>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={count}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 10, opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className={`text-5xl font-bold tabular-nums ${completed ? 'text-orange-600' : ''}`}
                    >
                      {count}
                    </motion.span>
                  </AnimatePresence>
                  <Popover open={editingTarget} onOpenChange={(open) => {
                    setEditingTarget(open);
                    if (open) setEditTargetValue(String(selectedPreset.target));
                  }}>
                    <PopoverTrigger asChild>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingTarget(true); setEditTargetValue(String(selectedPreset.target)); }}
                        className="text-xs text-muted-foreground mt-0.5 hover:text-orange-600 transition-colors flex items-center gap-0.5"
                      >
                        / {selectedPreset.target} <Pencil className="h-2.5 w-2.5 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" onClick={(e) => e.stopPropagation()}>
                      <p className="text-xs font-medium mb-2">Set target count</p>
                      <div className="flex gap-2">
                        <Input type="number" min={1} value={editTargetValue} onChange={(e) => setEditTargetValue(e.target.value)} className="h-8 text-sm" autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateTarget(parseInt(editTargetValue) || 33); }}
                        />
                        <Button size="sm" className="h-8 px-3" onClick={() => handleUpdateTarget(parseInt(editTargetValue) || 33)}>
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {[33, 99, 100, 500, 1000].map(n => (
                          <button key={n} onClick={() => handleUpdateTarget(n)} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">{n}</button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {completed && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1">
                      <Check className="h-6 w-6 text-orange-600" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-xs h-7">
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
              <div className="h-4 w-px bg-border" />
              <button onClick={() => toggleHaptic(!hapticEnabled)} className={`p-1.5 rounded-md transition-colors ${hapticEnabled ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' : 'text-muted-foreground'}`} title="Haptic feedback">
                <Smartphone className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => toggleSound(!soundEnabled)} className={`p-1.5 rounded-md transition-colors ${soundEnabled ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' : 'text-muted-foreground'}`} title="Tick sound">
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => toggleWakeLock(!wakeLockEnabled)} className={`p-1.5 rounded-md transition-colors ${wakeLockEnabled ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' : 'text-muted-foreground'}`} title="Keep screen on">
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Tap circle or press Space to count</p>
          </CardContent>
        </Card>

        {/* Session Progress */}
        {dailyData.sessions.some(s => s.count > 0) && (
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">{isToday ? "Today's Progress" : format(selectedDate, 'd MMM yyyy')}</h3>
              <div className="space-y-2.5">
                {dailyData.sessions.filter(s => s.count > 0).map(s => {
                  const preset = presets.find(p => p.id === s.presetId);
                  const pct = Math.min(100, (s.count / s.target) * 100);
                  const done = s.count >= s.target;
                  return (
                    <div key={s.presetId} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{preset?.name || s.presetId}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {s.count}/{s.target}
                          {done && <Check className="h-3 w-3 text-orange-600" />}
                        </span>
                      </div>
                      <div className="h-1.5 bg-orange-100 dark:bg-orange-950/20 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${done ? 'bg-orange-600' : 'bg-orange-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {dailyData.totalCount > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total</span>
                  <span className="font-bold text-foreground text-base">{dailyData.totalCount}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 7-Day History */}
        {history.some(h => h.total > 0) && (
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">7-Day History</h3>
              <div className="flex items-end gap-1 h-16">
                {history.map((h, i) => {
                  const max = Math.max(...history.map(x => x.total), 1);
                  const height = (h.total / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-sm bg-orange-100 dark:bg-orange-950/20 relative" style={{ height: `${Math.max(height, 4)}%` }}>
                        {h.total > 0 && (
                          <div className="absolute bottom-0 w-full rounded-t-sm bg-orange-500 transition-all" style={{ height: '100%' }} />
                        )}
                      </div>
                      <span className="text-[8px] text-muted-foreground">{h.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Session History</DialogTitle></DialogHeader>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-sm font-medium">{h.date}</p>
                    <p className="text-[10px] text-muted-foreground">{h.sessions} sessions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{h.total}</p>
                    <p className="text-[10px] text-muted-foreground">counts</p>
                  </div>
                </div>
              ))}
              {history.every(h => h.total === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No history yet</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SubPageLayout>
  );
};

export default DhikrCounter;

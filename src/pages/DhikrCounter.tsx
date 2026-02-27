import { useState, useCallback, useRef } from 'react';
import { RotateCcw, Check, Plus, Flame, Trash2, X, History, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { getPresets, getDailyDhikr, saveDhikrCount, savePresets, type DhikrPreset } from '@/lib/dhikr-storage';
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

const DhikrCounter = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');

  const [presets, setPresetsState] = useState(getPresets);
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(presets[0]);
  const [count, setCount] = useState(() => {
    const daily = getDailyDhikr(dateKey);
    const session = daily.sessions.find(s => s.presetId === presets[0].id);
    return session?.count || 0;
  });
  const [pulse, setPulse] = useState(false);
  const [ripples, setRipples] = useState<number[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newArabic, setNewArabic] = useState('');
  const [newTarget, setNewTarget] = useState('33');
  const [editingTarget, setEditingTarget] = useState(false);
  const [editTargetValue, setEditTargetValue] = useState('');
  const rippleId = useRef(0);

  const { streak, history } = useDhikrStats();
  const { data: dailyData } = useDhikrDaily(dateKey);
  const dhikrMutation = useDhikrMutation();

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const key = format(date, 'yyyy-MM-dd');
    const daily = getDailyDhikr(key);
    const session = daily.sessions.find(s => s.presetId === selectedPreset.id);
    setCount(session?.count || 0);
  };

  const selectPreset = useCallback((preset: DhikrPreset) => {
    setSelectedPreset(preset);
    const daily = getDailyDhikr(dateKey);
    const session = daily.sessions.find(s => s.presetId === preset.id);
    setCount(session?.count || 0);
  }, [dateKey]);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const handleTap = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    setPulse(true);
    triggerHaptic();
    setTimeout(() => setPulse(false), 200);
    saveDhikrCount(selectedPreset.id, newCount, selectedPreset.target, dateKey);
    dhikrMutation.mutate({ presetId: selectedPreset.id, count: newCount, target: selectedPreset.target, date: dateKey });
    
    const id = ++rippleId.current;
    setRipples(prev => [...prev, id]);
    setTimeout(() => setRipples(prev => prev.filter(r => r !== id)), 600);
  }, [count, selectedPreset, dateKey]);

  const handleReset = useCallback(() => {
    setCount(0);
    saveDhikrCount(selectedPreset.id, 0, selectedPreset.target, dateKey);
    dhikrMutation.mutate({ presetId: selectedPreset.id, count: 0, target: selectedPreset.target, date: dateKey });
  }, [selectedPreset, dateKey, dhikrMutation]);

  const handleAddPreset = () => {
    if (!newName.trim()) return;
    const id = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newPreset: DhikrPreset = {
      id,
      name: newName.trim(),
      arabic: newArabic.trim() || newName.trim(),
      target: parseInt(newTarget) || 33,
      isCustom: true,
    };
    const updated = [...presets, newPreset];
    savePresets(updated);
    setPresetsState(updated);
    setNewName('');
    setNewArabic('');
    setNewTarget('33');
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

  const progress = Math.min((count / selectedPreset.target) * 100, 100);
  const completed = count >= selectedPreset.target;
  const daily = getDailyDhikr(dateKey);
  const completedSessions = daily.sessions.filter(s => s.count >= s.target).length;

  return (
    <SubPageLayout title="Dhikr Counter" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/dhikr">
      <BackdatePrompt moduleKey="dhikr" onLogPastData={() => {}} />
      <div className="space-y-5">

        {/* Date Picker */}
        <div className="flex justify-center">
          <BackdateDatePicker selectedDate={selectedDate} onDateChange={handleDateChange} compact />
        </div>

        {/* Streak + Stats Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1.5">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">{streak}</span>
              <span className="text-[10px] text-muted-foreground">day streak</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowHistoryDialog(true)}>
              <History className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => selectPreset(p)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedPreset.id === p.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {p.name}
            </button>
          ))}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <button className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors border border-dashed border-border">
                <Plus className="h-3 w-3 inline mr-1" />Custom
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Add Custom Dhikr</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Name (e.g. Salawat)" value={newName} onChange={e => setNewName(e.target.value)} />
                <Input placeholder="Arabic text (optional)" value={newArabic} onChange={e => setNewArabic(e.target.value)} dir="rtl" className="font-arabic text-lg" />
                <Input type="number" placeholder="Target count" value={newTarget} onChange={e => setNewTarget(e.target.value)} />
                <Button onClick={handleAddPreset} className="w-full" disabled={!newName.trim()}>Add Dhikr</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Arabic Display */}
        <div className="text-center space-y-1">
          <p className="text-3xl font-arabic leading-relaxed" dir="rtl">{selectedPreset.arabic}</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">{selectedPreset.name}</p>
            {selectedPreset.isCustom && (
              <button onClick={() => handleDeletePreset(selectedPreset.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Giant Tap Counter Circle */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleTap}
            animate={pulse ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 0.15 }}
            className="relative w-56 h-56 rounded-full flex flex-col items-center justify-center select-none touch-manipulation"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${progress * 3.6}deg, hsl(var(--secondary)) ${progress * 3.6}deg)`,
            }}
          >
            {ripples.map(id => (
              <motion.div
                key={id}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-full border-2 border-primary/30"
              />
            ))}

            <div className={`absolute inset-2 rounded-full flex flex-col items-center justify-center transition-colors duration-300 ${
              completed ? 'bg-primary/10' : 'bg-background'
            }`}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className={`text-5xl font-bold tabular-nums ${completed ? 'text-primary' : ''}`}
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
                    className="text-xs text-muted-foreground mt-0.5 hover:text-primary transition-colors flex items-center gap-0.5"
                  >
                    / {selectedPreset.target} <Pencil className="h-2.5 w-2.5 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3" onClick={(e) => e.stopPropagation()}>
                  <p className="text-xs font-medium mb-2">Set target count</p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={editTargetValue}
                      onChange={(e) => setEditTargetValue(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateTarget(parseInt(editTargetValue) || 33); }}
                    />
                    <Button size="sm" className="h-8 px-3" onClick={() => handleUpdateTarget(parseInt(editTargetValue) || 33)}>
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {[33, 99, 100, 500, 1000].map(n => (
                      <button key={n} onClick={() => handleUpdateTarget(n)} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                        {n}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {completed && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1">
                  <Check className="h-6 w-6 text-primary" />
                </motion.div>
              )}
            </div>
          </motion.button>
        </div>

        {/* Tap hint + Reset */}
        <div className="flex items-center justify-center gap-4">
          <p className="text-[10px] text-muted-foreground">Tap the circle to count</p>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-xs h-7">
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Today's Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{isToday ? "Today's Summary" : format(selectedDate, 'd MMM yyyy')}</h3>
              <span className="text-xs text-muted-foreground">{completedSessions} of {presets.length} complete</span>
            </div>
            <div className="space-y-2">
              {daily.sessions.filter(s => s.count > 0).map(s => {
                const preset = presets.find(p => p.id === s.presetId);
                const pct = Math.min(100, (s.count / s.target) * 100);
                return (
                  <div key={s.presetId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-xs">{preset?.name || s.presetId}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {s.count}/{s.target}
                        {s.count >= s.target && <Check className="h-3 w-3 text-primary" />}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1" />
                  </div>
                );
              })}
              {daily.sessions.filter(s => s.count > 0).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No dhikr recorded{isToday ? ' today' : ''}. Tap the circle to start!</p>
              )}
            </div>
            {daily.totalCount > 0 && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Total</span>
                <span className="font-bold text-foreground text-base">{daily.totalCount}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 7-Day History Mini Chart */}
        {history.some(h => h.total > 0) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">7-Day History</h3>
              <div className="flex items-end gap-1 h-16">
                {history.map((h, i) => {
                  const max = Math.max(...history.map(x => x.total), 1);
                  const height = (h.total / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-sm bg-primary/20 relative" style={{ height: `${Math.max(height, 4)}%` }}>
                        {h.total > 0 && (
                          <div
                            className="absolute bottom-0 w-full rounded-t-sm bg-primary transition-all"
                            style={{ height: '100%' }}
                          />
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
            <DialogHeader>
              <DialogTitle>Session History</DialogTitle>
            </DialogHeader>
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

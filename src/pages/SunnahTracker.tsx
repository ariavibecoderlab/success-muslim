import { useState } from 'react';
import { Flame, Settings2, Plus, Trash2, Trophy, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import {
  getSunnahItems, saveSunnahItems, toggleSunnahItem, type SunnahItem,
} from '@/lib/sunnah-storage';
import { useSunnahLog, useSunnahStats } from '@/hooks/useSunnahQuery';
import { useAuth } from '@/hooks/useAuth';
import SubPageLayout from '@/components/SubPageLayout';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';

const CATEGORY_LABELS: Record<string, string> = {
  intention: '🌙 Daily Intentions',
  'morning-routine': '🌅 Early Morning Routine',
  'morning-dhikr': '📿 Morning Dhikr',
  selawat: '🤲 Morning Selawat',
  quran: '📖 Quran & Recitations',
  'afternoon-dhikr': '🌇 Afternoon Dhikr',
  prayer: 'Sunnah Prayers',
  other: 'Other',
};

const IMAN_SIBLINGS = [
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/fasting', label: 'Fasting' },
  { path: '/iman/zakat', label: 'Zakat' },
];

const SunnahTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [items, setItems] = useState(getSunnahItems);
  const { data: dayLog } = useSunnahLog(dateKey);
  const [editing, setEditing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState<string>('other');
  const [celebrateVisible, setCelebrateVisible] = useState(false);
  const [highlightPicker, setHighlightPicker] = useState(false);
  const { streak, weekData } = useSunnahStats();

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const enabledItems = items.filter(i => i.enabled);
  const completedCount = dayLog.completed.filter(id => enabledItems.find(i => i.id === id)).length;
  const progress = enabledItems.length > 0 ? (completedCount / enabledItems.length) * 100 : 0;

  const handleToggle = (itemId: string) => {
    const updated = toggleSunnahItem(itemId, dateKey);
    queryClient.invalidateQueries({ queryKey: ['sunnah', user?.id ?? 'anon', dateKey] });
    
    const newCompleted = updated.completed.filter(id => enabledItems.find(i => i.id === id)).length;
    if (newCompleted === enabledItems.length && enabledItems.length > 0 && isToday) {
      setCelebrateVisible(true);
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      setTimeout(() => setCelebrateVisible(false), 2000);
    } else {
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  const handleEnableToggle = (itemId: string) => {
    const updated = items.map(i => i.id === itemId ? { ...i, enabled: !i.enabled } : i);
    setItems(updated);
    saveSunnahItems(updated);
  };

  const handleAddCustom = () => {
    if (!newLabel.trim()) return;
    const id = `custom-${Date.now()}`;
    const newItem: SunnahItem = {
      id,
      label: newLabel.trim(),
      category: newCategory as SunnahItem['category'],
      enabled: true,
      isCustom: true,
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveSunnahItems(updated);
    setNewLabel('');
    setShowAddDialog(false);
  };

  const handleDeleteCustom = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    saveSunnahItems(updated);
  };

  const grouped = enabledItems.reduce<Record<string, SunnahItem[]>>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <SubPageLayout
      title="Sunnah Tracker"
      backTo="/iman"
      siblingRoutes={IMAN_SIBLINGS}
      currentPath="/iman/sunnah"
      headerRight={
        <button onClick={() => setEditing(!editing)} className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings2 className="h-5 w-5" />
        </button>
      }
    >
      <BackdatePrompt moduleKey="sunnah" onLogPastData={() => { const y = new Date(); y.setDate(y.getDate() - 1); handleDateChange(y); setHighlightPicker(true); }} />
      <div className="space-y-5">

        {/* Date Picker */}
        <div className="flex justify-center">
          <BackdateDatePicker selectedDate={selectedDate} onDateChange={handleDateChange} compact highlight={highlightPicker} />
        </div>

        {/* Hero Summary with Ring */}
        <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 rounded-xl shadow-md overflow-hidden relative">
          <CardContent className="p-5">
            <AnimatePresence>
              {celebrateVisible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 backdrop-blur-sm rounded-xl"
                >
                  <div className="text-center">
                    <Trophy className="h-10 w-10 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-primary">All Done!</p>
                    <p className="text-xs text-muted-foreground">Masha'Allah, keep it up!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 2.64} ${264 - progress * 2.64}`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(progress)}%</span>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-sm font-semibold">{isToday ? "Today's Progress" : format(selectedDate, 'd MMM yyyy')}</h2>
                <p className="text-2xl font-bold">{completedCount}<span className="text-sm text-muted-foreground font-normal">/{enabledItems.length}</span></p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Flame className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium">{streak} day streak</span>
                </div>
              </div>
            </div>

            {isToday && (
              <div className="flex gap-1.5 mt-4 justify-center">
                {weekData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-medium transition-all ${
                      d.percentage >= 80 ? 'bg-primary text-primary-foreground' :
                      d.percentage >= 50 ? 'bg-primary/30 text-primary' :
                      d.percentage > 0 ? 'bg-primary/10 text-muted-foreground' :
                      'bg-secondary text-muted-foreground/50'
                    }`}>
                      {d.percentage >= 80 ? <Check className="h-3 w-3" /> : d.label.charAt(0)}
                    </div>
                    <span className="text-[8px] text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Mode */}
        <AnimatePresence>
          {editing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Configure Items</h3>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-3 w-3" /> Add Custom
                    </Button>
                  </div>
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.label}</span>
                        {item.isCustom && (
                          <button onClick={() => handleDeleteCustom(item.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <Switch checked={item.enabled} onCheckedChange={() => handleEnableToggle(item.id)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Custom Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Custom Sunnah</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="e.g. Read Surah Al-Kahf" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prayer">Sunnah Prayers</SelectItem>
                  <SelectItem value="dhikr">Dhikr & Adhkar</SelectItem>
                  <SelectItem value="quran">Quran</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddCustom} className="w-full" disabled={!newLabel.trim()}>Add Sunnah</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Checklist */}
        {!editing && Object.entries(grouped).map(([category, catItems]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {CATEGORY_LABELS[category] || category}
            </h3>
            <div className="space-y-1.5">
              {catItems.map(item => {
                const done = dayLog.completed.includes(item.id);
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all ${
                      done ? 'bg-primary/10 border border-primary/20' : 'bg-card border border-border hover:border-primary/10'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      done ? 'bg-primary border-primary scale-110' : 'border-muted-foreground/30'
                    }`}>
                      {done && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                    <span className={`text-sm transition-all ${done ? 'line-through text-muted-foreground' : ''}`}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SubPageLayout>
  );
};

export default SunnahTracker;

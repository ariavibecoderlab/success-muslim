import { useState } from 'react';
import { Flame, Settings2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import {
  getSunnahItems, saveSunnahItems, getDayLog, toggleSunnahItem, getSunnahStreak,
  type SunnahItem,
} from '@/lib/sunnah-storage';
import SubPageLayout from '@/components/SubPageLayout';

const CATEGORY_LABELS: Record<string, string> = {
  prayer: 'Sunnah Prayers',
  dhikr: 'Dhikr & Adhkar',
  quran: 'Quran',
  other: 'Other',
};

const DEEN_SIBLINGS = [
  { path: '/deen/dhikr', label: 'Dhikr' },
  { path: '/deen/sunnah', label: 'Sunnah' },
  { path: '/deen/zakat', label: 'Zakat' },
];

const SunnahTracker = () => {
  const [items, setItems] = useState(getSunnahItems);
  const [dayLog, setDayLog] = useState(() => getDayLog());
  const [editing, setEditing] = useState(false);
  const streak = getSunnahStreak();

  const enabledItems = items.filter(i => i.enabled);
  const completedCount = dayLog.completed.filter(id => enabledItems.find(i => i.id === id)).length;
  const progress = enabledItems.length > 0 ? (completedCount / enabledItems.length) * 100 : 0;

  const handleToggle = (itemId: string) => {
    const updated = toggleSunnahItem(itemId);
    setDayLog(updated);
  };

  const handleEnableToggle = (itemId: string) => {
    const updated = items.map(i => i.id === itemId ? { ...i, enabled: !i.enabled } : i);
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
      backTo="/deen"
      siblingRoutes={DEEN_SIBLINGS}
      currentPath="/deen/sunnah"
      headerRight={
        <button onClick={() => setEditing(!editing)} className="text-muted-foreground hover:text-foreground">
          <Settings2 className="h-5 w-5" />
        </button>
      }
    >
      <div className="space-y-5">
        {/* Summary */}
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">Today's Progress</h2>
                <p className="text-xs text-muted-foreground">{completedCount}/{enabledItems.length} completed</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Flame className="h-4 w-4 text-primary" />
                <span className="font-bold">{streak}</span>
                <span className="text-xs text-muted-foreground">day streak</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Edit Mode */}
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold">Configure Items</h3>
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    <Switch checked={item.enabled} onCheckedChange={() => handleEnableToggle(item.id)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

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
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      done ? 'bg-primary/10' : 'bg-card border border-border'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      done ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                    }`}>
                      {done && (
                        <motion.svg
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="w-3 h-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                        >
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      )}
                    </div>
                    <span className={`text-sm ${done ? 'line-through text-muted-foreground' : ''}`}>
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

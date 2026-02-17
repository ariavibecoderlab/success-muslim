import { useState, useCallback } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { getPresets, getDailyDhikr, saveDhikrCount, type DhikrPreset } from '@/lib/dhikr-storage';
import SubPageLayout from '@/components/SubPageLayout';
import EditableText from '@/components/cms/EditableText';

const DEEN_SIBLINGS = [
  { path: '/deen/dhikr', label: 'Dhikr' },
  { path: '/deen/sunnah', label: 'Sunnah' },
  { path: '/deen/zakat', label: 'Zakat' },
];

const DhikrCounter = () => {
  const presets = getPresets();
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(presets[0]);
  const [count, setCount] = useState(() => {
    const daily = getDailyDhikr();
    const session = daily.sessions.find(s => s.presetId === presets[0].id);
    return session?.count || 0;
  });
  const [pulse, setPulse] = useState(false);

  const selectPreset = useCallback((preset: DhikrPreset) => {
    setSelectedPreset(preset);
    const daily = getDailyDhikr();
    const session = daily.sessions.find(s => s.presetId === preset.id);
    setCount(session?.count || 0);
  }, []);

  const handleTap = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    setPulse(true);
    setTimeout(() => setPulse(false), 200);
    saveDhikrCount(selectedPreset.id, newCount, selectedPreset.target);
  }, [count, selectedPreset]);

  const handleReset = useCallback(() => {
    setCount(0);
    saveDhikrCount(selectedPreset.id, 0, selectedPreset.target);
  }, [selectedPreset]);

  const progress = Math.min((count / selectedPreset.target) * 100, 100);
  const completed = count >= selectedPreset.target;
  const daily = getDailyDhikr();

  return (
    <SubPageLayout title="Dhikr Counter" backTo="/deen" siblingRoutes={DEEN_SIBLINGS} currentPath="/deen/dhikr">
      <div className="space-y-6">
        {/* Preset Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => selectPreset(p)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedPreset.id === p.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Arabic Display */}
        <div className="text-center space-y-1">
          <p className="text-3xl font-arabic leading-relaxed" dir="rtl">{selectedPreset.arabic}</p>
          <p className="text-sm text-muted-foreground">{selectedPreset.name}</p>
        </div>

        {/* Counter Circle */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleTap}
            animate={pulse ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.2 }}
            className="relative w-48 h-48 rounded-full flex flex-col items-center justify-center select-none active:scale-95 transition-transform"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${progress * 3.6}deg, hsl(var(--secondary)) ${progress * 3.6}deg)`,
            }}
          >
            <div className="absolute inset-2 rounded-full bg-background flex flex-col items-center justify-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-4xl font-bold"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs text-muted-foreground">/ {selectedPreset.target}</span>
              {completed && <Check className="h-5 w-5 text-primary mt-1" />}
            </div>
          </motion.button>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <EditableText elementKey="dhikr.progress" defaultText="Progress" tag="span" />
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Today's Summary */}
        <Card>
          <CardContent className="p-4">
            <EditableText elementKey="dhikr.summary" defaultText="Today's Summary" tag="h3" className="text-sm font-semibold mb-3" />
            <div className="space-y-2">
              {daily.sessions.filter(s => s.count > 0).map(s => {
                const preset = presets.find(p => p.id === s.presetId);
                return (
                  <div key={s.presetId} className="flex items-center justify-between text-sm">
                    <span>{preset?.name || s.presetId}</span>
                    <span className="text-muted-foreground">
                      {s.count}/{s.target}
                      {s.count >= s.target && <Check className="inline h-3 w-3 text-primary ml-1" />}
                    </span>
                  </div>
                );
              })}
              {daily.sessions.filter(s => s.count > 0).length === 0 && (
                <EditableText elementKey="dhikr.empty" defaultText="No dhikr recorded today. Tap the circle to start!" tag="p" className="text-xs text-muted-foreground" />
              )}
            </div>
            {daily.totalCount > 0 && (
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                Total today: <span className="font-semibold text-foreground">{daily.totalCount}</span> counts
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default DhikrCounter;

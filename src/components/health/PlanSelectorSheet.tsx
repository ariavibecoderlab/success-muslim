import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Plan {
  label: string;
  hours: number;
  eating: number;
}

const PLANS: Array<{
  label: string;
  hours: number;
  eating: number;
  bolts: number;
  accentHsl: string;
  bg: string;
  watermark: string;
}> = [
  { label: '14:10', hours: 14, eating: 10, bolts: 4, accentHsl: '24 90% 55%', bg: 'bg-orange-50 dark:bg-orange-950/30', watermark: '1 DAY' },
  { label: '16:8',  hours: 16, eating: 8,  bolts: 4, accentHsl: '210 70% 55%', bg: 'bg-blue-50 dark:bg-blue-950/30', watermark: '1 DAY' },
  { label: '18:6',  hours: 18, eating: 6,  bolts: 3, accentHsl: '38 80% 55%', bg: 'bg-amber-50 dark:bg-amber-950/30', watermark: '1 DAY' },
  { label: '20:4',  hours: 20, eating: 4,  bolts: 3, accentHsl: '142 60% 45%', bg: 'bg-stone-100 dark:bg-stone-900/40', watermark: '1 DAY' },
  { label: '24h',   hours: 24, eating: 0,  bolts: 2, accentHsl: '215 15% 50%', bg: 'bg-slate-100 dark:bg-slate-800/40', watermark: '1 DAY' },
  { label: '36h',   hours: 36, eating: 0,  bolts: 2, accentHsl: '215 15% 40%', bg: 'bg-slate-200 dark:bg-slate-800/60', watermark: '1.5 DAYS' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (plan: Plan) => void;
  currentLabel: string;
}

export default function PlanSelectorSheet({ open, onOpenChange, onSelect, currentLabel }: Props) {
  const [customHours, setCustomHours] = useState(16);

  const handleSelect = (p: Plan) => {
    onSelect(p);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-lg font-black">Change your plan</DrawerTitle>
          <DrawerDescription className="text-xs">Pick a fasting protocol that fits your lifestyle</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6 space-y-3">
          {PLANS.map(p => (
            <button
              key={p.label}
              onClick={() => handleSelect({ label: p.label, hours: p.hours, eating: p.eating })}
              className={`relative w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98] overflow-hidden ${p.bg} ${
                currentLabel === p.label ? 'ring-2 ring-primary shadow-md' : ''
              }`}
            >
              {/* Watermark */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[40px] font-black opacity-[0.07] leading-none pointer-events-none select-none">
                {p.watermark}
              </span>

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-2xl font-black tracking-tight">{p.label}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: p.bolts }).map((_, i) => (
                      <Zap
                        key={i}
                        className="h-3.5 w-3.5"
                        style={{
                          color: `hsl(${p.accentHsl})`,
                          opacity: 1 - i * 0.2,
                        }}
                        fill={`hsl(${p.accentHsl})`}
                      />
                    ))}
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                    <li>• {p.hours} hours fasting</li>
                    {p.eating > 0 && <li>• {p.eating} hours eating period</li>}
                  </ul>
                </div>
              </div>
            </button>
          ))}

          {/* Custom card */}
          <div className={`relative w-full rounded-2xl p-4 text-left bg-secondary overflow-hidden ${
            currentLabel.startsWith('Custom') ? 'ring-2 ring-primary shadow-md' : ''
          }`}>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[40px] font-black opacity-[0.07] leading-none pointer-events-none select-none">
              CUSTOM
            </span>
            <div className="relative z-10 space-y-3">
              <p className="text-2xl font-black tracking-tight">Custom</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={168}
                  value={customHours}
                  onChange={e => setCustomHours(Number(e.target.value))}
                  className="w-20 h-9 text-sm"
                />
                <span className="text-sm text-muted-foreground">hours fasting</span>
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={() => handleSelect({ label: `Custom ${customHours}h`, hours: customHours, eating: Math.max(0, 24 - customHours) })}
              >
                Select Custom Plan
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

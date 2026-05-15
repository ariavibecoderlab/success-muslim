import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Droplets, Moon, BedDouble, Dumbbell, ListChecks, HandHeart, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useQuickLogPreferences } from '@/hooks/useQuickLogPreferences';
import EditableText from '@/components/cms/EditableText';
import { useTodaySalahCount } from '@/hooks/useSalahQuery';
import { useDhikrDaily } from '@/hooks/useDhikrQuery';
import { useHydration, useFastingLog } from '@/hooks/useHealthQuery';
import { todayKey } from '@/lib/health-storage';

const QUICK_LOGS: Record<string, { icon: typeof Star; label: string; to: string }> = {
  prayer: { icon: Star, label: 'Prayer', to: '/iman/prayer-times' },
  quran: { icon: BookOpen, label: 'Quran', to: '/iman/quran' },
  dhikr: { icon: HandHeart, label: 'Dhikr', to: '/iman/dhikr' },
  fast: { icon: Moon, label: 'Fast', to: '/health/fasting' },
  water: { icon: Droplets, label: 'Water', to: '/health/hydration' },
  sleep: { icon: BedDouble, label: 'Sleep', to: '/health/sleep' },
  tasks: { icon: ListChecks, label: 'Tasks', to: '/productivity/tasks' },
  habits: { icon: Dumbbell, label: 'Habits', to: '/productivity/habits' },
};

export default function QuickLogGrid() {
  const { enabledIds, allIds, toggleItem } = useQuickLogPreferences();
  const [editOpen, setEditOpen] = useState(false);

  // "Logged today" signals (only for items with a meaningful daily completion state)
  const salahCount = useTodaySalahCount();
  const { data: dhikr } = useDhikrDaily();
  const { data: hydration } = useHydration();
  const { data: fastingLog } = useFastingLog();

  const completedToday: Record<string, boolean> = {
    prayer: (salahCount?.logged ?? 0) > 0,
    dhikr: (dhikr?.totalCount ?? 0) > 0,
    water: (hydration?.cups ?? 0) > 0,
    fast: !!fastingLog?.[todayKey()],
  };

  const visibleItems = enabledIds.map(id => ({ id, ...QUICK_LOGS[id] })).filter(i => i.icon);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <EditableText elementKey="quicklog.title" defaultText="Quick Log" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" />
        <button onClick={() => setEditOpen(true)} className="flex items-center gap-1 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors">
          <Pencil className="h-3 w-3" />
          <span className="text-[10px] font-medium">Edit</span>
        </button>
      </div>
      <div className="flex items-start gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-0.5 pb-1">
        {visibleItems.map((q, i) => {
          const Icon = q.icon;
          const done = completedToday[q.id];
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="snap-center"
            >
              <Link to={q.to} className="flex flex-col items-center gap-1.5 min-w-[56px]">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ring-1 active:scale-95 transition-all ${
                    done
                      ? 'bg-emerald-50 ring-emerald-200'
                      : 'bg-muted ring-border/50'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${done ? 'text-emerald-700' : 'text-foreground/70'}`}
                  />
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    done ? 'text-emerald-700' : 'text-muted-foreground'
                  }`}
                >
                  {q.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[60vh]">
          <SheetHeader>
            <SheetTitle>Quick Log Shortcuts</SheetTitle>
            <SheetDescription>Show or hide shortcuts on your dashboard.</SheetDescription>
          </SheetHeader>
          <div className="space-y-1 mt-4">
            {allIds.map(id => {
              const item = QUICK_LOGS[id];
              const Icon = item.icon;
              return (
                <label key={id} className="flex items-center justify-between py-2.5 px-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted ring-1 ring-border/50">
                      <Icon className="h-4 w-4 text-foreground/70" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Switch checked={enabledIds.includes(id)} onCheckedChange={() => toggleItem(id)} />
                </label>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

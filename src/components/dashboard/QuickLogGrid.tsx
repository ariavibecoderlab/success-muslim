import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Droplets, Moon, BedDouble, Dumbbell, ListChecks, HandHeart, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useQuickLogPreferences } from '@/hooks/useQuickLogPreferences';
import EditableText from '@/components/cms/EditableText';

const QUICK_LOGS: Record<string, { icon: typeof Star; label: string; to: string; gradient: string }> = {
  prayer: { icon: Star, label: 'Prayer', to: '/iman/prayer-times', gradient: 'from-emerald-400/80 to-emerald-500/80' },
  quran: { icon: BookOpen, label: 'Quran', to: '/iman/quran', gradient: 'from-amber-400/80 to-amber-500/80' },
  dhikr: { icon: HandHeart, label: 'Dhikr', to: '/iman/dhikr', gradient: 'from-pink-400/80 to-rose-500/80' },
  fast: { icon: Moon, label: 'Fast', to: '/health/fasting', gradient: 'from-orange-400/80 to-orange-500/80' },
  water: { icon: Droplets, label: 'Water', to: '/health/hydration', gradient: 'from-blue-400/80 to-blue-500/80' },
  sleep: { icon: BedDouble, label: 'Sleep', to: '/health/sleep', gradient: 'from-indigo-400/80 to-indigo-500/80' },
  tasks: { icon: ListChecks, label: 'Tasks', to: '/productivity/tasks', gradient: 'from-rose-400/80 to-rose-500/80' },
  habits: { icon: Dumbbell, label: 'Habits', to: '/productivity/habits', gradient: 'from-teal-400/80 to-teal-500/80' },
};

export default function QuickLogGrid() {
  const { enabledIds, allIds, toggleItem } = useQuickLogPreferences();
  const [editOpen, setEditOpen] = useState(false);

  const visibleItems = enabledIds.map(id => ({ id, ...QUICK_LOGS[id] })).filter(i => i.icon);

  return (
    <div>
      <EditableText elementKey="quicklog.title" defaultText="Quick Log" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
      <div className="flex items-start gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-0.5 pb-1">
        {visibleItems.map((q, i) => {
          const Icon = q.icon;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="snap-center"
            >
              <Link to={q.to} className="flex flex-col items-center gap-1.5 min-w-[56px]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${q.gradient} shadow-sm active:scale-95 transition-transform`}>
                  <Icon className="h-[18px] w-[18px] text-white" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{q.label}</span>
              </Link>
            </motion.div>
          );
        })}

        {/* Edit button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          onClick={() => setEditOpen(true)}
          className="flex flex-col items-center gap-1.5 min-w-[56px] snap-center"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted active:scale-95 transition-transform">
            <Settings2 className="h-[18px] w-[18px] text-muted-foreground" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Edit</span>
        </motion.button>
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${item.gradient}`}>
                      <Icon className="h-4 w-4 text-white" />
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

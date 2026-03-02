import { Link } from 'react-router-dom';
import { Star, BookOpen, Droplets, Moon, BedDouble, Dumbbell, ListChecks, HandHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import EditableText from '@/components/cms/EditableText';
import { staggerContainer, staggerItem } from './constants';

const QUICK_LOGS = [
  { icon: Star, label: 'Prayer', to: '/iman/prayer-times', gradient: 'from-emerald-400/80 to-emerald-500/80' },
  { icon: BookOpen, label: 'Quran', to: '/iman/quran', gradient: 'from-amber-400/80 to-amber-500/80' },
  { icon: HandHeart, label: 'Dhikr', to: '/iman/dhikr', gradient: 'from-pink-400/80 to-rose-500/80' },
  { icon: Moon, label: 'Fast', to: '/health/fasting', gradient: 'from-orange-400/80 to-orange-500/80' },
  { icon: Droplets, label: 'Water', to: '/health/hydration', gradient: 'from-blue-400/80 to-blue-500/80' },
  { icon: BedDouble, label: 'Sleep', to: '/health/sleep', gradient: 'from-indigo-400/80 to-indigo-500/80' },
  { icon: ListChecks, label: 'Tasks', to: '/productivity/tasks', gradient: 'from-rose-400/80 to-rose-500/80' },
  { icon: Dumbbell, label: 'Habits', to: '/productivity/habits', gradient: 'from-teal-400/80 to-teal-500/80' },
];

export default function QuickLogGrid() {
  return (
    <div>
      <EditableText elementKey="quicklog.title" defaultText="Quick Log" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
      <motion.div className="grid grid-cols-4 gap-2" variants={staggerContainer} initial="hidden" animate="visible">
        {QUICK_LOGS.map(q => (
          <motion.div key={q.label} variants={staggerItem}>
            <Link to={q.to}>
              <Card className="hover:shadow-md active:scale-[0.98] transition-all">
                <CardContent className="p-3 flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${q.gradient}`}>
                    <q.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[11px] font-medium">{q.label}</span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Star, BookOpen, Droplets, Moon, BedDouble, Dumbbell, ListChecks, HandHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import EditableText from '@/components/cms/EditableText';
import { fadeUp } from './constants';

const QUICK_LOGS = [
  { icon: Star, label: 'Prayer', to: '/iman/prayer-times', color: 'bg-primary/10 text-primary' },
  { icon: BookOpen, label: 'Quran', to: '/iman/quran', color: 'bg-primary/10 text-primary' },
  { icon: HandHeart, label: 'Dhikr', to: '/iman/dhikr', color: 'bg-accent/20 text-accent-foreground' },
  { icon: Moon, label: 'Fast', to: '/health/fasting', color: 'bg-secondary text-secondary-foreground' },
  { icon: Droplets, label: 'Water', to: '/health/hydration', color: 'bg-blue-500/10 text-blue-600' },
  { icon: BedDouble, label: 'Sleep', to: '/health/sleep', color: 'bg-secondary text-secondary-foreground' },
  { icon: ListChecks, label: 'Tasks', to: '/productivity/tasks', color: 'bg-accent/20 text-accent-foreground' },
  { icon: Dumbbell, label: 'Habits', to: '/productivity/habits', color: 'bg-primary/10 text-primary' },
];

export default function QuickLogGrid() {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.8}>
      <EditableText elementKey="quicklog.title" defaultText="Quick Log" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
      <div className="grid grid-cols-4 gap-2">
        {QUICK_LOGS.map(q => (
          <Link key={q.label} to={q.to}>
            <Card className="hover:shadow-sm transition-shadow active:scale-[0.97]">
              <CardContent className="p-3 flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${q.color}`}>
                  <q.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-medium">{q.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

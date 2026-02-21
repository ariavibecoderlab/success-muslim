import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { IFSession } from '@/lib/health-storage';

interface Props {
  streak: number;
  sessions: IFSession[];
  onDismiss: () => void;
}

const MILESTONE_STREAKS = [1, 3, 7, 14, 21, 30];

export function shouldShowCelebration(streak: number): boolean {
  if (localStorage.getItem('if_streak_popup_disabled') === 'true') return false;
  return MILESTONE_STREAKS.includes(streak);
}

export default function FastingStreakCelebration({ streak, sessions, onDismiss }: Props) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const todayDay = today.getDay();

  // Check which days of this week had completed fasts
  const weekFasts = days.map((_, i) => {
    const diff = i - todayDay;
    const d = new Date(today);
    d.setDate(d.getDate() + diff);
    const dateStr = d.toISOString().slice(0, 10);
    return sessions.some(s => s.completed && s.startTime?.slice(0, 10) === dateStr);
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Flame className="h-16 w-16 text-primary mx-auto" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 space-y-2"
        >
          <p className="text-5xl font-black">{streak}</p>
          <p className="text-xl font-bold">Day Streak!</p>
          <p className="text-sm text-muted-foreground">Keep fasting daily to watch your streak grow!</p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 mt-8"
        >
          {days.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  weekFasts[i]
                    ? 'bg-primary text-primary-foreground'
                    : i === todayDay
                      ? 'border-2 border-primary text-primary'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {weekFasts[i] ? <Check className="h-4 w-4" /> : day[0]}
              </div>
              <span className="text-[9px] text-muted-foreground">{day}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 space-y-3 w-full max-w-xs"
        >
          <Button onClick={onDismiss} className="w-full" size="lg">
            Cheers!
          </Button>
          <p className="text-[10px] text-center text-muted-foreground">
            You can turn off streak popups in settings
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Gift, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useHijriDate } from '@/hooks/useHijriDate';
import { useTodaySalahCount } from '@/hooks/useSalahQuery';
import SalahQuickLogSheet from '@/components/SalahQuickLogSheet';
import TodayPrayerDuo from '@/components/today/TodayPrayerDuo';
import TodayFeatureRail from '@/components/today/TodayFeatureRail';
import DailyCheckinCard from '@/components/dashboard/DailyCheckinCard';
import { hapticLight } from '@/utils/native/haptics';

export default function Today() {
  const { user } = useAuth();
  const { hijriDate } = useHijriDate();
  const { logged } = useTodaySalahCount();
  const [logOpen, setLogOpen] = useState(false);

  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .split(/[\s@]/)[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-background to-background">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <Link to="/settings" className="flex items-center gap-2.5 active:opacity-70">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
            {initials}
          </div>
          <div>
            <p className="text-[15px] font-semibold leading-tight">{hijriDate}</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">Today</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button
            aria-label="Notifications"
            className="w-10 h-10 rounded-full hover:bg-secondary/60 flex items-center justify-center transition-colors"
          >
            <Bell className="h-5 w-5 text-foreground/80" />
          </button>
          <Link
            to="/iman/dakwah"
            aria-label="Daily reward"
            className="w-10 h-10 rounded-full hover:bg-secondary/60 flex items-center justify-center transition-colors"
          >
            <Gift className="h-5 w-5 text-orange-500" />
          </Link>
        </div>
      </header>

      <main className="px-5 pb-8 space-y-6">
        {/* Daily Check-in (gamification streak) */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <DailyCheckinCard />
        </motion.section>

        {/* Prayer duo */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <TodayPrayerDuo />
        </motion.section>

        {/* Track prayer card */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <button
            onClick={() => {
              hapticLight();
              setLogOpen(true);
            }}
            className="w-full text-left active:scale-[0.99] transition-transform"
          >
            <Card className="p-4 rounded-2xl border-border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" stroke="hsl(var(--border))" strokeWidth="3" fill="none" />
                    <circle
                      cx="24" cy="24" r="20"
                      stroke="hsl(var(--primary))" strokeWidth="3" fill="none"
                      strokeDasharray={`${(logged / 5) * 125.6} 125.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <CheckCircle2 className="absolute inset-0 m-auto h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base flex items-center gap-1">
                    Track your prayers <ArrowRight className="h-4 w-4" />
                  </p>
                  <p className="text-xs text-primary/80 font-medium mt-0.5">
                    {logged}/5 prayers tracked
                  </p>
                </div>
              </div>
              <Progress value={(logged / 5) * 100} className="h-1.5 mt-3" />
            </Card>
          </button>
        </motion.section>

        {/* Features rail */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <TodayFeatureRail />
        </motion.div>
      </main>

      <SalahQuickLogSheet open={logOpen} onOpenChange={setLogOpen} />
    </div>
  );
}

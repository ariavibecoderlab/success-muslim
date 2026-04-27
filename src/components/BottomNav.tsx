import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Moon02Icon,
  HeartCheckIcon,
  Coins01Icon,
  TaskDaily01Icon,
} from '@hugeicons/core-free-icons';
import SalahQuickLogSheet from './SalahQuickLogSheet';
import { useTodaySalahCount } from '@/hooks/useSalahQuery';
import { hapticMedium } from '@/utils/native/haptics';
import { cn } from '@/lib/utils';

type Tab = {
  icon: typeof Moon02Icon;
  label: string;
  path: string;
  matchPaths?: string[];
};

const tabs: Tab[] = [
  { icon: Moon02Icon, label: 'Iman', path: '/iman', matchPaths: ['/deen-journey'] },
  { icon: HeartCheckIcon, label: 'Health', path: '/health' },
  { icon: Coins01Icon, label: 'Wealth', path: '/wealth' },
  { icon: TaskDaily01Icon, label: 'Tasks', path: '/productivity' },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { logged } = useTodaySalahCount();
  const allDone = logged >= 5;

  const isActive = (tab: Tab) =>
    pathname === tab.path
    || pathname.startsWith(tab.path + '/')
    || (tab.matchPaths?.some(p => pathname === p || pathname.startsWith(p + '/')) ?? false);

  const renderTab = (tab: Tab) => {
    const active = isActive(tab);
    return (
      <Link
        key={tab.path}
        to={tab.path}
        className={cn(
          'relative flex flex-col items-center justify-center gap-1 min-h-[44px] px-2 py-2 rounded-lg transition-colors',
          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {active && (
          <motion.span
            layoutId="bottomnav-indicator"
            className="absolute -top-px left-3 right-3 h-[2px] rounded-full bg-primary"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <HugeiconsIcon
          icon={tab.icon}
          size={22}
          color="currentColor"
          strokeWidth={active ? 2 : 1.5}
        />
        <span className="text-[11px] font-medium leading-none">{tab.label}</span>
      </Link>
    );
  };

  const handleFabClick = () => {
    hapticMedium();
    setSheetOpen(true);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="grid grid-cols-5 items-end h-16 pb-[env(safe-area-inset-bottom)]">
          {renderTab(tabs[0])}
          {renderTab(tabs[1])}

          {/* Center FAB — Quick Log Salah */}
          <div className="flex items-start justify-center pt-1">
            <button
              onClick={handleFabClick}
              aria-label="Quick log Salah"
              className={cn(
                'relative -mt-7 w-14 h-14 rounded-full flex items-center justify-center',
                'shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95',
                'bg-gradient-to-br from-primary to-emerald-600',
              )}
            >
              <Check className="h-6 w-6 text-primary-foreground" strokeWidth={3} />
              {!allDone && logged > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                  {logged}
                </span>
              )}
              {allDone && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-background flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          </div>

          {renderTab(tabs[2])}
          {renderTab(tabs[3])}
        </div>
      </nav>

      <SalahQuickLogSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
};

export default BottomNav;

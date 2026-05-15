import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Moon02Icon,
  HeartCheckIcon,
  Coins01Icon,
  QuranIcon,
} from '@hugeicons/core-free-icons';
import { hapticMedium } from '@/utils/native/haptics';
import { cn } from '@/lib/utils';
import smMark from '@/assets/sm-mark.svg';

type Tab = {
  icon: typeof Moon02Icon;
  label: string;
  path: string;
  matchPaths?: string[];
};

const tabs: Tab[] = [
  { icon: Moon02Icon, label: 'Iman', path: '/iman', matchPaths: ['/deen-journey'] },
  { icon: QuranIcon, label: 'Quran', path: '/iman/quran' },
  { icon: Coins01Icon, label: 'Wealth', path: '/wealth' },
  { icon: HeartCheckIcon, label: 'Health', path: '/health' },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  const isTodayActive = pathname === '/today' || pathname.startsWith('/today/');

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

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="grid grid-cols-5 items-end h-16 pb-[env(safe-area-inset-bottom)]">
          {renderTab(tabs[0])}
          {renderTab(tabs[1])}

          {/* Center FAB — Today hub (brand mark) */}
          <div className="flex items-start justify-center pt-1">
            <Link
              to="/today"
              onClick={() => hapticMedium()}
              aria-label="Today"
              className="relative -mt-7"
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                animate={isTodayActive ? { scale: 1.06 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center bg-white ring-4 ring-background overflow-hidden',
                  isTodayActive
                    ? 'shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.55)]'
                    : 'shadow-lg shadow-primary/30',
                )}
              >
                <img src={smMark} alt="" className="w-12 h-12 object-contain" draggable={false} />
              </motion.div>
            </Link>
          </div>

          {renderTab(tabs[2])}
          {renderTab(tabs[3])}
        </div>
    </nav>
  );
};

export default BottomNav;

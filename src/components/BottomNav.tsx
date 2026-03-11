import { Link, useLocation } from 'react-router-dom';
import { Home, Moon, Heart, Wallet, ListChecks, UserCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Moon, label: 'Iman', path: '/iman' },
  { icon: Heart, label: 'Health', path: '/health' },
  { icon: Wallet, label: 'Wealth', path: '/wealth' },
  { icon: ListChecks, label: 'Tasks', path: '/productivity' },
  { icon: Users, label: 'Family', path: '/family' },
  { icon: UserCircle, label: 'Profile', path: '/settings' },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(tab => {
          const active = pathname === tab.path || pathname.startsWith(tab.path + '/');
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] px-2 py-2 rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="bottomnav-indicator"
                  className="absolute -top-px left-2 right-2 h-[2px] rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

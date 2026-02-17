import { Link, useLocation } from 'react-router-dom';
import { Home, Moon, Heart, Wallet, ListChecks, Users } from 'lucide-react';

const tabs = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Moon, label: 'Deen', path: '/deen' },
  { icon: Heart, label: 'Health', path: '/health' },
  { icon: Wallet, label: 'Wealth', path: '/wealth' },
  { icon: ListChecks, label: 'Tasks', path: '/productivity' },
  { icon: Users, label: 'Family', path: '/family' },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(tab => {
          const active = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

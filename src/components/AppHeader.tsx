import { Link } from 'react-router-dom';
import { Moon, Shield } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useHijriDate } from '@/hooks/useHijriDate';
import type { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface AppHeaderProps {
  /** Page title shown next to the logo */
  title?: string;
  /** Override the left icon (defaults to Moon) */
  icon?: LucideIcon;
  /** Extra elements on the right side */
  rightContent?: ReactNode;
  /** Show the hijri date under the brand name (only on Dashboard) */
  showHijriDate?: boolean;
  /** Show the gregorian date on desktop */
  showGregorianDate?: boolean;
}

const AppHeader = ({
  title = 'Success Muslim',
  icon: Icon = Moon,
  rightContent,
  showHijriDate = false,
  showGregorianDate = false,
}: AppHeaderProps) => {
  const { isAdmin } = useAdmin();
  const { hijriDate } = useHijriDate();
  const gregorianDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <nav className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Icon className="h-[18px] w-[18px] text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground leading-tight">
              {title}
            </span>
            {showHijriDate && (
              <span className="text-[10px] text-muted-foreground leading-tight">
                {hijriDate}
              </span>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {showGregorianDate && (
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              {gregorianDate}
            </span>
          )}
          {rightContent}
          {isAdmin && (
            <Link
              to="/admin"
              className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/15 transition-colors"
              title="Admin Panel"
            >
              <Shield className="h-4 w-4 text-primary" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;

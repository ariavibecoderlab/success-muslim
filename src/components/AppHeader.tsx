import { Link } from 'react-router-dom';
import { Shield, Bell } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { ReactNode } from 'react';
import smlogo from '@/assets/smlogo.webp';

interface AppHeaderProps {
  /** Page title shown next to the logo */
  title?: string;
  /** Extra elements on the right side */
  rightContent?: ReactNode;
  /** Custom rotating content to replace brand name */
  rotatingContent?: ReactNode;
}

const AppHeader = ({
  title = 'Success Muslim',
  rightContent,
  rotatingContent,
}: AppHeaderProps) => {
  const { isAdmin } = useAdmin();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group min-w-0">
          <img src={smlogo} alt="Success Muslim" className="w-9 h-9 rounded-xl object-contain shrink-0" />
          {rotatingContent || (
            <span className="text-base font-bold tracking-tight text-foreground leading-tight">
              {title}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          {rightContent}
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
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

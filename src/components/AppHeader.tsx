import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Settings as SettingsIcon, Bell, LogOut, Users } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';
import { ReactNode, useMemo } from 'react';
import smlogo from '@/assets/smlogo.webp';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const { user } = useAuth();
  const { signOut } = useAuthContext();
  const navigate = useNavigate();

  const initials = useMemo(() => {
    const name =
      (user?.user_metadata?.full_name as string | undefined) ||
      (user?.user_metadata?.name as string | undefined) ||
      user?.email ||
      '';
    if (!name) return 'U';
    const parts = name.trim().split(/[\s@]+/).filter(Boolean);
    return ((parts[0]?.[0] ?? 'U') + (parts[1]?.[0] ?? '')).toUpperCase();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5 group">
          <img src={smlogo} alt="Success Muslim" className="w-9 h-9 rounded-xl object-contain shrink-0" />
          <div className="min-w-0 flex-1">
            {rotatingContent || (
              <span className="text-base font-bold tracking-tight text-foreground leading-tight">
                {title}
              </span>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          {rightContent}

          {/* Family quick access */}
          <Link
            to="/family"
            aria-label="Family"
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Users className="h-4 w-4 text-muted-foreground" />
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/15 transition-colors"
              title="Admin Panel"
            >
              <Shield className="h-4 w-4 text-primary" />
            </Link>
          )}

          {/* Avatar dropdown — replaces standalone Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Account menu"
                className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors flex items-center justify-center text-[11px] font-bold text-primary tracking-tight"
              >
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="truncate">
                {(user?.user_metadata?.full_name as string | undefined) || user?.email || 'Account'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/settings')}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/settings')}>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;

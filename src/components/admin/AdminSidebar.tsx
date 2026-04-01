import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Megaphone,
  Image,
  Activity,
  LogOut,
  ArrowLeft,
  TrendingUp,
  Moon,
  Heart,
  UsersRound,
  ScrollText,
  FileText,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: TrendingUp, label: 'Engagement', path: '/admin/engagement' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Moon, label: 'Iman', path: '/admin/iman' },
  { icon: Heart, label: 'Health', path: '/admin/health' },
  { icon: UsersRound, label: 'Families', path: '/admin/families' },
  { icon: Image, label: "Da'wah", path: '/admin/dawah' },
  { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
  { icon: ScrollText, label: 'Audit Log', path: '/admin/audit' },
  { icon: Activity, label: 'System', path: '/admin/system' },
  { icon: FileText, label: 'Blog', path: '/admin/blog' },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [displayName, setDisplayName] = useState('Admin');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
      });
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header */}
      <SidebarHeader className="p-4">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            ☪
          </div>
          {!collapsed && (
            <span className="font-bold text-base bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              Admin Panel
            </span>
          )}
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link
                        to={item.path}
                        className="flex items-center gap-2.5"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to App">
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>Back to App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {!collapsed && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground">Admin</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

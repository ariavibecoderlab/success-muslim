import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAdminTimeout } from '@/hooks/useAdminTimeout';

const AdminLayout = () => {
  useAdminTimeout();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Slim top bar */}
          <header className="sticky top-0 z-40 h-12 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground">Admin</span>
          </header>

          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

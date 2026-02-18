import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface SubPageLayoutProps {
  title: string;
  backTo: string;
  children: ReactNode;
  headerRight?: ReactNode;
  siblingRoutes?: { path: string; label: string }[];
  currentPath?: string;
}

const SubPageLayout = ({ title, backTo, children, headerRight, siblingRoutes, currentPath }: SubPageLayoutProps) => {
  const navigate = useNavigate();

  const currentIndex = siblingRoutes?.findIndex((r) => r.path === currentPath) ?? -1;
  const prevRoute = currentIndex > 0 ? siblingRoutes![currentIndex - 1] : null;
  const nextRoute = currentIndex >= 0 && currentIndex < (siblingRoutes?.length ?? 0) - 1 ? siblingRoutes![currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold">{title}</span>
          {headerRight}
        </div>
      </nav>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6">
        {children}
      </main>

      <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/50">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => prevRoute && navigate(prevRoute.path)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              prevRoute ? 'text-muted-foreground hover:text-foreground' : 'text-transparent pointer-events-none'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="max-w-[80px] truncate">{prevRoute?.label || ''}</span>
          </button>

          <button
            onClick={() => navigate(backTo)}
            className="flex items-center gap-2 py-2 px-4 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={() => nextRoute && navigate(nextRoute.path)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              nextRoute ? 'text-muted-foreground hover:text-foreground' : 'text-transparent pointer-events-none'
            }`}
          >
            <span className="max-w-[80px] truncate">{nextRoute?.label || ''}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubPageLayout;

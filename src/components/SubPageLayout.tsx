import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(backTo);
    }
  };

  const currentIndex = siblingRoutes?.findIndex((r) => r.path === currentPath) ?? -1;
  const prevRoute = currentIndex > 0 ? siblingRoutes![currentIndex - 1] : null;
  const nextRoute = currentIndex >= 0 && currentIndex < (siblingRoutes?.length ?? 0) - 1 ? siblingRoutes![currentIndex + 1] : null;
  const hasSiblings = siblingRoutes && siblingRoutes.length > 1 && currentIndex >= 0;

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold">{title}</span>
          {headerRight}
        </div>
      </nav>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6">
        {children}
      </main>

      <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-center">
          {hasSiblings ? (
            <div className="flex items-center bg-secondary/50 rounded-full p-1 gap-0 shadow-sm">
              {/* Prev */}
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => prevRoute && navigate(prevRoute.path)}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs transition-colors ${
                  prevRoute
                    ? 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="max-w-[60px] truncate">{prevRoute?.label || 'Prev'}</span>
              </motion.button>

              {/* Divider */}
              <div className="w-px h-5 bg-border/50" />

              {/* Back */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="flex items-center gap-1.5 py-2 px-5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-semibold shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </motion.button>

              {/* Divider */}
              <div className="w-px h-5 bg-border/50" />

              {/* Next */}
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => nextRoute && navigate(nextRoute.path)}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs transition-colors ${
                  nextRoute
                    ? 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <span className="max-w-[60px] truncate">{nextRoute?.label || 'Next'}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex items-center gap-2 py-2 px-6 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-semibold shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </motion.button>
          )}

          {hasSiblings && (
            <span className="absolute right-4 text-[10px] text-muted-foreground/60 font-medium tabular-nums">
              {currentIndex + 1}/{siblingRoutes!.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubPageLayout;

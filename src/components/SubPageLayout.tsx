import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <nav className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md mx-auto px-2 h-12 flex items-center relative">
          {/* Back — left (iOS style) */}
          <motion.button
            whileTap={{ scale: 0.88, opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            onClick={handleBack}
            aria-label="Back"
            className="relative z-10 flex items-center gap-0.5 h-11 min-w-[44px] pl-1 pr-2 rounded-lg text-primary hover:bg-secondary/60 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
            <span className="text-[15px] font-medium leading-none">Back</span>
          </motion.button>

          {/* Title — absolute centered */}
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold tracking-tight truncate max-w-[55%] pointer-events-none">
            {title}
          </h1>

          {/* Right cluster — sibling chevrons + custom right */}
          <div className="ml-auto relative z-10 flex items-center gap-1">
            {hasSiblings && (
              <>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => prevRoute && navigate(prevRoute.path)}
                  disabled={!prevRoute}
                  aria-label={prevRoute ? `Previous: ${prevRoute.label}` : 'Previous'}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                    prevRoute
                      ? 'text-primary hover:bg-secondary/60'
                      : 'text-muted-foreground/30 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => nextRoute && navigate(nextRoute.path)}
                  disabled={!nextRoute}
                  aria-label={nextRoute ? `Next: ${nextRoute.label}` : 'Next'}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                    nextRoute
                      ? 'text-primary hover:bg-secondary/60'
                      : 'text-muted-foreground/30 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
                </motion.button>
              </>
            )}
            {headerRight}
          </div>
        </div>
      </nav>

      <motion.main
        key={currentPath ?? title}
        initial={{ x: '6%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="flex-1 max-w-md mx-auto w-full px-5 py-6"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default SubPageLayout;

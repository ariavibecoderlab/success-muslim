import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { ReactNode, useCallback } from 'react';

interface SubPageLayoutProps {
  title: string;
  backTo: string;
  children: ReactNode;
  headerRight?: ReactNode;
  siblingRoutes?: { path: string; label: string }[];
  currentPath?: string;
}

const SWIPE_THRESHOLD = 80;

const IOS_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const pageTransition = {
  initial: { opacity: 0, x: 80, scale: 0.96 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.4, ease: IOS_EASE },
  },
  exit: {
    opacity: 0,
    x: 80,
    scale: 0.96,
    transition: { duration: 0.3, ease: IOS_EASE },
  },
};

const SubPageLayout = ({ title, backTo, children, headerRight, siblingRoutes, currentPath }: SubPageLayoutProps) => {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);

  const currentIndex = siblingRoutes?.findIndex((r) => r.path === currentPath) ?? -1;
  const prevRoute = currentIndex > 0 ? siblingRoutes![currentIndex - 1] : null;
  const nextRoute = currentIndex >= 0 && currentIndex < (siblingRoutes?.length ?? 0) - 1 ? siblingRoutes![currentIndex + 1] : null;

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      if (prevRoute) navigate(prevRoute.path);
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
      if (nextRoute) navigate(nextRoute.path);
    }
  }, [navigate, prevRoute, nextRoute]);

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* iOS-style header with large title */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <motion.span
            className="text-lg font-bold"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {title}
          </motion.span>
          {headerRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {headerRight}
            </motion.div>
          )}
        </div>
      </nav>

      {/* Swipeable content with iOS-like physics */}
      <motion.main
        className="flex-1 max-w-md mx-auto w-full px-5 py-6"
        style={{ x, opacity, scale }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={handleDragEnd}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
          {children}
        </motion.div>
      </motion.main>

      {/* Bottom navigation bar */}
      <motion.div
        className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: prev page */}
          <button
            onClick={() => prevRoute && navigate(prevRoute.path)}
            className={`flex items-center gap-1 text-xs transition-all duration-200 ${
              prevRoute ? 'text-muted-foreground hover:text-foreground active:scale-95' : 'text-transparent pointer-events-none'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="max-w-[80px] truncate">{prevRoute?.label || ''}</span>
          </button>

          {/* Center: back button */}
          <button
            onClick={() => navigate(backTo)}
            className="flex items-center gap-2 py-2 px-4 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95 transition-all duration-200 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Right: next page */}
          <button
            onClick={() => nextRoute && navigate(nextRoute.path)}
            className={`flex items-center gap-1 text-xs transition-all duration-200 ${
              nextRoute ? 'text-muted-foreground hover:text-foreground active:scale-95' : 'text-transparent pointer-events-none'
            }`}
          >
            <span className="max-w-[80px] truncate">{nextRoute?.label || ''}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubPageLayout;

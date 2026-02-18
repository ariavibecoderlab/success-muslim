import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ReactNode, useCallback } from 'react';

interface SubPageLayoutProps {
  title: string;
  backTo: string;
  children: ReactNode;
  headerRight?: ReactNode;
  /** Ordered list of sibling routes for swipe navigation */
  siblingRoutes?: {path: string;label: string;}[];
  currentPath?: string;
}

const SWIPE_THRESHOLD = 80;

const SubPageLayout = ({ title, backTo, children, headerRight, siblingRoutes, currentPath }: SubPageLayoutProps) => {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const currentIndex = siblingRoutes?.findIndex((r) => r.path === currentPath) ?? -1;
  const prevRoute = currentIndex > 0 ? siblingRoutes![currentIndex - 1] : null;
  const nextRoute = currentIndex >= 0 && currentIndex < (siblingRoutes?.length ?? 0) - 1 ? siblingRoutes![currentIndex + 1] : null;

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      if (prevRoute) {
        navigate(prevRoute.path);
      }
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
      if (nextRoute) {
        navigate(nextRoute.path);
      }
    }
  }, [navigate, prevRoute, nextRoute]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header - title only, no back button */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold">{title}</span>
          {headerRight}
        </div>
      </nav>

      {/* Swipeable content */}
      <motion.main
        className="flex-1 max-w-md mx-auto w-full px-5 py-6"
        style={{ x, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}>

        {children}
      </motion.main>

      {/* Bottom navigation bar */}
      <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: prev page indicator */}
          <button
            onClick={() => prevRoute && navigate(prevRoute.path)}
            className={`flex items-center gap-1 text-xs transition-colors ${prevRoute ? 'text-muted-foreground hover:text-foreground' : 'text-transparent pointer-events-none'}`}>

            <ChevronLeft className="h-4 w-4" />
            <span className="max-w-[80px] truncate">{prevRoute?.label || ''}</span>
          </button>

          {/* Center: back button */}
          <button
            onClick={() => navigate(backTo)}
            className="gap-2 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium px-[12px] items-center justify-end flex flex-row text-center border-muted-foreground">

            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Right: next page indicator */}
          <button
            onClick={() => nextRoute && navigate(nextRoute.path)}
            className={`flex items-center gap-1 text-xs transition-colors ${nextRoute ? 'text-muted-foreground hover:text-foreground' : 'text-transparent pointer-events-none'}`}>

            <span className="max-w-[80px] truncate">{nextRoute?.label || ''}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>);

};

export default SubPageLayout;
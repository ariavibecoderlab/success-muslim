import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './BottomNav';
import { useRef } from 'react';

const TAB_ORDER = ['/dashboard', '/iman', '/health', '/wealth', '/productivity', '/settings'];

const AppLayout = () => {
  const { pathname } = useLocation();
  const prevPath = useRef(pathname);

  const currentIdx = TAB_ORDER.indexOf(pathname);
  const prevIdx = TAB_ORDER.indexOf(prevPath.current);
  const direction = currentIdx >= prevIdx ? 1 : -1;

  // Update ref after calculating direction
  if (prevPath.current !== pathname) {
    prevPath.current = pathname;
  }

  return (
    <>
      <div className="pb-20 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: direction * 60, scale: 0.97 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              transition: {
                duration: 0.35,
                ease: [0.32, 0.72, 0, 1], // iOS spring-like bezier
              },
            }}
            exit={{
              opacity: 0,
              x: direction * -40,
              scale: 0.97,
              transition: {
                duration: 0.25,
                ease: [0.32, 0.72, 0, 1],
              },
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </>
  );
};

export default AppLayout;

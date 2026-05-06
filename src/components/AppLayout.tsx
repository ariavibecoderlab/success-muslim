import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import OfflineBanner from './OfflineBanner';

const AppLayout = () => {
  return (
    <div className="max-w-md mx-auto min-h-screen mobile-100vh bg-background sm:shadow-xl sm:border-x border-border/50 safe-top">
      <OfflineBanner />
      <div className="pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;

import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const AppLayout = () => {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-background sm:shadow-xl sm:border-x border-border/50 relative">
      <div className="pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;

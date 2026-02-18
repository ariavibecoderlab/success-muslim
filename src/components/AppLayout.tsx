import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const AppLayout = () => {
  return (
    <>
      <div className="pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
};

export default AppLayout;

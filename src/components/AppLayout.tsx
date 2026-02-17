import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const AppLayout = () => (
  <>
    <div className="pb-20">
      <Outlet />
    </div>
    <BottomNav />
  </>
);

export default AppLayout;

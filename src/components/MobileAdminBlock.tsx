import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component to block admin routes in mobile apps
 * Admin panel is web-only, not available in native mobile apps
 */
const MobileAdminBlock = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect away from admin routes if running on mobile
    if (Capacitor.isNativePlatform()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // If on mobile, don't render children
  if (Capacitor.isNativePlatform()) {
    return null;
  }

  return <>{children}</>;
};

export default MobileAdminBlock;

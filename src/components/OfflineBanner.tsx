import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

/**
 * Shows a small banner at the top of the app when the device is offline.
 * Works on both web (navigator.onLine) and native (Capacitor Network plugin).
 */
const OfflineBanner = () => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let removeListener: (() => void) | undefined;

    const init = async () => {
      if (Capacitor.isNativePlatform()) {
        const status = await Network.getStatus();
        setOnline(status.connected);
        const handle = await Network.addListener('networkStatusChange', (s) => {
          setOnline(s.connected);
        });
        removeListener = () => handle.remove();
      } else {
        setOnline(navigator.onLine);
        const onOnline = () => setOnline(true);
        const onOffline = () => setOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        removeListener = () => {
          window.removeEventListener('online', onOnline);
          window.removeEventListener('offline', onOffline);
        };
      }
    };

    init();
    return () => removeListener?.();
  }, []);

  if (online) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-destructive text-destructive-foreground text-center text-xs py-1.5 font-medium">
      You are offline — changes will sync when you reconnect
    </div>
  );
};

export default OfflineBanner;
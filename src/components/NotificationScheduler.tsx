import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { usePrayerSettings } from '@/hooks/usePrayerSettings';
import { useSalahLog } from '@/hooks/useSalahQuery';
import { useAuth } from '@/hooks/useAuth';
import { fetchPrayerTimes, type PrayerTimesData } from '@/lib/prayer-times';
import { getTodayKey } from '@/lib/calculations';
import {
  useNativePrayerNotifications,
  useNotificationActionHandler,
} from '@/hooks/useNativePrayerNotifications';
import SalahQuickLogSheet from './SalahQuickLogSheet';

/**
 * App-wide notification scheduler. Mounted once inside the authenticated layout.
 * - Schedules native prayer + log-nag notifications when on iOS/Android.
 * - Listens for log-nag taps and opens the SalahQuickLogSheet.
 * - On web, this is a no-op (web notifications continue to use usePrayerNotifications
 *   on the PrayerTimes page since they require the tab to be foreground).
 */
const NotificationScheduler = () => {
  const { user } = useAuth();
  const { settings, loading } = usePrayerSettings();
  const { data: todayLog } = useSalahLog(getTodayKey());
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch prayer times whenever settings change (and only on native)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (!user || loading) return;
    fetchPrayerTimes(settings).then((d) => d && setPrayerData(d));
  }, [user, settings, loading]);

  useNativePrayerNotifications(prayerData?.timings ?? null, settings, todayLog);

  const handleLogNagTap = useCallback(
    (_prayer: string) => {
      // Bring user to a contextual place + open the quick-log sheet
      navigate('/iman/prayer-times');
      setQuickLogOpen(true);
    },
    [navigate],
  );

  useNotificationActionHandler(handleLogNagTap);

  return <SalahQuickLogSheet open={quickLogOpen} onOpenChange={setQuickLogOpen} />;
};

export default NotificationScheduler;
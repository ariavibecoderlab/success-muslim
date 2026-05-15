import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  isHealthSyncAvailable,
  getHealthProvider,
  requestHealthPermissions,
  readDailySteps,
  readWorkouts,
  type HealthProvider,
} from '@/lib/health-bridge';
import { toast } from 'sonner';

/**
 * useHealthSync — connects on-device Apple Health / Google Health Connect.
 *
 * Flow:
 *   1. `available` tells you whether this device can sync at all.
 *   2. `connect()` asks the OS for read permission.
 *   3. `sync()` reads the last N days of steps + workouts and pushes
 *      them to the api-wearables `ingest` endpoint.
 *
 * Apple Watch, Wear OS, Samsung and Fitbit devices all write into
 * HealthKit / Health Connect, so this single path covers them.
 */
export function useHealthSync() {
  const qc = useQueryClient();
  const provider: HealthProvider | null = getHealthProvider();

  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    isHealthSyncAvailable()
      .then((ok) => { if (!cancelled) setAvailable(ok); })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);

  const connect = useCallback(async (): Promise<boolean> => {
    if (!provider) {
      toast.error('Health sync is only available on the mobile app');
      return false;
    }
    const granted = await requestHealthPermissions();
    if (!granted) {
      toast.error('Health permission was not granted');
      return false;
    }
    toast.success('Health access granted');
    return true;
  }, [provider]);

  const sync = useCallback(async (daysBack = 30): Promise<boolean> => {
    if (!provider) return false;
    setSyncing(true);
    try {
      const [dailySteps, workouts] = await Promise.all([
        readDailySteps(daysBack),
        readWorkouts(daysBack),
      ]);
      const res = await api<{ stepDaysStored: number; workoutsStored: number }>(
        'api-wearables',
        {
          method: 'POST',
          params: { resource: 'ingest' },
          body: { provider, dailySteps, workouts },
        },
      );
      const stamp = new Date().toISOString();
      setLastSyncedAt(stamp);
      qc.invalidateQueries({ queryKey: ['steps'] });
      qc.invalidateQueries({ queryKey: ['wearables'] });
      toast.success(
        `Synced ${res.stepDaysStored} days · ${res.workoutsStored} workouts`,
      );
      return true;
    } catch (e) {
      console.error('[useHealthSync] sync failed', e);
      toast.error('Health sync failed');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [provider, qc]);

  /** One-shot: request permission then sync. */
  const connectAndSync = useCallback(async () => {
    const ok = await connect();
    if (ok) await sync();
  }, [connect, sync]);

  return {
    provider,
    available,
    checking,
    syncing,
    lastSyncedAt,
    connect,
    sync,
    connectAndSync,
  };
}

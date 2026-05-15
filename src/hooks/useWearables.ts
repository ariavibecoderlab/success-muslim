import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { openExternal } from '@/utils/native/browser';
import { toast } from 'sonner';

export type WearableProvider =
  | 'apple_health' | 'health_connect' | 'strava' | 'garmin' | 'fitbit';

export interface WearableConnection {
  id: string;
  user_id: string;
  provider: WearableProvider;
  status: 'connected' | 'disconnected' | 'error' | 'expired';
  scopes: string[] | null;
  external_user_id: string | null;
  enabled_metrics: string[];
  last_synced_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export const PROVIDER_LABELS: Record<WearableProvider, string> = {
  apple_health: 'Apple Health',
  health_connect: 'Google Health Connect',
  strava: 'Strava',
  garmin: 'Garmin',
  fitbit: 'Fitbit',
};

/** All wearable connections for the current user. */
export function useWearableConnections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['wearables', 'connections', user?.id ?? 'anon'],
    queryFn: () => api<WearableConnection[]>('api-wearables', {
      params: { resource: 'connections' },
    }),
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * Kick off Strava OAuth. On web the browser redirects back to the
 * configured callback route; on native the in-app browser opens and
 * the callback deep-links back. The code is exchanged server-side so
 * Strava secrets never reach the client.
 */
export function useConnectStrava() {
  return useMutation({
    mutationFn: async () => {
      const { url } = await api<{ url: string }>('api-wearables', {
        params: { resource: 'strava-authorize' },
      });
      await openExternal(url);
    },
    onError: (e) => toast.error(
      e instanceof Error && e.message.includes('not configured')
        ? 'Strava is not set up yet — add server credentials to enable it.'
        : 'Could not start Strava connection.',
    ),
  });
}

/** Exchange the OAuth `code` returned by Strava for tokens. */
export function useExchangeStravaCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api('api-wearables', {
      method: 'POST',
      params: { resource: 'strava-exchange' },
      body: { code },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wearables'] });
      qc.invalidateQueries({ queryKey: ['steps'] });
      toast.success('Strava connected');
    },
    onError: () => toast.error('Failed to connect Strava'),
  });
}

/** Pull the latest activities from a connected OAuth provider. */
export function useSyncWearable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: WearableProvider) => {
      const resourceMap: Partial<Record<WearableProvider, string>> = {
        strava: 'strava-sync',
      };
      const resource = resourceMap[provider];
      if (!resource) throw new Error(`${PROVIDER_LABELS[provider]} sync runs on-device`);
      return api('api-wearables', { method: 'POST', params: { resource } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wearables'] });
      qc.invalidateQueries({ queryKey: ['steps'] });
      toast.success('Synced');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Sync failed'),
  });
}

/** Disconnect a provider and forget its tokens. */
export function useDisconnectWearable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: WearableProvider) => api('api-wearables', {
      method: 'POST',
      params: { resource: 'disconnect' },
      body: { provider },
    }),
    onSuccess: (_d, provider) => {
      qc.invalidateQueries({ queryKey: ['wearables'] });
      toast.success(`${PROVIDER_LABELS[provider]} disconnected`);
    },
    onError: () => toast.error('Failed to disconnect'),
  });
}

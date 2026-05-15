import { motion } from 'framer-motion';
import {
  Watch, Activity, RefreshCw, Loader2, Check, AlertCircle, Plus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  useWearableConnections, useConnectStrava, useSyncWearable,
  useDisconnectWearable, PROVIDER_LABELS, type WearableProvider,
  type WearableConnection,
} from '@/hooks/useWearables';
import { useHealthSync } from '@/hooks/useHealthSync';
import { hapticLight } from '@/utils/native/haptics';

/**
 * Settings section: connect smart watches & phone health.
 *
 *  - Apple Health / Health Connect  -> on-device, covers Apple Watch,
 *    Wear OS, Samsung and Fitbit-via-Health-Connect.
 *  - Strava                         -> OAuth, pulls runs/rides/walks.
 *  - Garmin / Fitbit direct         -> scaffolded, shown as "coming soon".
 */
export default function WearableConnections() {
  const { data: connections } = useWearableConnections();
  const health = useHealthSync();
  const connectStrava = useConnectStrava();
  const syncWearable = useSyncWearable();
  const disconnect = useDisconnectWearable();

  const byProvider = (p: WearableProvider): WearableConnection | undefined =>
    connections?.find((c) => c.provider === p);

  const onDeviceProvider = health.provider; // apple_health | health_connect | null
  const onDeviceConn = onDeviceProvider ? byProvider(onDeviceProvider) : undefined;

  return (
    <motion.div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
        Watch & Health Sync
      </p>
      <div className="bg-card rounded-xl border border-border divide-y divide-border">

        {/* ── On-device: Apple Health / Health Connect ── */}
        {onDeviceProvider ? (
          <Row
            icon={<Watch className="h-4 w-4" />}
            title={PROVIDER_LABELS[onDeviceProvider]}
            subtitle={
              onDeviceConn?.last_synced_at
                ? `Synced ${formatDistanceToNow(new Date(onDeviceConn.last_synced_at), { addSuffix: true })}`
                : 'Covers Apple Watch, Wear OS, Samsung & Fitbit'
            }
            connected={!!onDeviceConn}
            busy={health.syncing}
            onConnect={() => { hapticLight(); health.connectAndSync(); }}
            onSync={() => { hapticLight(); health.sync(); }}
          />
        ) : (
          <Row
            icon={<Watch className="h-4 w-4" />}
            title="Apple Health / Health Connect"
            subtitle="Open the mobile app to link your watch & phone health"
            connected={false}
            disabled
          />
        )}

        {/* ── Strava ── */}
        <Row
          icon={<Activity className="h-4 w-4" />}
          title="Strava"
          subtitle={
            byProvider('strava')?.last_synced_at
              ? `Synced ${formatDistanceToNow(new Date(byProvider('strava')!.last_synced_at!), { addSuffix: true })}`
              : 'Pull runs, rides and walks'
          }
          connected={!!byProvider('strava')}
          error={byProvider('strava')?.status === 'expired' || byProvider('strava')?.status === 'error'}
          busy={connectStrava.isPending || (syncWearable.isPending && syncWearable.variables === 'strava')}
          onConnect={() => connectStrava.mutate()}
          onSync={() => syncWearable.mutate('strava')}
          onDisconnect={() => disconnect.mutate('strava')}
        />

        {/* ── Garmin / Fitbit — scaffolded ── */}
        <Row
          icon={<Watch className="h-4 w-4" />}
          title="Garmin"
          subtitle="Direct integration — coming soon"
          connected={false}
          disabled
        />
        <Row
          icon={<Watch className="h-4 w-4" />}
          title="Fitbit"
          subtitle="Direct integration — coming soon"
          connected={false}
          disabled
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        Steps and workouts from connected devices feed your Health dashboard
        and the AI Coach's activity analysis.
      </p>
    </motion.div>
  );
}

function Row({
  icon, title, subtitle, connected, error, busy, disabled,
  onConnect, onSync, onDisconnect,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  connected: boolean;
  error?: boolean;
  busy?: boolean;
  disabled?: boolean;
  onConnect?: () => void;
  onSync?: () => void;
  onDisconnect?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <span className={`flex-shrink-0 ${connected ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium">{title}</p>
          {connected && !error && (
            <span className="flex items-center gap-0.5 text-[9px] text-emerald-500 font-medium">
              <Check className="h-2.5 w-2.5" />Connected
            </span>
          )}
          {error && (
            <span className="flex items-center gap-0.5 text-[9px] text-amber-500 font-medium">
              <AlertCircle className="h-2.5 w-2.5" />Reconnect
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>
      </div>

      {disabled ? (
        <span className="text-[10px] text-muted-foreground/50">—</span>
      ) : connected ? (
        <div className="flex items-center gap-1">
          {onSync && (
            <button
              onClick={onSync}
              disabled={busy}
              aria-label="Sync now"
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 disabled:opacity-50"
            >
              {busy
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />}
            </button>
          )}
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="text-[11px] h-7 px-2 rounded-md text-destructive hover:bg-destructive/5"
            >
              Unlink
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={busy}
          className="flex items-center gap-1 text-[11px] h-7 px-2.5 rounded-md bg-primary/10 text-primary font-medium hover:bg-primary/15 disabled:opacity-50"
        >
          {busy
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Plus className="h-3 w-3" />}
          Connect
        </button>
      )}
    </div>
  );
}

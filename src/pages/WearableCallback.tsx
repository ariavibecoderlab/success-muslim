import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useExchangeStravaCode } from '@/hooks/useWearables';

/**
 * OAuth landing page for wearable providers (currently Strava).
 * Strava redirects here with `?code=...&state=...`; we hand the code
 * to the edge function which exchanges it for tokens server-side.
 *
 * Route: /wearables/callback
 */
export default function WearableCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const exchange = useExchangeStravaCode();
  const [state, setState] = useState<'working' | 'done' | 'error'>('working');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get('code');
    const error = params.get('error');

    if (error || !code) {
      setState('error');
      return;
    }
    exchange.mutate(code, {
      onSuccess: () => {
        setState('done');
        setTimeout(() => navigate('/settings', { replace: true }), 1400);
      },
      onError: () => setState('error'),
    });
  }, [params, exchange, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-8 text-center">
      {state === 'working' && (
        <>
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium mt-4">Connecting your account…</p>
        </>
      )}
      {state === 'done' && (
        <>
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="text-sm font-semibold mt-3">Connected!</p>
          <p className="text-xs text-muted-foreground mt-1">Pulling your recent activity…</p>
        </>
      )}
      {state === 'error' && (
        <>
          <XCircle className="h-10 w-10 text-destructive" />
          <p className="text-sm font-semibold mt-3">Connection failed</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            The link was cancelled or expired. You can try again from Settings.
          </p>
          <button
            onClick={() => navigate('/settings', { replace: true })}
            className="text-xs h-8 px-4 rounded-lg bg-primary text-primary-foreground font-medium"
          >
            Back to Settings
          </button>
        </>
      )}
    </div>
  );
}

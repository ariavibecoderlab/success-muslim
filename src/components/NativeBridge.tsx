import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PUBLIC_PREFIXES = ['/auth', '/reset-password', '/home', '/install', '/features', '/about', '/blog', '/onboarding'];
const isPublicRoute = (path: string) =>
  path === '/home' || PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));

/**
 * Wires native lifecycle events (deep links, hardware back button, resume)
 * to React Router and React Query. Web is a no-op.
 */
const NativeBridge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const handles: Array<{ remove: () => void } | undefined> = [];

    (async () => {
      // Deep link: parse path/query from incoming URL and navigate
      handles.push(
        await CapApp.addListener('appUrlOpen', async ({ url }) => {
          try {
            const parsed = new URL(url);
            const target = parsed.pathname + parsed.search + parsed.hash;
            if (!target || target === '/') return;

            // If route requires auth and user is signed out, stash for post-login redirect
            if (!isPublicRoute(parsed.pathname)) {
              const { data } = await supabase.auth.getSession();
              if (!data.session) {
                localStorage.setItem('post_auth_redirect', target);
                navigate('/auth');
                return;
              }
            }
            navigate(target);
          } catch (e) {
            console.warn('Bad deep link', url, e);
          }
        })
      );

      // Android hardware back button: history.back, exit on root
      handles.push(
        await CapApp.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack && location.pathname !== '/') {
            window.history.back();
          } else {
            CapApp.exitApp();
          }
        })
      );

      // App resume: refresh time-sensitive queries
      handles.push(
        await CapApp.addListener('resume', () => {
          queryClient.invalidateQueries({ queryKey: ['salah'] });
          queryClient.invalidateQueries({ queryKey: ['prayer-times'] });
          queryClient.invalidateQueries({ queryKey: ['fasting'] });
          queryClient.invalidateQueries({ queryKey: ['health'] });
        })
      );
    })();

    return () => {
      handles.forEach((h) => h?.remove());
    };
  }, [navigate, location.pathname, queryClient]);

  return null;
};

export default NativeBridge;
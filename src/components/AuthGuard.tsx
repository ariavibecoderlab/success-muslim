import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hydrateFromDatabase } from '@/lib/db-sync';
import { supabase } from '@/integrations/supabase/client';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const hydrated = useRef(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (user && !hydrated.current) {
      hydrated.current = true;
      hydrateFromDatabase();

      // Check onboarding status
      supabase.from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data && !data.onboarding_completed) {
            setNeedsOnboarding(true);
          }
          setCheckingOnboarding(false);
        });
    } else if (user) {
      setCheckingOnboarding(false);
    } else {
      setCheckingOnboarding(false);
    }
  }, [user]);

  if (loading || (user && checkingOnboarding)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    const SKIP_PATHS = ['/', '/auth', '/onboarding', '/install', '/reset-password'];
    const path = window.location.pathname + window.location.search;
    if (!SKIP_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
      localStorage.setItem('post_auth_redirect', path);
    }
    return <Navigate to="/auth" replace />;
  }
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;

  return children as React.ReactElement;
};

export default AuthGuard;

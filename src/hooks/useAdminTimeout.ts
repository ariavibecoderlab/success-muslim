import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 25 * 60 * 1000; // 25 minutes

export const useAdminTimeout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const warningRef = useRef<ReturnType<typeof setTimeout>>();
  const warnedRef = useRef(false);

  const resetTimer = useCallback(() => {
    warnedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    warningRef.current = setTimeout(() => {
      warnedRef.current = true;
      toast({
        title: 'Session expiring soon',
        description: 'You will be logged out in 5 minutes due to inactivity.',
        variant: 'destructive',
      });
    }, WARNING_MS);

    timerRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      navigate('/auth', { replace: true });
    }, TIMEOUT_MS);
  }, [navigate, toast]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimer]);
};

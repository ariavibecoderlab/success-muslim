import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          const redirect = localStorage.getItem('post_auth_redirect');
          localStorage.removeItem('post_auth_redirect');
          toast({ title: 'Email verified!', description: 'Welcome to Success Muslim.' });
          navigate(redirect || '/', { replace: true });
        } else {
          toast({ title: 'Verification failed', description: 'Please try signing in again.', variant: 'destructive' });
          navigate('/auth', { replace: true });
        }
      } catch {
        toast({ title: 'Something went wrong', description: 'Please try signing in again.', variant: 'destructive' });
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
};

export default AuthCallback;

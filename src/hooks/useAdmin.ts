import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user!.id,
        _role: 'admin',
      });
      if (error) return false;
      return !!data;
    },
    enabled: !!user && !authLoading,
  });

  return { isAdmin, loading: isLoading || authLoading };
};

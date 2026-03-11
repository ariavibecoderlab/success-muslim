import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getFidyahHistory } from '@/lib/storage';
import type { FidyahEntry } from '@/lib/types';

export function useFidyahHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['fidyah', user?.id ?? 'anon'],
    queryFn: async (): Promise<FidyahEntry[]> => {
      if (!user) return getFidyahHistory();
      const { data } = await supabase
        .from('fidyah_history')
        .select('entry, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!data?.length) return getFidyahHistory();
      return data.map(r => r.entry as unknown as FidyahEntry);
    },
    initialData: () => getFidyahHistory(),
    staleTime: 60_000,
  });
}

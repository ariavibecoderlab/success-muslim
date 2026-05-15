import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { getFidyahHistory } from '@/lib/storage';
import type { FidyahEntry } from '@/lib/types';

export function useFidyahHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['fidyah', user?.id ?? 'anon'],
    queryFn: async (): Promise<FidyahEntry[]> => {
      if (!user) return getFidyahHistory();
      const data = await api<{ entry: unknown; created_at: string }[]>('api-misc', {
        params: { resource: 'fidyah' },
      });
      if (!data?.length) return getFidyahHistory();
      return data.map(r => r.entry as unknown as FidyahEntry);
    },
    initialData: () => getFidyahHistory(),
    staleTime: 60_000,
  });
}

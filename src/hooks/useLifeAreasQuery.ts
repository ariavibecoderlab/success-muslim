import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import {
  getLifeAreaEntries, type LifeAreaEntry, type LifeAreaScore,
} from '@/lib/productivity-storage';

export function useLifeAreaEntries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['life-areas', user?.id ?? 'anon'],
    queryFn: async () => {
      if (!user) return getLifeAreaEntries();
      const data = await api<any[]>('api-productivity', { params: { resource: 'life-areas' } });
      if (!data?.length) return getLifeAreaEntries();
      const grouped: Record<string, LifeAreaScore[]> = {};
      for (const r of data) {
        if (!grouped[r.date]) grouped[r.date] = [];
        grouped[r.date].push({ area: r.area as any, score: r.score });
      }
      const entries: LifeAreaEntry[] = Object.entries(grouped)
        .map(([date, scores]) => ({ date, scores }))
        .sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem('sm_life_areas', JSON.stringify(entries));
      return entries;
    },
    initialData: () => getLifeAreaEntries(),
    staleTime: 60_000,
  });
}

export function useLatestLifeAreaEntry() {
  const { data: entries } = useLifeAreaEntries();
  return entries?.[0] ?? null;
}

export function useSaveLifeAreaEntry() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: LifeAreaEntry) => {
      const entries = getLifeAreaEntries();
      const idx = entries.findIndex(e => e.date === entry.date);
      if (idx >= 0) entries[idx] = entry;
      else entries.push(entry);
      entries.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem('sm_life_areas', JSON.stringify(entries));
      if (user) {
        await api('api-productivity', {
          method: 'POST',
          params: { resource: 'life-areas' },
          body: { date: entry.date, scores: entry.scores },
        });
      }
      return entries;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['life-areas'] }); },
  });
}

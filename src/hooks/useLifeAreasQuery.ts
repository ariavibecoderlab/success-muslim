import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  getLifeAreaEntries, getLatestLifeAreaEntry,
  type LifeAreaEntry, type LifeAreaScore,
} from '@/lib/productivity-storage';

export function useLifeAreaEntries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['life-areas', user?.id ?? 'anon'],
    queryFn: async () => {
      if (!user) return getLifeAreaEntries();
      const { data } = await supabase
        .from('life_area_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (!data?.length) return getLifeAreaEntries();
      // Group by date
      const grouped: Record<string, LifeAreaScore[]> = {};
      for (const r of data) {
        if (!grouped[r.date]) grouped[r.date] = [];
        grouped[r.date].push({ area: r.area as any, score: r.score });
      }
      const entries: LifeAreaEntry[] = Object.entries(grouped)
        .map(([date, scores]) => ({ date, scores }))
        .sort((a, b) => b.date.localeCompare(a.date));
      // Update localStorage
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
      // localStorage
      const entries = getLifeAreaEntries();
      const idx = entries.findIndex(e => e.date === entry.date);
      if (idx >= 0) entries[idx] = entry;
      else entries.push(entry);
      entries.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem('sm_life_areas', JSON.stringify(entries));
      // DB
      if (user) {
        const rows = entry.scores.map(s => ({
          user_id: user.id,
          date: entry.date,
          area: s.area,
          score: s.score,
        }));
        await supabase.from('life_area_scores').upsert(rows, {
          onConflict: 'user_id,date,area',
        });
      }
      return entries;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['life-areas'] });
    },
  });
}

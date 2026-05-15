import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import {
  getQadaSetup, getQadaProgress, logQadaPrayer, undoQadaPrayer, saveQadaSetup,
  getRamadhanSetup, getRamadhanProgress,
} from '@/lib/storage';
import type { QadaSolatSetup, QadaSolatProgress, PrayerType, RamadhanQadaSetup, RamadhanQadaProgress } from '@/lib/types';

export function useQadaSolat() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['qada', user?.id ?? 'anon'],
    queryFn: async (): Promise<{ setup: QadaSolatSetup | null; progress: QadaSolatProgress }> => {
      if (!user) return { setup: getQadaSetup(), progress: getQadaProgress() };
      const data = await api<{ setup: unknown; progress: unknown } | null>('api-misc', {
        params: { resource: 'qada-solat' },
      });
      if (!data) return { setup: getQadaSetup(), progress: getQadaProgress() };
      return {
        setup: data.setup as unknown as QadaSolatSetup,
        progress: data.progress as unknown as QadaSolatProgress,
      };
    },
    initialData: () => ({ setup: getQadaSetup(), progress: getQadaProgress() }),
    staleTime: 60_000,
  });
}

export function useQadaMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logPrayer = useMutation({
    mutationFn: async (args: { prayer: PrayerType; count?: number; date?: string }) => {
      return logQadaPrayer(args.prayer, args.count ?? 1, args.date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qada', user?.id ?? 'anon'] });
    },
  });

  const undoPrayer = useMutation({
    mutationFn: async (args: { prayer: PrayerType; date?: string }) => {
      return undoQadaPrayer(args.prayer, args.date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qada', user?.id ?? 'anon'] });
    },
  });

  const updateSetup = useMutation({
    mutationFn: async (setup: QadaSolatSetup) => {
      saveQadaSetup(setup);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qada', user?.id ?? 'anon'] });
    },
  });

  return { logPrayer, undoPrayer, updateSetup };
}

export function useRamadhanQada() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ramadhan-qada', user?.id ?? 'anon'],
    queryFn: async (): Promise<{ setup: RamadhanQadaSetup | null; progress: RamadhanQadaProgress }> => {
      if (!user) return { setup: getRamadhanSetup(), progress: getRamadhanProgress() };
      const data = await api<{ setup: unknown; progress: unknown } | null>('api-misc', {
        params: { resource: 'ramadhan-qada' },
      });
      if (!data) return { setup: getRamadhanSetup(), progress: getRamadhanProgress() };
      return {
        setup: data.setup as unknown as RamadhanQadaSetup,
        progress: data.progress as unknown as RamadhanQadaProgress,
      };
    },
    initialData: () => ({ setup: getRamadhanSetup(), progress: getRamadhanProgress() }),
    staleTime: 60_000,
  });
}

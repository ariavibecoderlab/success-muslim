import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  prayers_this_week: number;
  quran_days_this_week: number;
  fasting_days_this_week: number;
  quran_streak: number;
  iman_score: number;
  show_on_leaderboard: boolean;
  ghost_mode: boolean;
}

export interface FeedItem {
  id: string;
  family_id: string;
  user_id: string;
  activity_type: string;
  message: string;
  created_at: string;
  display_name?: string | null;
  avatar_url?: string | null;
  reactions?: { type: string; count: number; reacted: boolean }[];
}

export function useFamilyDashboard(familyId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enabled = !!familyId && !!user;

  const { data: leaderboard = [], isLoading: lbLoading } = useQuery({
    queryKey: ['family-leaderboard', familyId],
    queryFn: async () => {
      const data = await api<LeaderboardEntry[]>('api-family', {
        params: { resource: 'leaderboard', family_id: familyId! },
      });
      return (data ?? []).map(r => ({
        ...r,
        prayers_this_week: Number(r.prayers_this_week),
        quran_days_this_week: Number(r.quran_days_this_week),
        fasting_days_this_week: Number(r.fasting_days_this_week),
        quran_streak: Number(r.quran_streak),
      }));
    },
    enabled,
    staleTime: 30 * 1000,
  });

  const { data: feed = [], isLoading: feedLoading } = useQuery({
    queryKey: ['family-feed', familyId],
    queryFn: () => api<FeedItem[]>('api-family', {
      params: { resource: 'feed', family_id: familyId! },
    }),
    enabled,
    staleTime: 30 * 1000,
  });

  const { data: announcement = null } = useQuery({
    queryKey: ['family-announcement', familyId],
    queryFn: () => api<{ message: string; created_at: string } | null>('api-family', {
      params: { resource: 'announcement', family_id: familyId! },
    }),
    enabled: !!familyId,
  });

  const loading = lbLoading || feedLoading;

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['family-leaderboard', familyId] });
    queryClient.invalidateQueries({ queryKey: ['family-feed', familyId] });
    queryClient.invalidateQueries({ queryKey: ['family-announcement', familyId] });
  }, [queryClient, familyId]);

  const toggleReaction = async (feedId: string, reactionType: string) => {
    if (!user) return;

    const result = await api<{ removed?: boolean; added?: boolean }>('api-family', {
      method: 'POST',
      params: { resource: 'families' },
      body: { action: 'toggle_reaction', feed_id: feedId, reaction_type: reactionType },
    });

    // Optimistic UI update via cache
    queryClient.setQueryData<FeedItem[]>(['family-feed', familyId], (prev) =>
      (prev ?? []).map(item => {
        if (item.id !== feedId) return item;
        const reactions = item.reactions?.map(r => {
          if (r.type !== reactionType) return r;
          if (result?.removed) return { ...r, count: r.count - 1, reacted: false };
          return { ...r, count: r.count + 1, reacted: true };
        });
        return { ...item, reactions };
      })
    );
  };

  const postAnnouncement = async (message: string) => {
    if (!user || !familyId) return;
    try {
      await api('api-family', {
        method: 'POST',
        params: { resource: 'families' },
        body: { action: 'post_announcement', family_id: familyId, message },
      });
      queryClient.invalidateQueries({ queryKey: ['family-announcement', familyId] });
      toast({ title: 'Announcement posted!' });
    } catch {}
  };

  return {
    leaderboard,
    feed,
    announcement,
    loading,
    refresh,
    toggleReaction,
    postAnnouncement,
  };
}

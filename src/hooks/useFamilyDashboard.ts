import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [announcement, setAnnouncement] = useState<{ message: string; created_at: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    if (!familyId || !user) return;
    const { data, error } = await supabase.rpc('get_family_leaderboard', { p_family_id: familyId });
    if (error) console.error('Leaderboard RPC error:', error);
    if (!error && data) {
      setLeaderboard(
        (data as LeaderboardEntry[]).map(r => ({
          ...r,
          prayers_this_week: Number(r.prayers_this_week),
          quran_days_this_week: Number(r.quran_days_this_week),
          fasting_days_this_week: Number(r.fasting_days_this_week),
          quran_streak: Number(r.quran_streak),
        }))
      );
    }
  }, [familyId, user]);

  const loadFeed = useCallback(async () => {
    if (!familyId || !user) return;

    const { data: feedRows } = await supabase
      .from('family_activity_feed')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!feedRows) return;

    const userIds = [...new Set(feedRows.map(r => r.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    const feedIds = feedRows.map(r => r.id);
    const { data: reactions } = await supabase
      .from('family_reactions')
      .select('feed_id, reaction_type, user_id')
      .in('feed_id', feedIds);

    const enriched: FeedItem[] = feedRows.map(row => {
      const profile = profiles?.find(p => p.id === row.user_id);
      const rowReactions = reactions?.filter(r => r.feed_id === row.id) ?? [];

      const types = ['dua', 'love', 'fire'];
      const reactionSummary = types.map(t => ({
        type: t,
        count: rowReactions.filter(r => r.reaction_type === t).length,
        reacted: rowReactions.some(r => r.reaction_type === t && r.user_id === user.id),
      }));

      return {
        ...row,
        display_name: profile?.display_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        reactions: reactionSummary,
      };
    });

    setFeed(enriched);
  }, [familyId, user]);

  const loadAnnouncement = useCallback(async () => {
    if (!familyId) return;
    const { data } = await supabase
      .from('family_announcements')
      .select('message, created_at')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    setAnnouncement(data ?? null);
  }, [familyId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadLeaderboard(), loadFeed(), loadAnnouncement()]);
    setLoading(false);
  }, [loadLeaderboard, loadFeed, loadAnnouncement]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const toggleReaction = async (feedId: string, reactionType: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('family_reactions')
      .select('id')
      .eq('feed_id', feedId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType)
      .single();

    if (existing) {
      await supabase.from('family_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('family_reactions').insert({
        feed_id: feedId,
        user_id: user.id,
        reaction_type: reactionType,
      });
    }

    // optimistic UI update
    setFeed(prev => prev.map(item => {
      if (item.id !== feedId) return item;
      const reactions = item.reactions?.map(r => {
        if (r.type !== reactionType) return r;
        if (existing) return { ...r, count: r.count - 1, reacted: false };
        return { ...r, count: r.count + 1, reacted: true };
      });
      return { ...item, reactions };
    }));
  };

  const postAnnouncement = async (message: string) => {
    if (!user || !familyId) return;
    const { error } = await supabase.from('family_announcements').insert({
      family_id: familyId,
      admin_id: user.id,
      message,
    });
    if (!error) {
      await loadAnnouncement();
      toast({ title: 'Announcement posted!' });
    }
  };

  return {
    leaderboard,
    feed,
    announcement,
    loading,
    refresh: loadAll,
    toggleReaction,
    postAnnouncement,
  };
}

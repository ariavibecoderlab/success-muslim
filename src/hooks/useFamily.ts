import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Family {
  id: string;
  name: string;
  mode: string;
  group_type: string;
  created_by: string;
  invite_code: string;
  invite_link: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
  user_role?: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  is_visible: boolean;
  display_name?: string | null;
  avatar_url?: string | null;
}

const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)];
  }
  return code;
}

async function fetchFamilies(userId: string): Promise<Family[]> {
  const { data: memberRows } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', userId);

  if (!memberRows || memberRows.length === 0) return [];

  const familyIds = memberRows.map(r => r.family_id);
  const { data: familyRows } = await supabase
    .from('families')
    .select('*')
    .in('id', familyIds);

  if (!familyRows) return [];

  const withCounts: Family[] = await Promise.all(
    familyRows.map(async (f) => {
      const { count } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', f.id);
      const role = memberRows.find(r => r.family_id === f.id)?.role || 'member';
      return { ...f, member_count: count ?? 0, user_role: role };
    })
  );

  return withCounts;
}

export function useFamily() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: families = [], isLoading: loading } = useQuery({
    queryKey: ['families', user?.id],
    queryFn: () => fetchFamilies(user!.id),
    enabled: !!user,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['families', user?.id] });
  }, [queryClient, user?.id]);

  const createFamily = async (name: string, groupType: 'family' | 'class' = 'family'): Promise<Family | null> => {
    if (!user) return null;

    const { count } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count ?? 0) >= 2) {
      toast({ title: 'Limit reached', description: 'You can be in at most 2 family groups.', variant: 'destructive' });
      return null;
    }

    let invite_code = generateInviteCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('families')
        .select('id')
        .eq('invite_code', invite_code)
        .single();
      if (!existing) break;
      invite_code = generateInviteCode();
      attempts++;
    }

    const invite_link = `https://www.successmuslim.app/family/join/${invite_code}`;

    const { data: family, error } = await supabase
      .from('families')
      .insert({ name: name.trim(), created_by: user.id, invite_code, invite_link, group_type: groupType } as any)
      .select()
      .single();

    if (error || !family) {
      toast({ title: 'Error', description: error?.message, variant: 'destructive' });
      return null;
    }

    await supabase.from('family_members').insert({
      family_id: family.id,
      user_id: user.id,
      role: 'admin',
    });

    invalidate();
    return family;
  };

  const joinFamily = async (code: string): Promise<Family | null> => {
    if (!user) return null;

    const { count: myCount } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((myCount ?? 0) >= 2) {
      toast({ title: 'Limit reached', description: 'You can be in at most 2 family groups.', variant: 'destructive' });
      return null;
    }

    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('invite_code', code.toUpperCase().trim())
      .single();

    if (familyError || !family) {
      toast({ title: 'Invalid code', description: 'No family found with that invite code.', variant: 'destructive' });
      return null;
    }

    const { data: existing } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', family.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      toast({ title: 'Already a member', description: 'You are already in this family.' });
      return family;
    }

    const { count: memberCount } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', family.id);

    if ((memberCount ?? 0) >= 20) {
      toast({ title: 'Family is full', description: 'This group has reached the 20-member limit.', variant: 'destructive' });
      return null;
    }

    const { error: joinError } = await supabase
      .from('family_members')
      .insert({ family_id: family.id, user_id: user.id, role: 'member' });

    if (joinError) {
      toast({ title: 'Error joining', description: joinError.message, variant: 'destructive' });
      return null;
    }

    invalidate();
    toast({ title: `Welcome to ${family.name}!`, description: 'You have joined the family group.' });
    return family;
  };

  const previewFamily = async (code: string): Promise<{ family: Family; memberCount: number } | null> => {
    const { data: family } = await supabase
      .from('families')
      .select('*')
      .eq('invite_code', code.toUpperCase().trim())
      .single();

    if (!family) return null;

    const { count } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', family.id);

    return { family, memberCount: count ?? 0 };
  };

  const deleteFamily = async (familyId: string): Promise<boolean> => {
    if (!user) return false;

    await supabase.from('family_activity_feed').delete().eq('family_id', familyId);
    await supabase.from('family_announcements').delete().eq('family_id', familyId);
    await supabase.from('family_members').delete().eq('family_id', familyId);
    const { error } = await supabase.from('families').delete().eq('id', familyId);

    if (error) {
      toast({ title: 'Error deleting group', description: error.message, variant: 'destructive' });
      return false;
    }

    invalidate();
    toast({ title: 'Group deleted' });
    return true;
  };

  const leaveFamily = async (familyId: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error leaving group', description: error.message, variant: 'destructive' });
      return false;
    }

    // Auto-delete family if no members remain
    const { count } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('family_id', familyId);

    if (count === 0) {
      await supabase.from('family_activity_feed').delete().eq('family_id', familyId);
      await supabase.from('family_announcements').delete().eq('family_id', familyId);
      await supabase.from('families').delete().eq('id', familyId);
    }

    invalidate();
    toast({ title: 'You left the group' });
    return true;
  };

  const renameFamily = async (familyId: string, name: string): Promise<boolean> => {
    const { error } = await supabase
      .from('families')
      .update({ name: name.trim() })
      .eq('id', familyId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }

    invalidate();
    toast({ title: 'Family renamed!' });
    return true;
  };

  const removeMember = async (familyId: string, memberId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', memberId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }

    toast({ title: 'Member removed' });
    return true;
  };

  const transferAdmin = async (familyId: string, newAdminId: string): Promise<boolean> => {
    if (!user) return false;

    const { error: e1 } = await supabase
      .from('family_members')
      .update({ role: 'member' })
      .eq('family_id', familyId)
      .eq('user_id', user.id);

    const { error: e2 } = await supabase
      .from('family_members')
      .update({ role: 'admin' })
      .eq('family_id', familyId)
      .eq('user_id', newAdminId);

    if (e1 || e2) {
      toast({ title: 'Error transferring admin', variant: 'destructive' });
      return false;
    }

    invalidate();
    toast({ title: 'Admin transferred!' });
    return true;
  };

  const getFamilyMembers = async (familyId: string): Promise<FamilyMember[]> => {
    const { data } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId);

    if (!data) return [];

    const userIds = data.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    return data.map(m => ({
      ...m,
      display_name: profiles?.find(p => p.id === m.user_id)?.display_name ?? null,
      avatar_url: profiles?.find(p => p.id === m.user_id)?.avatar_url ?? null,
    }));
  };

  const postFeedEvent = async (familyId: string, activityType: string, message: string) => {
    if (!user) return;
    await supabase.from('family_activity_feed').insert({
      family_id: familyId,
      user_id: user.id,
      activity_type: activityType,
      message,
    });
  };

  return {
    families,
    loading,
    loadFamilies: invalidate,
    createFamily,
    joinFamily,
    previewFamily,
    deleteFamily,
    leaveFamily,
    renameFamily,
    removeMember,
    transferAdmin,
    getFamilyMembers,
    postFeedEvent,
  };
}

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
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

export function useFamily() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: families = [], isLoading: loading } = useQuery({
    queryKey: ['families', user?.id],
    queryFn: () => api<Family[]>('api-family', { params: { resource: 'families' } }),
    enabled: !!user,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['families', user?.id] });
  }, [queryClient, user?.id]);

  const createFamily = async (name: string, groupType: 'family' | 'class' = 'family'): Promise<Family | null> => {
    if (!user) return null;
    try {
      const invite_code = generateInviteCode();
      const family = await api<Family>('api-family', {
        method: 'POST',
        params: { resource: 'families' },
        body: { action: 'create', name: name.trim(), invite_code, group_type: groupType },
      });
      invalidate();
      return family;
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      return null;
    }
  };

  const joinFamily = async (code: string): Promise<Family | null> => {
    if (!user) return null;
    try {
      const result = await api<{ family: Family; joined?: boolean; already_member?: boolean; error?: string }>('api-family', {
        method: 'POST',
        params: { resource: 'families' },
        body: { action: 'join', code: code.toUpperCase().trim() },
      });
      if ((result as any)?.error) {
        toast({ title: 'Error', description: (result as any).error, variant: 'destructive' });
        return null;
      }
      if (result.already_member) {
        toast({ title: 'Already a member', description: 'You are already in this family.' });
        return result.family;
      }
      invalidate();
      toast({ title: `Welcome to ${result.family.name}!`, description: 'You have joined the family group.' });
      return result.family;
    } catch (e: any) {
      toast({ title: 'Invalid code', description: 'No family found with that invite code.', variant: 'destructive' });
      return null;
    }
  };

  const previewFamily = async (code: string): Promise<{ family: Family; memberCount: number } | null> => {
    try {
      const result = await api<{ family: Family; memberCount: number } | null>('api-family', {
        method: 'POST',
        params: { resource: 'families' },
        body: { action: 'preview', code: code.toUpperCase().trim() },
      });
      return result;
    } catch {
      return null;
    }
  };

  const deleteFamily = async (familyId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await api('api-family', { method: 'DELETE', params: { resource: 'families', family_id: familyId } });
      invalidate();
      toast({ title: 'Group deleted' });
      return true;
    } catch (e: any) {
      toast({ title: 'Error deleting group', description: e.message, variant: 'destructive' });
      return false;
    }
  };

  const leaveFamily = async (familyId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await api('api-family', { method: 'DELETE', params: { resource: 'families', family_id: familyId, action: 'leave' } });
      invalidate();
      toast({ title: 'You left the group' });
      return true;
    } catch (e: any) {
      toast({ title: 'Error leaving group', description: e.message, variant: 'destructive' });
      return false;
    }
  };

  const renameFamily = async (familyId: string, name: string): Promise<boolean> => {
    try {
      await api('api-family', {
        method: 'POST', params: { resource: 'families' },
        body: { action: 'rename', family_id: familyId, name: name.trim() },
      });
      invalidate();
      toast({ title: 'Family renamed!' });
      return true;
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      return false;
    }
  };

  const removeMember = async (familyId: string, memberId: string): Promise<boolean> => {
    try {
      await api('api-family', {
        method: 'POST', params: { resource: 'families' },
        body: { action: 'remove_member', family_id: familyId, member_id: memberId },
      });
      toast({ title: 'Member removed' });
      return true;
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      return false;
    }
  };

  const transferAdmin = async (familyId: string, newAdminId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await api('api-family', {
        method: 'POST', params: { resource: 'families' },
        body: { action: 'transfer_admin', family_id: familyId, new_admin_id: newAdminId },
      });
      invalidate();
      toast({ title: 'Admin transferred!' });
      return true;
    } catch {
      toast({ title: 'Error transferring admin', variant: 'destructive' });
      return false;
    }
  };

  const getFamilyMembers = async (familyId: string): Promise<FamilyMember[]> => {
    try {
      return await api<FamilyMember[]>('api-family', {
        params: { resource: 'members', family_id: familyId },
      });
    } catch {
      return [];
    }
  };

  const postFeedEvent = async (familyId: string, activityType: string, message: string) => {
    if (!user) return;
    try {
      await api('api-family', {
        method: 'POST', params: { resource: 'families' },
        body: { action: 'post_feed', family_id: familyId, activity_type: activityType, message },
      });
    } catch {}
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

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminAudit = () => {
  const { user } = useAuth();

  const logAction = useCallback(async (
    action: string,
    targetType?: string,
    targetId?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;
    await (supabase as any).from('admin_audit_log').insert({
      admin_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata: metadata || {},
    });
  }, [user]);

  return { logAction };
};

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { api } from '@/lib/api-client';

export const useAdminAudit = () => {
  const { user } = useAuth();

  const logAction = useCallback(async (
    action: string,
    targetType?: string,
    targetId?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;
    await api('api-admin', {
      method: 'POST',
      params: { resource: 'audit-log' },
      body: { action, target_type: targetType, target_id: targetId, metadata: metadata || {} },
    });
  }, [user]);

  return { logAction };
};

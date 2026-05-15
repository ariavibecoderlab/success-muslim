import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from './useAuth';

export interface HealthProfile {
  id: string;
  user_id: string;
  goal: string | null;
  gender: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal_weight_kg: number | null;
  bmi: number | null;
  tdee: number | null;
  eating_habits: string | null;
  sleep_hours: string | null;
  activity_level: string | null;
  fasting_experience: string | null;
  recommended_protocol: string | null;
  completed_at: string | null;
}

export function useHealthProfile() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile = null, isLoading: queryLoading } = useQuery({
    queryKey: ['health-profile', user?.id],
    queryFn: async () => {
      const data = await api<HealthProfile | null>('api-health', { params: { resource: 'profile' } });
      return data;
    },
    enabled: !!user && !authLoading,
  });

  const loading = authLoading || queryLoading;
  const completed = !!profile?.completed_at;

  const saveProfile = useCallback(async (updates: Partial<HealthProfile>) => {
    if (!user) return;
    const data = await api<HealthProfile>('api-health', {
      method: 'POST',
      params: { resource: 'profile' },
      body: updates,
    });
    if (data) {
      queryClient.setQueryData(['health-profile', user.id], data);
    }
  }, [user, queryClient]);

  return { profile, loading, completed, saveProfile };
}

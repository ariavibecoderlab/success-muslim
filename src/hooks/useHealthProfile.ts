import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

async function fetchHealthProfile(userId: string): Promise<HealthProfile | null> {
  const { data } = await supabase
    .from('user_health_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data ? (data as unknown as HealthProfile) : null;
}

export function useHealthProfile() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile = null, isLoading: queryLoading } = useQuery({
    queryKey: ['health-profile', user?.id],
    queryFn: () => fetchHealthProfile(user!.id),
    enabled: !!user && !authLoading,
  });

  const loading = authLoading || queryLoading;
  const completed = !!profile?.completed_at;

  const saveProfile = useCallback(async (updates: Partial<HealthProfile>) => {
    if (!user) return;
    const { data } = await supabase
      .from('user_health_profiles')
      .upsert({ user_id: user.id, ...updates } as any, { onConflict: 'user_id' })
      .select()
      .single();
    if (data) {
      queryClient.setQueryData(['health-profile', user.id], data as unknown as HealthProfile);
    }
  }, [user, queryClient]);

  return { profile, loading, completed, saveProfile };
}

import { useState, useEffect } from 'react';
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

export function useHealthProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from('user_health_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data as unknown as HealthProfile);
        setCompleted(!!data.completed_at);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const saveProfile = async (updates: Partial<HealthProfile>) => {
    if (!user) return;
    const { data } = await supabase
      .from('user_health_profiles')
      .upsert({ user_id: user.id, ...updates } as any, { onConflict: 'user_id' })
      .select()
      .single();
    if (data) {
      setProfile(data as unknown as HealthProfile);
      setCompleted(!!data.completed_at);
    }
  };

  return { profile, loading, completed, saveProfile };
}

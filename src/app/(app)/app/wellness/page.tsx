import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WellnessClient } from './WellnessClient';
import { FastingTab } from './FastingTab';
import { MovementTab } from './MovementTab';

export default async function WellnessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [activeFastingRes, fastingHistoryRes, movementRes] = await Promise.all([
    supabase
      .from('fasting_sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('fasting_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false })
      .limit(10),
    supabase
      .from('movement_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const activeFasting = activeFastingRes.data;
  const fastingHistory = fastingHistoryRes.data || [];
  const movementLogs = movementRes.data || [];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Wellness</h1>

      <WellnessClient
        activeFasting={activeFasting}
        fastingHistory={fastingHistory}
        movementLogs={movementLogs}
        userId={user.id}
      />
    </div>
  );
}

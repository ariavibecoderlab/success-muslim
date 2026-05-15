import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsForm } from './SettingsForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: plan } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!plan) redirect('/onboarding');

  const wakeTime = typeof plan.wake_time === 'string' ? plan.wake_time.slice(0, 5) : '06:00';
  const sleepTime = typeof plan.sleep_time === 'string' ? plan.sleep_time.slice(0, 5) : '22:30';

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Edit Daily Schedule</h1>
      <SettingsForm
        planId={plan.id}
        wakeTime={wakeTime}
        sleepTime={sleepTime}
        goal1={plan.goal_1}
        goal2={plan.goal_2 || ''}
        goal3={plan.goal_3 || ''}
      />
    </div>
  );
}

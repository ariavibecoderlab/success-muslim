import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { getHijriDate } from '@/lib/hijri';
import { getPrayerTimes } from '@/lib/prayer-times';
import { DailyScheduleCard } from '@/components/today/DailyScheduleCard';
import { GoalsCard } from '@/components/today/GoalsCard';
import { PrayerTimelineCard } from '@/components/today/PrayerTimelineCard';
import { FastingStatusCard } from '@/components/today/FastingStatusCard';
import { TodayClient } from './TodayClient';

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = format(new Date(), 'yyyy-MM-dd');

  const [planRes, checkInsRes, profileRes, fastingRes] = await Promise.all([
    supabase.from('daily_plans').select('*').eq('user_id', user.id).single(),
    supabase.from('habit_check_ins').select('*').eq('user_id', user.id).eq('check_in_date', today),
    supabase.from('profiles').select('full_name, location_lat, location_lng, timezone').eq('id', user.id).single(),
    supabase
      .from('fasting_sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const plan = planRes.data;
  const checkIns = checkInsRes.data || [];
  const profile = profileRes.data;
  const activeFasting = fastingRes.data;

  if (!plan) redirect('/onboarding');

  const lat = profile?.location_lat ?? 3.1390;
  const lng = profile?.location_lng ?? 101.6869;
  const timezone = profile?.timezone ?? 'Asia/Kuala_Lumpur';
  const prayers = getPrayerTimes(lat, lng, timezone);

  const goals = [
    { index: 1 as const, text: plan.goal_1, status: checkIns.find((c) => c.goal_index === 1)?.status ?? null, note: checkIns.find((c) => c.goal_index === 1)?.note },
    { index: 2 as const, text: plan.goal_2 || '', status: plan.goal_2 ? (checkIns.find((c) => c.goal_index === 2)?.status ?? null) : null, note: checkIns.find((c) => c.goal_index === 2)?.note },
    { index: 3 as const, text: plan.goal_3 || '', status: plan.goal_3 ? (checkIns.find((c) => c.goal_index === 3)?.status ?? null) : null, note: checkIns.find((c) => c.goal_index === 3)?.note },
  ];

  const wakeTime = typeof plan.wake_time === 'string' ? plan.wake_time.slice(0, 5) : '06:00';
  const sleepTime = typeof plan.sleep_time === 'string' ? plan.sleep_time.slice(0, 5) : '22:30';

  return (
    <TodayClient>
      <div className="p-4 max-w-lg mx-auto">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Assalamualaikum, {profile?.full_name || 'there'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {getHijriDate()} · {format(new Date(), 'EEEE, MMM d, yyyy')}
          </p>
        </header>

        <div className="space-y-4">
          <DailyScheduleCard wakeTime={wakeTime} sleepTime={sleepTime} />

          <GoalsCard
            goals={goals}
            planId={plan.id}
            userId={user.id}
            date={today}
          />

          <PrayerTimelineCard prayers={prayers} />

          {activeFasting && (
            <FastingStatusCard
              startTime={activeFasting.start_time}
              targetHours={activeFasting.target_hours}
              fastingType={activeFasting.fasting_type}
            />
          )}
        </div>
      </div>
    </TodayClient>
  );
}


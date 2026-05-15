import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle } from '@/components/ui/Card';
import { format, subDays } from 'date-fns';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const today = format(new Date(), 'yyyy-MM-dd');
  const last7 = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
  );

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const dailyActive: number[] = [];
  for (const date of last7) {
    const { data } = await supabase
      .from('habit_check_ins')
      .select('user_id')
      .eq('check_in_date', date);
    const unique = new Set((data || []).map((d) => d.user_id)).size;
    dailyActive.push(unique);
  }

  const { data: checkIns } = await supabase
    .from('habit_check_ins')
    .select('user_id, status')
    .eq('check_in_date', today);

  const done = (checkIns || []).filter((c) => c.status === 'done').length;
  const total = (checkIns || []).length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardTitle>Total Users</CardTitle>
          <p className="text-3xl font-bold text-primary mt-2">{totalUsers ?? 0}</p>
        </Card>
        <Card>
          <CardTitle>Active Today</CardTitle>
          <p className="text-3xl font-bold text-primary mt-2">{dailyActive[dailyActive.length - 1] ?? 0}</p>
        </Card>
        <Card>
          <CardTitle>Goals Completed Today</CardTitle>
          <p className="text-3xl font-bold text-primary mt-2">{completionRate}%</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Daily Active Users (Last 7 Days)</CardTitle>
        <div className="mt-4 flex items-end gap-2 h-32">
          {last7.map((date, i) => (
            <div key={date} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary rounded-t transition-all min-h-[4px]"
                style={{
                  height: `${Math.max(4, (dailyActive[i] / Math.max(1, Math.max(...dailyActive))) * 100)}%`,
                }}
              />
              <span className="text-xs text-gray-600 mt-2">
                {format(new Date(date), 'EEE')}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

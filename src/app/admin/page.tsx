import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle } from '@/components/ui/Card';

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: totalUsers },
    { count: activeToday },
    { data: checkIns },
    { count: totalCheckIns },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('habit_check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('check_in_date', today),
    supabase
      .from('habit_check_ins')
      .select('user_id, status')
      .eq('check_in_date', today),
    supabase
      .from('habit_check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('check_in_date', today),
  ]);

  const doneCount = (checkIns || []).filter((c) => c.status === 'done').length;
  const goalsCompleted = totalCheckIns ? Math.round((doneCount / totalCheckIns) * 100) : 0;

  const uniqueUsersToday = new Set((checkIns || []).map((c: { user_id?: string }) => c.user_id)).size;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardTitle>Total Users</CardTitle>
          <p className="text-3xl font-bold text-primary mt-2">{totalUsers ?? 0}</p>
        </Card>
        <Card>
          <CardTitle>Active Today</CardTitle>
          <p className="text-3xl font-bold text-primary mt-2">
            {activeToday ?? uniqueUsersToday}
          </p>
        </Card>
        <Card>
          <CardTitle>Goals Completed Today</CardTitle>
          <p className="text-3xl font-bold text-primary mt-2">{goalsCompleted}%</p>
        </Card>
      </div>
    </div>
  );
}

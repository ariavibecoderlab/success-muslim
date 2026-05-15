import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle } from '@/components/ui/Card';
import { format } from 'date-fns';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const userIds = (profiles || []).map((p) => p.id);
  const { data: lastCheckIns } = await supabase
    .from('habit_check_ins')
    .select('user_id, check_in_date')
    .in('user_id', userIds)
    .order('check_in_date', { ascending: false });

  const lastActiveByUser = new Map<string, string>();
  for (const c of lastCheckIns || []) {
    if (!lastActiveByUser.has(c.user_id)) {
      lastActiveByUser.set(c.user_id, c.check_in_date);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      <Card>
        <CardTitle>User List</CardTitle>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Joined</th>
                <th className="text-left py-3 px-2">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {(profiles || []).map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">{p.full_name || '—'}</td>
                  <td className="py-3 px-2 text-gray-600">
                    {format(new Date(p.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    {lastActiveByUser.get(p.id)
                      ? format(new Date(lastActiveByUser.get(p.id)!), 'MMM d')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

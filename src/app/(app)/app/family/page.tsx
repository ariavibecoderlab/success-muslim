import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { FamilyClient } from './FamilyClient';

export default async function FamilyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: familyMembership } = await supabase
    .from('family_members')
    .select(`
      family_id,
      family_groups (
        id,
        name,
        created_by
      )
    `)
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  const familyGroup = familyMembership?.family_groups as
    | { id: string; name: string; created_by: string }
    | null;
  const familyId = familyGroup?.id;

  let members: { id: string; user_id: string; full_name: string; completion: number }[] = [];
  if (familyId) {
    const { data: memberRows } = await supabase
      .from('family_members')
      .select('user_id')
      .eq('family_id', familyId);

    const userIds = (memberRows || []).map((m) => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    const { data: checkIns } = await supabase
      .from('habit_check_ins')
      .select('user_id, status')
      .in('user_id', userIds)
      .eq('check_in_date', today);

    const doneCountByUser = new Map<string, number>();
    const totalByUser = new Map<string, number>();
    for (const c of checkIns || []) {
      const uid = c.user_id;
      totalByUser.set(uid, (totalByUser.get(uid) || 0) + 1);
      if (c.status === 'done') {
        doneCountByUser.set(uid, (doneCountByUser.get(uid) || 0) + 1);
      }
    }

    members = (profiles || []).map((p) => {
      const done = doneCountByUser.get(p.id) || 0;
      const total = totalByUser.get(p.id) || 3;
      return {
        id: p.id,
        user_id: p.id,
        full_name: p.full_name || 'Unknown',
        completion: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });
  }

  const { data: invites } = await supabase
    .from('family_invites')
    .select('id, email, expires_at')
    .eq('family_id', familyId || '')
    .gt('expires_at', new Date().toISOString());

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Family</h1>

      <FamilyClient
        familyGroup={familyGroup}
        members={members}
        invites={invites || []}
        userId={user.id}
      />
    </div>
  );
}

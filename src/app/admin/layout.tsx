import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdminNav } from './AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) redirect('/app/today');

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-white border-r border-gray-200 p-4">
        <Link href="/admin" className="block text-lg font-bold text-primary mb-6">
          Admin
        </Link>
        <AdminNav />
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

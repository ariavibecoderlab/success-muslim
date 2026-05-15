import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LearnClient } from './LearnClient';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'soul', label: 'Soul' },
  { value: 'jasad', label: 'Jasad' },
  { value: 'mind', label: 'Mind' },
  { value: 'emotion', label: 'Emotion' },
];

export default async function LearnPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: content } = await supabase
    .from('learn_content')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('content_id')
    .eq('user_id', user.id);

  const bookmarkedIds = new Set((bookmarks || []).map((b) => b.content_id));

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Learn</h1>

      <LearnClient
        content={content || []}
        bookmarkedIds={Array.from(bookmarkedIds)}
        categories={CATEGORIES}
        userId={user.id}
      />
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle } from '@/components/ui/Card';
import { ContentForm } from './ContentForm';

export default async function AdminContentPage() {
  const supabase = await createClient();

  const { data: content } = await supabase
    .from('learn_content')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Content CMS</h1>

      <ContentForm />

      <Card className="mt-6">
        <CardTitle>Content List</CardTitle>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2">Title</th>
                <th className="text-left py-3 px-2">Category</th>
                <th className="text-left py-3 px-2">Type</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(content || []).map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">{c.title}</td>
                  <td className="py-3 px-2 text-gray-600 capitalize">{c.category}</td>
                  <td className="py-3 px-2 text-gray-600">{c.content_type || '—'}</td>
                  <td className="py-3 px-2">
                    <a
                      href={`/admin/content/${c.id}/edit`}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </a>
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

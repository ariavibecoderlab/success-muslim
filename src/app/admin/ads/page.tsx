import { createClient } from '@/lib/supabase/server';
import { Card, CardTitle } from '@/components/ui/Card';
import { AdsForm } from './AdsForm';

export default async function AdminAdsPage() {
  const supabase = await createClient();

  const { data: adSlots } = await supabase
    .from('ad_slots')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ads (Placeholder)</h1>

      <AdsForm />

      <Card className="mt-6">
        <CardTitle>Ad Slots</CardTitle>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Placement</th>
                <th className="text-left py-3 px-2">Active</th>
                <th className="text-left py-3 px-2">Content URL</th>
              </tr>
            </thead>
            <tbody>
              {(adSlots || []).map((a) => (
                <tr key={a.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">{a.name}</td>
                  <td className="py-3 px-2 text-gray-600">{a.placement}</td>
                  <td className="py-3 px-2">{a.active ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-2 text-gray-600 truncate max-w-xs">
                    {a.content_url || '—'}
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

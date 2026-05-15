'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle } from '@/components/ui/Card';

export function AdsForm() {
  const [name, setName] = useState('');
  const [placement, setPlacement] = useState('banner');
  const [contentUrl, setContentUrl] = useState('');
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('ad_slots').insert({
        name: name.trim(),
        placement: placement.trim() || 'banner',
        content_url: contentUrl.trim() || null,
        active,
      });
      if (error) throw error;
      setName('');
      setContentUrl('');
      setActive(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardTitle>Create Ad Slot</CardTitle>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Home Banner"
            className="w-full px-4 py-3 rounded-card border border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Placement</label>
          <input
            type="text"
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            placeholder="e.g. banner, sidebar"
            className="w-full px-4 py-3 rounded-card border border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content URL</label>
          <input
            type="url"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-card border border-gray-300"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span className="text-sm">Active</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 bg-primary text-white rounded-card font-medium disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Slot'}
        </button>
      </form>
    </Card>
  );
}

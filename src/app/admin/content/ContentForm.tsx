'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle } from '@/components/ui/Card';

export function ContentForm() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('soul');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [contentType, setContentType] = useState('tip');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('learn_content').insert({
        title: title.trim(),
        summary: summary.trim() || null,
        category,
        url: url.trim() || null,
        thumbnail_url: thumbnailUrl.trim() || null,
        content_type: contentType,
      });
      if (error) throw error;
      setTitle('');
      setSummary('');
      setUrl('');
      setThumbnailUrl('');
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardTitle>Add New Content</CardTitle>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-card border border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-card border border-gray-300"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-card border border-gray-300"
            >
              <option value="soul">Soul</option>
              <option value="jasad">Jasad</option>
              <option value="mind">Mind</option>
              <option value="emotion">Emotion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-4 py-3 rounded-card border border-gray-300"
            >
              <option value="tip">Tip</option>
              <option value="video">Video</option>
              <option value="podcast">Podcast</option>
              <option value="book">Book</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-card border border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-card border border-gray-300"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 bg-primary text-white rounded-card font-medium disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Content'}
        </button>
      </form>
    </Card>
  );
}

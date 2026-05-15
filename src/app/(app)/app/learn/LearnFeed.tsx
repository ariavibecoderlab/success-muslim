'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';

interface ContentItem {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  url: string | null;
  thumbnail_url: string | null;
  content_type: string | null;
}

interface LearnFeedProps {
  content: ContentItem[];
  bookmarkedIds: string[];
  userId: string;
}

export function LearnFeed({
  content,
  bookmarkedIds: initialBookmarkedIds,
  userId,
}: LearnFeedProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    new Set(initialBookmarkedIds)
  );
  const supabase = createClient();

  const toggleBookmark = async (contentId: string) => {
    const isBookmarked = bookmarkedIds.has(contentId);
    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('content_id', contentId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(contentId);
          return next;
        });
      } else {
        await supabase.from('bookmarks').insert({
          user_id: userId,
          content_id: contentId,
        });
        setBookmarkedIds((prev) => new Set(prev).add(contentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCategory = (c: string) =>
    c.charAt(0).toUpperCase() + c.slice(1);

  if (content.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No content yet. Check back later for inspiration.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {content.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="flex gap-4">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt=""
                className="w-24 h-24 object-cover rounded-lg shrink-0"
              />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-lg shrink-0 flex items-center justify-center text-primary text-2xl">
                📚
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-primary bg-primary-50 px-2 py-0.5 rounded">
                {formatCategory(item.category)}
              </span>
              <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {item.summary || 'No summary'}
              </p>
              <div className="flex justify-between items-center mt-2">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View
                  </a>
                )}
                <button
                  onClick={() => toggleBookmark(item.id)}
                  className="text-lg"
                  title={bookmarkedIds.has(item.id) ? 'Remove bookmark' : 'Bookmark'}
                >
                  {bookmarkedIds.has(item.id) ? '🔖' : '📑'}
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

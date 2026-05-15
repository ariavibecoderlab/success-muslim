'use client';

import { useState } from 'react';
import { LearnFeed } from './LearnFeed';

interface ContentItem {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  url: string | null;
  thumbnail_url: string | null;
  content_type: string | null;
}

interface Category {
  value: string;
  label: string;
}

interface LearnClientProps {
  content: ContentItem[];
  bookmarkedIds: string[];
  categories: Category[];
  userId: string;
}

export function LearnClient({
  content,
  bookmarkedIds,
  categories,
  userId,
}: LearnClientProps) {
  const [category, setCategory] = useState('all');

  const filtered =
    category === 'all' ? content : content.filter((c) => c.category === category);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`shrink-0 px-4 py-2 rounded-full font-medium text-sm ${
              category === c.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <LearnFeed
        content={filtered}
        bookmarkedIds={bookmarkedIds}
        userId={userId}
      />
    </div>
  );
}

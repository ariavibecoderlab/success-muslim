import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import MarketingLayout from '@/components/MarketingLayout';

export default function Blog() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <MarketingLayout>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground mb-10">Insights, guides, and stories for the Muslim community.</p>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No posts yet. Check back soon!</div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.cover_image_url ? (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center text-4xl">📝</div>
                )}
                <div className="p-5">
                  <h2 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                  )}
                  {post.published_at && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(post.published_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MarketingLayout>
  );
}

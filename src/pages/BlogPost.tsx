import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import MarketingLayout from '@/components/MarketingLayout';

const extensions = [
  StarterKit,
  Image,
  LinkExt,
];

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug!)
        .eq('status', 'published')
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const html = post?.content && typeof post.content === 'object' && post.content.type
    ? generateHTML(post.content, extensions)
    : '';

  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : error || !post ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-2">Post not found</h2>
            <p className="text-muted-foreground">The article you're looking for doesn't exist or has been unpublished.</p>
          </div>
        ) : (
          <article>
            {post.cover_image_url && (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-64 sm:h-80 object-cover rounded-xl mb-8"
              />
            )}
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{post.title}</h1>
            {post.published_at && (
              <p className="text-sm text-muted-foreground mb-8">
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
              </p>
            )}
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-lg prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>
        )}
      </div>
    </MarketingLayout>
  );
}

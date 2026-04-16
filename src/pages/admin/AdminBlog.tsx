import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, ArrowLeft, Trash2, Eye, EyeOff, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import BlogEditor from '@/components/admin/BlogEditor';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: any;
  excerpt: string | null;
  cover_image_url: string | null;
  status: string;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function AdminBlog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [filter, setFilter] = useState('all');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [content, setContent] = useState<any>({});
  const [status, setStatus] = useState('draft');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      return await api<BlogPost[]>('api-misc', { params: { resource: 'blog' } }) || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title, slug, content, excerpt: excerpt || null,
        cover_image_url: coverUrl || null, status,
        published_at: status === 'published' ? new Date().toISOString() : editingPost?.published_at || null,
      };
      if (editingPost) payload.id = editingPost.id;
      await api('api-misc', { method: 'POST', params: { resource: 'blog' }, body: payload });
    },
    onSuccess: () => {
      toast.success(editingPost ? 'Post updated' : 'Post created');
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      backToList();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api('api-misc', { method: 'DELETE', params: { resource: 'blog', id } });
    },
    onSuccess: () => {
      toast.success('Post deleted');
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async (post: BlogPost) => {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await api('api-misc', { method: 'POST', params: { resource: 'blog' }, body: {
        id: post.id, status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : post.published_at,
      }});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog-posts'] }),
  });

  function openEditor(post?: BlogPost) {
    if (post) {
      setEditingPost(post);
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt || '');
      setCoverUrl(post.cover_image_url || '');
      setContent(post.content);
      setStatus(post.status);
    } else {
      setEditingPost(null);
      setTitle('');
      setSlug('');
      setExcerpt('');
      setCoverUrl('');
      setContent({});
      setStatus('draft');
    }
    setView('edit');
  }

  function backToList() {
    setView('list');
    setEditingPost(null);
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop();
    const path = `covers/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('blog-images').upload(path, file);
    if (error) { toast.error('Upload failed'); return; }
    const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(path);
    setCoverUrl(publicUrl);
  };

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter);

  // Editor view
  if (view === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={backToList}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{editingPost ? 'Edit Post' : 'New Post'}</h1>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => { setStatus('draft'); saveMutation.mutate(); }}>
              Save Draft
            </Button>
            <Button onClick={() => { setStatus('published'); saveMutation.mutate(); }}>
              Publish
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <Input
            placeholder="Post title"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (!editingPost) setSlug(slugify(e.target.value));
            }}
            className="text-lg font-semibold"
          />
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">/blog/</span>
            <Input
              value={slug}
              onChange={e => setSlug(slugify(e.target.value))}
              className="max-w-xs"
              placeholder="post-slug"
            />
          </div>
          <Textarea
            placeholder="Short excerpt (optional)"
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
          />

          {/* Cover image */}
          <div className="flex items-center gap-3">
            {coverUrl ? (
              <div className="relative">
                <img src={coverUrl} alt="Cover" className="h-20 w-36 object-cover rounded-lg" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={() => setCoverUrl('')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground border border-dashed rounded-lg px-4 py-3 hover:bg-muted/50">
                <ImageIcon className="h-4 w-4" />
                Add cover image
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            )}
          </div>

          <BlogEditor content={content} onChange={setContent} />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => openEditor()}>
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({posts.filter(p => p.status === 'published').length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({posts.filter(p => p.status === 'draft').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No posts yet. Click "New Post" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(post => (
            <Card key={post.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                {post.cover_image_url && (
                  <img src={post.cover_image_url} alt="" className="h-12 w-20 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditor(post)}>
                  <p className="font-medium truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                  {post.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleStatus.mutate(post)}
                  title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {post.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete post?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(post.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

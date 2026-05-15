import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

const AdminAnnouncements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const data = await api<Announcement[]>('api-misc', { params: { resource: 'announcements' } });
    if (data) setAnnouncements(data);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !user) return;
    setCreating(true);
    try {
      await api('api-misc', { method: 'POST', params: { resource: 'announcements' }, body: { title, content } });
      setTitle('');
      setContent('');
      load();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setCreating(false);
  };

  const toggleActive = async (ann: Announcement) => {
    await api('api-misc', { method: 'POST', params: { resource: 'announcements' }, body: { id: ann.id, is_active: !ann.is_active } });
    load();
  };

  const handleDelete = async (id: string) => {
    await api('api-misc', { method: 'DELETE', params: { resource: 'announcements', id } });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Announcements</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-sm">New Announcement</h2>
          <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Content..." value={content} onChange={e => setContent(e.target.value)} rows={3} />
          <Button onClick={handleCreate} disabled={creating}>
            <Plus className="h-4 w-4 mr-2" />
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {announcements.map(ann => (
          <Card key={ann.id}>
            <CardContent className="p-4 flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="font-medium text-sm">{ann.title}</p>
                <p className="text-xs text-muted-foreground">{ann.content}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(ann.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <Switch checked={ann.is_active} onCheckedChange={() => toggleActive(ann)} />
                <Button variant="ghost" size="sm" onClick={() => handleDelete(ann.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No announcements yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;

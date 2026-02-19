import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Upload, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAudit } from '@/hooks/useAdminAudit';

interface Poster {
  id: string;
  title: string;
  image_url: string;
  date: string;
  created_at: string;
}

const AdminDawah = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { logAction } = useAdminAudit();

  const loadPosters = async () => {
    const { data } = await supabase.from('dakwah_posters').select('*').order('date', { ascending: false });
    if (data) setPosters(data);
  };

  useEffect(() => { loadPosters(); }, []);

  const handleUpload = async () => {
    if (!file || !title || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('dakwah-posters').upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from('dakwah-posters').getPublicUrl(path);

      const { error: insertErr } = await supabase.from('dakwah_posters').insert({
        title,
        image_url: publicUrl,
        date,
        created_by: user.id,
      });
      if (insertErr) throw insertErr;

      await logAction('upload_poster', 'dakwah_poster', path, { title });
      toast({ title: 'Poster uploaded' });
      setTitle(''); setFile(null);
      loadPosters();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleDelete = async (poster: Poster) => {
    const { error } = await supabase.from('dakwah_posters').delete().eq('id', poster.id);
    if (!error) {
      await logAction('delete_poster', 'dakwah_poster', poster.id);
      loadPosters();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Da'wah Posters</h1>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Upload New Poster</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Input placeholder="Poster title" value={title} onChange={e => setTitle(e.target.value)} />
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <div className="flex gap-2">
              <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="flex-1" />
              <Button onClick={handleUpload} disabled={uploading || !file || !title} size="sm">
                <Upload className="h-4 w-4 mr-1" />{uploading ? '...' : 'Upload'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posters.map(p => (
          <Card key={p.id} className="overflow-hidden">
            <img src={p.image_url} alt={p.title} className="w-full h-48 object-cover" />
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(p)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {posters.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No posters uploaded yet.</p>}
      </div>
    </div>
  );
};

export default AdminDawah;

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Upload, Plus, ImageIcon } from 'lucide-react';
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
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { logAction } = useAdminAudit();

  const loadPosters = async () => {
    const data = await api<Poster[]>('api-misc', { params: { resource: 'dakwah' } });
    if (data) setPosters(data);
  };

  useEffect(() => { loadPosters(); }, []);

  // Generate preview when file changes
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || !title.trim() || !user) {
      toast({ title: 'Missing fields', description: 'Please enter a title and select an image.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // 1. Upload file to storage
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('dakwah-posters')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadErr) {
        console.error('Storage upload error:', uploadErr);
        throw new Error(`Upload failed: ${uploadErr.message}`);
      }

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage.from('dakwah-posters').getPublicUrl(path);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      // 3. Insert record via API
      await api('api-misc', { method: 'POST', params: { resource: 'dakwah' }, body: {
        title: title.trim(), image_url: publicUrl, date,
      }});

      // 4. Log audit action
      await logAction('upload_poster', 'dakwah_poster', path, { title: title.trim() });

      toast({ title: 'Poster uploaded successfully!' });
      setTitle('');
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadPosters();
    } catch (err: any) {
      console.error('Upload flow error:', err);
      toast({ title: 'Upload Error', description: err.message || 'Something went wrong', variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleDelete = async (poster: Poster) => {
    try {
      // Extract file path from URL to delete from storage too
      const urlParts = poster.image_url.split('/dakwah-posters/');
      const filePath = urlParts[urlParts.length - 1];

      // Delete from database first
      const { error } = await supabase.from('dakwah_posters').delete().eq('id', poster.id);
      if (error) throw error;

      // Delete from storage (best effort)
      if (filePath) {
        await supabase.storage.from('dakwah-posters').remove([filePath]);
      }

      await logAction('delete_poster', 'dakwah_poster', poster.id);
      toast({ title: 'Poster deleted' });
      loadPosters();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Da'wah Posters</h1>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Upload New Poster</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Poster title" value={title} onChange={e => setTitle(e.target.value)} />
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {file && (
                <p className="text-xs text-muted-foreground">
                  {file.name} ({(file.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
            <Button onClick={handleUpload} disabled={uploading || !file || !title.trim()} size="sm">
              <Upload className="h-4 w-4 mr-1" />{uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          {/* Preview */}
          {preview && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Preview:</p>
              <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-lg border" />
            </div>
          )}
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
        {posters.length === 0 && (
          <div className="col-span-full text-center py-8">
            <ImageIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No posters uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDawah;

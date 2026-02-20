import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, LogOut, Save, Camera, Mail, MapPin, User, Shield } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useNavigate } from 'react-router-dom';
import FamilyPrivacySettings from '@/components/family/FamilyPrivacySettings';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name, city, country, avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || '');
          setCity(data.city || '');
          setCountry(data.country || '');
          setAvatarUrl(data.avatar_url || null);
        }
      });
  }, [user]);

  const getInitials = () => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 2MB allowed', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const url = `${publicUrl}?t=${Date.now()}`;

    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    setAvatarUrl(url);
    setUploading(false);
    toast({ title: 'Avatar updated!' });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, city, country })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Profile" icon={UserCircle} />

      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Avatar & Name Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : null}
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          {uploading && <p className="text-xs text-muted-foreground mt-2">Uploading…</p>}
          <h1 className="text-xl font-bold mt-3">{displayName || 'Muslim User'}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {joinedDate && (
            <p className="text-xs text-muted-foreground mt-1">Joined {joinedDate}</p>
          )}
        </div>

        {/* Account Info (read-only) */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account</h2>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm truncate">{user?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Auth Provider</p>
                <p className="text-sm capitalize">{user?.app_metadata?.provider || 'email'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable Profile */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Edit Profile</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Display Name
                </label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> City
                  </label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Country
                  </label>
                  <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" />
                </div>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Family Privacy */}
        <FamilyPrivacySettings />

        {/* Sign Out */}
        <Button variant="destructive" onClick={handleLogout} className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </main>
      <div className="h-20" />
    </div>
  );
};

export default Settings;

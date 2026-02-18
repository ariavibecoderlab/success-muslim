import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, LogOut, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditableText from '@/components/cms/EditableText';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name, city, country')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || '');
          setCity(data.city || '');
          setCountry(data.country || '');
        }
      });
  }, [user]);

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

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center">
          <span className="text-lg font-bold text-primary flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Profile
          </span>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        <EditableText elementKey="settings.title" defaultText="Settings" tag="h1" className="text-2xl font-bold" />

        <Card>
          <CardContent className="p-6 space-y-4">
            <EditableText elementKey="settings.profile" defaultText="Profile" tag="h2" className="font-semibold text-sm" />
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Email</label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Display Name</label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">City</label>
                  <Input value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Country</label>
                  <Input value={country} onChange={e => setCountry(e.target.value)} />
                </div>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

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

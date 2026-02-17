import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, ShieldOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  display_name: string | null;
  city: string | null;
  country: string | null;
  is_disabled: boolean;
  created_at: string;
}

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setProfiles(data);
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleDisable = async (profile: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_disabled: !profile.is_disabled })
      .eq('id', profile.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      loadUsers();
    }
  };

  const toggleModerator = async (userId: string, hasMod: boolean) => {
    if (hasMod) {
      await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'moderator');
    } else {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'moderator' as any });
    }
    toast({ title: hasMod ? 'Moderator removed' : 'Moderator assigned' });
  };

  const filtered = profiles.filter(p =>
    (p.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
    p.id.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Badge variant="secondary">{profiles.length} users</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{p.display_name || 'Unknown'}</p>
                  {p.is_disabled && <Badge variant="destructive" className="text-[10px]">Disabled</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.city && p.country ? `${p.city}, ${p.country}` : 'No location'} · Joined {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleModerator(p.id, false)}
                  title="Toggle moderator"
                >
                  <Shield className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDisable(p)}
                >
                  {p.is_disabled ? <ShieldOff className="h-4 w-4 text-destructive" /> : <ShieldOff className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;

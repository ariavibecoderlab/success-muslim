import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShieldOff, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAudit } from '@/hooks/useAdminAudit';

interface Profile {
  id: string;
  display_name: string | null;
  city: string | null;
  country: string | null;
  is_disabled: boolean;
  created_at: string;
  onboarding_completed: boolean | null;
  focus_areas: any;
  consistency_level: string | null;
}

const PAGE_SIZE = 25;

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<'created_at' | 'display_name'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const { toast } = useToast();
  const { logAction } = useAdminAudit();

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setProfiles(data);
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleDisable = async (profile: Profile) => {
    const { error } = await supabase.from('profiles').update({ is_disabled: !profile.is_disabled }).eq('id', profile.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction(profile.is_disabled ? 'enable_user' : 'disable_user', 'user', profile.id);
      loadUsers();
    }
  };

  const filtered = useMemo(() => {
    let list = profiles.filter(p =>
      (p.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search)
    );
    list.sort((a, b) => {
      const va = (a as any)[sortBy] || '';
      const vb = (b as any)[sortBy] || '';
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [profiles, search, sortBy, sortAsc]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const exportCSV = () => {
    const headers = ['Name', 'Country', 'City', 'Onboarded', 'Focus Areas', 'Joined', 'Disabled'];
    const rows = filtered.map(p => [
      p.display_name || '', p.country || '', p.city || '',
      p.onboarding_completed ? 'Yes' : 'No',
      Array.isArray(p.focus_areas) ? p.focus_areas.join('; ') : '',
      new Date(p.created_at).toLocaleDateString(),
      p.is_disabled ? 'Yes' : 'No'
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (col: 'created_at' | 'display_name') => {
    if (sortBy === col) setSortAsc(!sortAsc);
    else { setSortBy(col); setSortAsc(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2 items-center">
          <Badge variant="secondary">{filtered.length} users</Badge>
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-3.5 w-3.5 mr-1" />CSV</Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('display_name')}>Name {sortBy === 'display_name' && (sortAsc ? '↑' : '↓')}</th>
                  <th className="text-left p-3 hidden md:table-cell">Country</th>
                  <th className="text-left p-3 hidden lg:table-cell">Focus</th>
                  <th className="text-left p-3 hidden sm:table-cell">Onboarded</th>
                  <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('created_at')}>Joined {sortBy === 'created_at' && (sortAsc ? '↑' : '↓')}</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.display_name || 'Unknown'}</span>
                        {p.is_disabled && <Badge variant="destructive" className="text-[10px]">Disabled</Badge>}
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{p.country || '—'}</td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {Array.isArray(p.focus_areas) ? p.focus_areas.slice(0, 2).join(', ') : '—'}
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <Badge variant={p.onboarding_completed ? 'default' : 'secondary'} className="text-[10px]">
                        {p.onboarding_completed ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => toggleDisable(p)} title={p.is_disabled ? 'Enable' : 'Disable'}>
                        <ShieldOff className={`h-4 w-4 ${p.is_disabled ? 'text-destructive' : ''}`} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button size="sm" variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

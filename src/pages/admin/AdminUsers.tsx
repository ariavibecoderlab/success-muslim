import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, ShieldOff, Download, ChevronLeft, ChevronRight, Users, UserCheck, UserX, Activity, Copy, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAudit } from '@/hooks/useAdminAudit';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  display_name: string | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  is_disabled: boolean;
  created_at: string;
  onboarding_completed: boolean | null;
  onboarding_step: number | null;
  focus_areas: any;
  consistency_level: string | null;
  avatar_url: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

interface LastActive {
  user_id: string;
  last_active: string;
}

interface UserActivityEntry {
  id: string;
  action: string;
  module: string;
  created_at: string;
  metadata: any;
}

const PAGE_SIZE = 25;

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [lastActiveMap, setLastActiveMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<'created_at' | 'display_name' | 'last_active'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterOnboarding, setFilterOnboarding] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivityEntry[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const { toast } = useToast();
  const { logAction } = useAdminAudit();

  const loadData = useCallback(async () => {
    const [profilesRes, rolesRes, lastActiveRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*'),
      supabase.rpc('admin_user_last_active'),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (rolesRes.data) setRoles(rolesRes.data as UserRole[]);
    if (lastActiveRes.data) {
      const map: Record<string, string> = {};
      (lastActiveRes.data as LastActive[]).forEach(r => { map[r.user_id] = r.last_active; });
      setLastActiveMap(map);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const loadUserActivity = async (userId: string) => {
    setLoadingActivity(true);
    const { data } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    setUserActivity(data || []);
    setLoadingActivity(false);
  };

  const getRoleForUser = (userId: string): string => {
    const r = roles.find(r => r.user_id === userId);
    return r ? r.role : 'user';
  };

  const countries = useMemo(() => {
    const set = new Set(profiles.map(p => p.country).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [profiles]);

  const toggleDisable = async (profile: Profile) => {
    const { error } = await supabase.from('profiles').update({ is_disabled: !profile.is_disabled }).eq('id', profile.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction(profile.is_disabled ? 'enable_user' : 'disable_user', 'user', profile.id);
      loadData();
      if (selectedUser?.id === profile.id) {
        setSelectedUser({ ...profile, is_disabled: !profile.is_disabled });
      }
    }
  };

  const assignRole = async (userId: string, newRole: string) => {
    const existing = roles.find(r => r.user_id === userId);
    if (newRole === 'user') {
      // Remove role entry (default = user)
      if (existing) {
        await supabase.from('user_roles').delete().eq('id', existing.id);
        await logAction('remove_role', 'user', userId, { old_role: existing.role });
      }
    } else {
      if (existing) {
        await (supabase as any).from('user_roles').update({ role: newRole }).eq('id', existing.id);
        await logAction('change_role', 'user', userId, { old_role: existing.role, new_role: newRole });
      } else {
        await (supabase as any).from('user_roles').insert({ user_id: userId, role: newRole });
        await logAction('assign_role', 'user', userId, { new_role: newRole });
      }
    }
    loadData();
  };

  const filtered = useMemo(() => {
    let list = profiles.filter(p => {
      const matchSearch = (p.display_name || '').toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
      const matchCountry = filterCountry === 'all' || p.country === filterCountry;
      const matchOnboarding = filterOnboarding === 'all' || (filterOnboarding === 'yes' ? p.onboarding_completed : !p.onboarding_completed);
      const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? !p.is_disabled : p.is_disabled);
      const userRole = getRoleForUser(p.id);
      const matchRole = filterRole === 'all' || userRole === filterRole;
      return matchSearch && matchCountry && matchOnboarding && matchStatus && matchRole;
    });
    list.sort((a, b) => {
      let va: string, vb: string;
      if (sortBy === 'last_active') {
        va = lastActiveMap[a.id] || '';
        vb = lastActiveMap[b.id] || '';
      } else {
        va = (a as any)[sortBy] || '';
        vb = (b as any)[sortBy] || '';
      }
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [profiles, search, sortBy, sortAsc, filterCountry, filterOnboarding, filterRole, filterStatus, roles, lastActiveMap]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Summary stats
  const totalUsers = profiles.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const activeToday = useMemo(() => {
    return Object.values(lastActiveMap).filter(d => d.startsWith(todayStr)).length;
  }, [lastActiveMap, todayStr]);
  const onboardedCount = profiles.filter(p => p.onboarding_completed).length;
  const disabledCount = profiles.filter(p => p.is_disabled).length;

  const exportCSV = () => {
    const headers = ['Name', 'Gender', 'Country', 'City', 'Onboarded', 'Consistency', 'Focus Areas', 'Role', 'Last Active', 'Joined', 'Disabled'];
    const rows = filtered.map(p => [
      p.display_name || '', p.gender || '', p.country || '', p.city || '',
      p.onboarding_completed ? 'Yes' : 'No',
      p.consistency_level || '',
      Array.isArray(p.focus_areas) ? p.focus_areas.join('; ') : '',
      getRoleForUser(p.id),
      lastActiveMap[p.id] ? new Date(lastActiveMap[p.id]).toISOString() : '',
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

  const handleSort = (col: 'created_at' | 'display_name' | 'last_active') => {
    if (sortBy === col) setSortAsc(!sortAsc);
    else { setSortBy(col); setSortAsc(false); }
  };

  const openUserDetail = (profile: Profile) => {
    setSelectedUser(profile);
    loadUserActivity(profile.id);
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: 'Copied', description: 'User ID copied to clipboard' });
  };

  const roleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'destructive' as const;
    if (role === 'moderator') return 'default' as const;
    return 'secondary' as const;
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <div><p className="text-2xl font-bold">{totalUsers}</p><p className="text-xs text-muted-foreground">Total Users</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <div><p className="text-2xl font-bold">{activeToday}</p><p className="text-xs text-muted-foreground">Active Today</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <UserCheck className="h-5 w-5 text-primary" />
          <div><p className="text-2xl font-bold">{totalUsers > 0 ? Math.round((onboardedCount / totalUsers) * 100) : 0}%</p><p className="text-xs text-muted-foreground">Onboarded</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <UserX className="h-5 w-5 text-destructive" />
          <div><p className="text-2xl font-bold">{disabledCount}</p><p className="text-xs text-muted-foreground">Disabled</p></div>
        </CardContent></Card>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterCountry} onValueChange={v => { setFilterCountry(v); setPage(0); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterOnboarding} onValueChange={v => { setFilterOnboarding(v); setPage(0); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Onboarding" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Onboarded</SelectItem>
              <SelectItem value="no">Not Onboarded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={v => { setFilterRole(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('display_name')}>Name {sortBy === 'display_name' && (sortAsc ? '↑' : '↓')}</th>
                  <th className="text-left p-3 hidden md:table-cell">Role</th>
                  <th className="text-left p-3 hidden md:table-cell">Country</th>
                  <th className="text-left p-3 hidden sm:table-cell">Onboarded</th>
                  <th className="text-left p-3 cursor-pointer hidden lg:table-cell" onClick={() => handleSort('last_active')}>Last Active {sortBy === 'last_active' && (sortAsc ? '↑' : '↓')}</th>
                  <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('created_at')}>Joined {sortBy === 'created_at' && (sortAsc ? '↑' : '↓')}</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(p => {
                  const role = getRoleForUser(p.id);
                  const la = lastActiveMap[p.id];
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 cursor-pointer" onClick={() => openUserDetail(p)}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.display_name || 'Unknown'}</span>
                          {p.is_disabled && <Badge variant="destructive" className="text-[10px]">Disabled</Badge>}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge variant={roleBadgeVariant(role)} className="text-[10px] capitalize">{role}</Badge>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{p.country || '—'}</td>
                      <td className="p-3 hidden sm:table-cell">
                        <Badge variant={p.onboarding_completed ? 'default' : 'secondary'} className="text-[10px]">
                          {p.onboarding_completed ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {la ? formatDistanceToNow(new Date(la), { addSuffix: true }) : '—'}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => toggleDisable(p)} title={p.is_disabled ? 'Enable' : 'Disable'}>
                          <ShieldOff className={`h-4 w-4 ${p.is_disabled ? 'text-destructive' : ''}`} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {paged.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No users found</td></tr>
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

      {/* User Detail Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={open => { if (!open) setSelectedUser(null); }}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
          </SheetHeader>
          {selectedUser && (
            <div className="space-y-6 mt-4">
              {/* Profile header */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    (selectedUser.display_name || '?')[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{selectedUser.display_name || 'Unknown'}</p>
                  <button onClick={() => copyId(selectedUser.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <span className="truncate max-w-[180px]">{selectedUser.id}</span>
                    <Copy className="h-3 w-3 flex-shrink-0" />
                  </button>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Gender</p><p className="capitalize">{selectedUser.gender || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">Country</p><p>{selectedUser.country || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">City</p><p>{selectedUser.city || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">Consistency</p><p className="capitalize">{selectedUser.consistency_level || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">Onboarding</p><p>{selectedUser.onboarding_completed ? `Completed` : `Step ${selectedUser.onboarding_step || 0}`}</p></div>
                <div><p className="text-muted-foreground text-xs">Joined</p><p>{new Date(selectedUser.created_at).toLocaleDateString()}</p></div>
                <div><p className="text-muted-foreground text-xs">Last Active</p><p>{lastActiveMap[selectedUser.id] ? formatDistanceToNow(new Date(lastActiveMap[selectedUser.id]), { addSuffix: true }) : '—'}</p></div>
              </div>

              {/* Focus areas */}
              {Array.isArray(selectedUser.focus_areas) && selectedUser.focus_areas.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Focus Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedUser.focus_areas.map((a: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Management */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Role</p>
                <Select value={getRoleForUser(selectedUser.id)} onValueChange={v => assignRole(selectedUser.id, v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Disable/Enable */}
              <Button variant={selectedUser.is_disabled ? 'default' : 'destructive'} size="sm" className="w-full" onClick={() => toggleDisable(selectedUser)}>
                <ShieldOff className="h-4 w-4 mr-2" />
                {selectedUser.is_disabled ? 'Enable Account' : 'Disable Account'}
              </Button>

              {/* Activity Log */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Recent Activity</p>
                {loadingActivity ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : userActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity recorded</p>
                ) : (
                  <div className="space-y-2">
                    {userActivity.map(a => (
                      <div key={a.id} className="border rounded-md p-2 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">{a.action}</span>
                          <span className="text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                        </div>
                        <span className="text-muted-foreground">{a.module}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminUsers;

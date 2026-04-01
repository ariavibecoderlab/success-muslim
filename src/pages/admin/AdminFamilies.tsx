import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UsersRound, GraduationCap, ChevronRight, ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type FamilyOverview = {
  total_groups: number;
  total_families: number;
  total_classes: number;
  total_members: number;
  largest_groups: {
    id: string;
    name: string;
    group_type: string;
    created_at: string;
    member_count: number;
  }[];
};

type MemberInfo = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  joined_at: string;
};

const AdminFamilies = () => {
  const [data, setData] = useState<FamilyOverview | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    supabase.rpc('admin_family_overview').then(({ data: d }) => {
      if (d) setData(d as unknown as FamilyOverview);
    });
  }, []);

  const viewGroup = async (id: string, name: string) => {
    setSelectedGroup({ id, name });
    setLoadingMembers(true);
    const { data: m } = await supabase.rpc('admin_family_members', { _family_id: id });
    if (m) setMembers(m as unknown as MemberInfo[]);
    setLoadingMembers(false);
  };

  const kpis = [
    { label: 'Total Groups', value: data?.total_groups ?? 0, icon: UsersRound, color: 'text-primary' },
    { label: 'Families', value: data?.total_families ?? 0, icon: Users, color: 'text-emerald-500' },
    { label: 'Classes', value: data?.total_classes ?? 0, icon: GraduationCap, color: 'text-blue-500' },
    { label: 'Total Members', value: data?.total_members ?? 0, icon: Users, color: 'text-violet-500' },
  ];

  if (selectedGroup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedGroup(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{selectedGroup.name}</h1>
        </div>

        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Members ({members.length})</h2>
            {loadingMembers ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : members.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(m => (
                    <TableRow key={m.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={m.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">{(m.display_name || '?')[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{m.display_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                          {m.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(m.joined_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No members found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Family & Class Management</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(c => (
          <Card key={c.label} className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${c.color}`}><c.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xl font-bold">{c.value.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4">All Groups</h2>
          {(data?.largest_groups?.length ?? 0) > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data!.largest_groups.map(g => (
                  <TableRow key={g.id} className="cursor-pointer" onClick={() => viewGroup(g.id, g.name)}>
                    <TableCell className="font-medium">{g.name}</TableCell>
                    <TableCell>
                      <Badge variant={g.group_type === 'class' ? 'secondary' : 'outline'} className="text-xs">
                        {g.group_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{g.member_count}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {new Date(g.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground">No groups yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFamilies;

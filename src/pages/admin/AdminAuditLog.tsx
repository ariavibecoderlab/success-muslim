import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

type AuditEntry = {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  admin_name?: string;
};

const AdminAuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await api<AuditEntry[]>('api-admin', { params: { resource: 'audit-log' } });
      if (data) setEntries(data);
    };
    load();
  }, []);

  const filtered = entries.filter(e =>
    !search || e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.admin_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.target_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Log</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search actions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
        <CardContent className="p-5">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-sm">{e.admin_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{e.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {e.target_type && <span>{e.target_type}</span>}
                      {e.target_id && <span className="ml-1 text-xs opacity-60">({e.target_id.slice(0, 8)}…)</span>}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No audit entries found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLog;
